import {table as renderTable} from 'node:console'
import {existsSync, statSync} from 'node:fs'
import {isAbsolute, join} from 'node:path'
import process from 'node:process'
import {pathToFileURL} from 'node:url'
import {inspect} from 'node:util'

export function getFunctionSource(src) {
  const pathToCheck = isAbsolute(src) ? src : join(process.cwd(), src)

  if (statSync(pathToCheck).isDirectory()) {
    const indexPath = join(pathToCheck, 'index.js')
    if (!existsSync(indexPath)) {
      throw Error(`Function directory ${pathToCheck} has no index.js`)
    }
    return pathToFileURL(indexPath).href
  }
  return pathToFileURL(pathToCheck).href
}

// Monkey patch console menthods to have logs match server log format
function logPrefix(level, ...args) {
  const date = new Date()
  const shouldUseColors = process.env.FORCE_COLOR === '1'
  const message = args
    .map((arg) =>
      typeof arg === 'string' ? arg : inspect(arg, {depth: null, colors: shouldUseColors}),
    )
    .join(' ')
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${level.toUpperCase()} ${message}`
}

console.log = (...args) => {
  process.stdout.write(`${logPrefix('info', ...args)}\n`)
}

console.info = (...args) => {
  process.stdout.write(`${logPrefix('info', ...args)}\n`)
}

console.dir = (obj, options) => {
  const shouldUseColors = process.env.FORCE_COLOR === '1'
  const inspectOptions = {...options, colors: shouldUseColors}
  process.stdout.write(`${logPrefix('info', inspect(obj, inspectOptions))}\n`)
}

console.table = (data, columns) => {
  const prefix = logPrefix('info')

  // Capture table output
  const originalWrite = process.stdout.write.bind(process.stdout)
  let buffer = ''

  process.stdout.write = (chunk, _encoding, callback) => {
    buffer += chunk
    if (typeof callback === 'function') callback()
  }

  renderTable(data, columns)

  // Restore and print
  process.stdout.write = originalWrite
  for (const line of buffer.split('\n')) {
    if (line.trim()) {
      const message = `${!line.startsWith(prefix) ? `${prefix} ${line}` : line}`.trim()
      process.stdout.write(`${message}\n`)
    }
  }
}

console.warn = (...args) => {
  process.stdout.write(`${logPrefix('warn', ...args)}\n`)
}

console.error = (...args) => {
  process.stdout.write(`${logPrefix('error', ...args)}\n`)
}

/**
 * Pending nested `context.invoke` calls, keyed by correlation id. Each entry
 * holds the resolve/reject of the Promise returned to the user's handler; it is
 * settled when the matching `invoke-response` arrives from the parent.
 * @type {Map<string, {resolve: (value: unknown) => void, reject: (reason: Error) => void}>}
 */
const pendingInvokes = new Map()
let invokeSeq = 0

/**
 * `context.invoke(name, payload)` — ask the parent to execute another blueprint
 * function and resolve with its return value. Sent over IPC and correlated by id.
 * @param {string} name
 * @param {Record<string, unknown>} [payload]
 * @returns {Promise<unknown>}
 */
function invokeFunction(name, payload = {}) {
  if (typeof name !== 'string' || name.length === 0) {
    return Promise.reject(new Error('context.invoke requires a function name'))
  }
  const id = String(++invokeSeq)
  return new Promise((resolve, reject) => {
    pendingInvokes.set(id, {resolve, reject})
    process.send(JSON.stringify({type: 'invoke-request', id, name, payload}))
  })
}

// Listen for IPC messages from the parent process.
process.on('message', async (data) => {
  let jsonData = null
  try {
    jsonData = JSON.parse(data)
  } catch {
    // invalid payload so return early
    return
  }

  // Response to a nested context.invoke() — route to the awaiting Promise and stop.
  if (jsonData?.type === 'invoke-response') {
    const pending = pendingInvokes.get(jsonData.id)
    if (!pending) return
    pendingInvokes.delete(jsonData.id)
    if (jsonData.ok) {
      pending.resolve(jsonData.result?.json)
    } else {
      const {message, stack, name} = jsonData.error ?? {}
      const error = new Error(message ?? 'Nested invoke failed')
      if (stack) error.stack = stack
      if (name) error.name = name
      pending.reject(error)
    }
    return
  }

  // Otherwise this is the initial start message. Support the legacy untyped
  // `{srcPath, payload}` shape as well as the new `{type: 'start', ...}`.
  const {srcPath, payload} = jsonData
  const {context, ...event} = payload

  let logs = ''
  let errorLogs = ''
  let json = null

  // Capture stdout and stderr in-memory for the terminal `result` message, and
  // ALSO send them through to the real stdio pipes. The parent captures those
  // pipes live, so logs written before a timeout (child killed) or a
  // process.exit() aren't lost
  const originalStdoutWrite = process.stdout.write.bind(process.stdout)
  const originalStderrWrite = process.stderr.write.bind(process.stderr)

  process.stdout.write = (...args) => {
    const chunk = args[0]
    if (typeof chunk === 'string') logs += chunk
    return originalStdoutWrite(...args)
  }
  process.stderr.write = (...args) => {
    const chunk = args[0]
    if (typeof chunk === 'string') errorLogs += chunk
    return originalStderrWrite(...args)
  }

  try {
    // Import the function code
    const entry = await import(getFunctionSource(srcPath))
    const eventHandler = entry.handler || entry.default

    if (typeof eventHandler !== 'function') {
      throw new Error(
        'No valid handler found. Please provide a default export or a named export, "handler"',
      )
    }

    // Replace resources JSON with Resources API
    context.resources = createResourcesApi(context.resources)

    // Allow the handler to invoke other blueprint functions by name.
    context.invoke = invokeFunction

    json = await eventHandler({
      context,
      event,
      // mock sync-tag-invalidate done callback
      done: async (_tags) => new Response(null, {status: 204}),
    })

    // Restore streams
    process.stdout.write = originalStdoutWrite
    process.stderr.write = originalStderrWrite

    // Send result to parent
    process.send(JSON.stringify({type: 'result', json, logs, errorLogs}))
  } catch (err) {
    // Restore streams on error
    process.stdout.write = originalStdoutWrite
    process.stderr.write = originalStderrWrite

    const errorInfo = {
      type: 'result',
      json: null,
      logs,
      errorLogs,
      error: {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
      },
    }
    process.send(JSON.stringify(errorInfo))
    process.exit(1)
  }
})

/**
 * The returned proxy wraps a function so the API itself is callable.
 * @param {Record<string, ResourceEntry[]>} resources
 * @returns {ResourcesApi}
 */
export function createResourcesApi(resources) {
  const findByName = (name) => {
    for (const group of Object.values(resources)) {
      const found = group.find((r) => r.name === name)
      if (found) return found
    }
    return undefined
  }
  let allCache
  const all = () => (allCache ??= Object.values(resources).flat())

  return /** @type {ResourcesApi} */ (
    /** @type {unknown} */ (
      /*
       * The Proxy target is `findByName`, so invoking the API as a function —
       * `context.resources('my-proj')` — bypasses the `get` trap entirely and
       * calls `findByName` directly for a cross-type lookup by name.
       */
      new Proxy(findByName, {
        get: (_target, prop) => {
          // context.resources.all() — flat array of every resource across types
          if (prop === 'all') return all
          // [...context.resources] / for (const r of context.resources) — iterate all
          if (prop === Symbol.iterator) {
            return function* () {
              yield* all()
            }
          }

          /**
           * Symbol property access (other than iterator above) and `then`
           * lookups return undefined. The `then` guard prevents the API from
           * looking like a thenable, so `await context.resources` resolves to
           * the proxy itself rather than hanging or unwrapping unexpectedly.
           */
          if (typeof prop !== 'string' || prop === 'then') {
            return undefined
          }

          /**
           * context.resources.<type>(name) — per-type lookup,
           * e.g. context.resources.project('my-proj').
           * Returns a function so the caller supplies the name;
           * unknown types yield a function that always returns undefined.
           */
          return (/** @type {string} */ name) =>
            Object.hasOwn(resources, prop)
              ? resources[prop].find((r) => r.name === name)
              : undefined
        },
      })
    )
  )
}
