import type { FunctionResource, InstallerType } from '../../types.js';
export declare const resolveViteRoot: (entry: string) => string;
export declare function transpileFunction(resource: FunctionResource, { installer }?: {
    installer?: InstallerType;
}): Promise<{
    type: string;
    outputDir: string;
    warnings: string[];
    cleanup: () => Promise<void>;
    timings: Record<string, number>;
    bundled: boolean;
}>;
/**
 * Vite 8's `build()` wraps failures in a `BundleError` whose `message` contains
 * a "Build failed with N errors" preamble and full stack traces. The individual
 * errors on `.errors` carry the original, human-readable messages.
 */
export declare function formatBuildError(err: unknown): string;
