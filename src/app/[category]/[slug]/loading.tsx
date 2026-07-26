// Next.js automatically wraps page.tsx in a Suspense boundary and renders
// this while the article is being fetched during client-side navigation.
// On a direct/first load there's no navigation to wait on, so this never
// even flashes — the server sends the finished page. On an in-app link
// click, this shows for exactly as long as the real fetch takes, not a
// fixed timer.
export default function ArticleLoading() {
  return (
    <div className="fixed left-0 right-0 bottom-0 top-14 flex flex-col items-center justify-center bg-white z-40">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center text-neutral-400 font-bold tracking-wide select-none">
          <span className="text-3xl ml-1 uppercase">nurr</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}