// (C) 2026 GoodData Corporation

// Monaco lazily spawns one web worker of its own (label `editorWorkerService`) for the work it keeps
// off the UI thread: diff computation, word-based suggestions, link detection. We never construct it,
// so its script URL comes from Monaco's bundler fallback in
// `monaco-editor/esm/vs/editor/browser/services/editorWorkerService.js`:
//
//     new URL("../../common/services/editorWebWorkerMain.js", import.meta.url)
//
// Bundlers read a bare `new URL(..., import.meta.url)` (not wrapped in `new Worker(...)`) as a plain
// *asset* reference, so they copy or inline the untouched 544 B entry instead of bundling it. The
// worker then fails on its own first relative import:
//
//     Failed to load worker script for label: editorWorkerService.
//     TypeError: Failed to resolve module specifier "../../../base/common/worker/webWorkerBootstrap.js".
//
// The fix is to hand Monaco a properly bundled worker. The build of this package bundles the entry
// with its whole dependency graph into the self-contained `worker/monaco-editor-worker.js` and wraps
// the same code into a string module (see the `build-worker` script). sdk-ui-geo ships its MapLibre
// worker the same way. Nothing here depends on a bundler feature, so the package works in any bundler
// and in the Vite dev server, which pre-bundles it from node_modules.

/**
 * URL of the self-contained editor worker file that this package ships, relative to this module.
 *
 * @remarks
 * The relative path is the same from `src/MaqlEditor/monaco/` and from `esm/MaqlEditor/monaco/`, so
 * it also holds when a dev server serves this package from its sources. webpack and Vite recognise
 * the `new URL("...", import.meta.url)` pattern and emit the file as an asset. A pre-bundled
 * dependency, other bundlers and a Module Federation remote on another origin leave a URL that does
 * not exist or that the page cannot start a worker from. The URL must therefore be checked before
 * the worker starts, see {@link resolveEditorWorkerUrl}.
 *
 * @internal
 */
export function getBundledEditorWorkerUrl(): string {
    return new URL("../../../worker/monaco-editor-worker.js", import.meta.url).href;
}

/**
 * How long the check of the bundled worker file may take before the inline worker is used instead.
 */
const WORKER_FILE_CHECK_TIMEOUT_MS = 5000;

/**
 * Tells whether the worker can start from the URL directly: the URL is a same-origin `http(s)` URL
 * and the server has the file as JavaScript.
 *
 * @remarks
 * A cross-origin URL is not used even when the file exists: the browser does not start a worker from
 * another origin, which is the case of this editor loaded from a Module Federation remote. The same
 * holds for a same-origin URL that redirects to another origin.
 *
 * The MIME type is checked because single-page application servers often answer a missing file with
 * `index.html` and status 200, and browsers do not start a module worker from HTML.
 */
async function isReachableSameOriginScript(url: string): Promise<boolean> {
    const pageOrigin = typeof location === "undefined" ? undefined : location.origin;

    if (!pageOrigin) {
        return false;
    }

    let parsed: URL;

    try {
        parsed = new URL(url);
    } catch {
        return false;
    }

    if (!/^https?:$/.test(parsed.protocol) || parsed.origin !== pageOrigin) {
        return false;
    }

    try {
        const response = await fetch(url, {
            method: "HEAD",
            signal: AbortSignal.timeout(WORKER_FILE_CHECK_TIMEOUT_MS),
        });

        return (
            response.ok &&
            (!response.url || new URL(response.url).origin === pageOrigin) &&
            /^(text|application)\/(javascript|ecmascript)\b/.test(response.headers.get("content-type") ?? "")
        );
    } catch {
        return false;
    }
}

/**
 * Makes a worker URL from the worker code this package ships inline. The Blob URL carries the origin
 * of the page, so the worker starts from it on any page. The URL is never revoked: Monaco creates its
 * worker lazily and the one Blob lives as long as the page.
 */
async function createInlineWorkerUrl(): Promise<string> {
    const { default: source } = await import("../../../worker/monaco-editor-worker.source.js");

    return URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
}

/**
 * Resolves the URL the editor worker starts from: the bundled worker file when the bundler emitted
 * it next to the page, the inline worker otherwise.
 *
 * @param assetUrl - URL of the bundled worker file, defaults to {@link getBundledEditorWorkerUrl}
 * @internal
 */
export async function resolveEditorWorkerUrl(
    assetUrl: string = getBundledEditorWorkerUrl(),
): Promise<string> {
    return (await isReachableSameOriginScript(assetUrl)) ? assetUrl : createInlineWorkerUrl();
}

type MonacoEnvironment = NonNullable<typeof globalThis.MonacoEnvironment>;
type TrustedTypesPolicy = ReturnType<NonNullable<MonacoEnvironment["createTrustedTypesPolicy"]>>;

/**
 * Name of the Trusted Types policy that turns the worker URL into a `TrustedScriptURL`. A page whose
 * content security policy lists the allowed policy names must allow this one.
 *
 * @internal
 */
export const EDITOR_WORKER_TRUSTED_TYPES_POLICY = "gdMetricEditorWorker";

/**
 * Creates the Trusted Types policy for the worker URL the way Monaco creates its own: through the
 * host's `MonacoEnvironment.createTrustedTypesPolicy` when it has one, through the browser otherwise.
 * Without the policy, a page that enforces Trusted Types does not start a worker from a plain string.
 * Monaco itself already uses the name `defaultWorkerFactory`, and a page that enforces Trusted Types
 * may not allow a second policy of the same name.
 */
function createWorkerUrlPolicy(): TrustedTypesPolicy {
    const options = { createScriptURL: (url: string) => url };
    const environment = globalThis.MonacoEnvironment;
    // The DOM typings of TypeScript do not declare Trusted Types; the browser API has the same shape.
    const { trustedTypes } = globalThis as {
        trustedTypes?: { createPolicy: NonNullable<MonacoEnvironment["createTrustedTypesPolicy"]> };
    };

    try {
        return environment?.createTrustedTypesPolicy
            ? environment.createTrustedTypesPolicy(EDITOR_WORKER_TRUSTED_TYPES_POLICY, options)
            : trustedTypes?.createPolicy(EDITOR_WORKER_TRUSTED_TYPES_POLICY, options);
    } catch (error) {
        console.error("The Trusted Types policy of the metric editor worker cannot be created.", error);
        return undefined;
    }
}

/**
 * Creates the `MonacoEnvironment.getWorker` that starts the bundled editor worker.
 *
 * @remarks
 * The worker URL and the Trusted Types policy are created once and shared by all workers, which is why
 * the cache lives in the created function: tests create their own, the runtime uses one. A failed
 * resolution is not cached, so the next worker tries again.
 *
 * @param resolveWorkerUrl - resolves the URL of the worker this package ships
 * @internal
 */
export function createEditorWorkerFactory(
    resolveWorkerUrl: () => Promise<string> = resolveEditorWorkerUrl,
): (workerId: string, label: string) => Promise<Worker> {
    let resolvedWorkerUrl: Promise<string> | undefined;
    let workerUrlPolicy: { value: TrustedTypesPolicy } | undefined;

    return async (_workerId, label) => {
        resolvedWorkerUrl ??= resolveWorkerUrl().catch((error: unknown) => {
            resolvedWorkerUrl = undefined;
            throw error;
        });
        const workerUrl = await resolvedWorkerUrl;
        workerUrlPolicy ??= { value: createWorkerUrlPolicy() };
        const scriptUrl = workerUrlPolicy.value?.createScriptURL?.(workerUrl) ?? workerUrl;

        return new Worker(scriptUrl, { type: "module", name: label });
    };
}

const getEditorWorker = createEditorWorkerFactory();

/**
 * Point Monaco at the bundled `editorWorkerService` worker.
 *
 * Called at module load (below) as well as before each `monaco.editor.create`, because Monaco can
 * reach for the worker at any point after its own modules are evaluated — not only once an editor
 * exists. Whoever gets there first wins; the rest are no-ops.
 *
 * Idempotent, and never overrides a `MonacoEnvironment` already provided by the hosting
 * application — a host that wires its own workers stays in charge.
 */
export function setupMonacoWorkers(): void {
    if (globalThis.MonacoEnvironment?.getWorker || globalThis.MonacoEnvironment?.getWorkerUrl) {
        return;
    }

    globalThis.MonacoEnvironment = {
        ...globalThis.MonacoEnvironment,
        getWorker: getEditorWorker,
    };
}

// Run on import, so the environment is in place before any Monaco module can ask for the worker —
// importers of this module get the wiring by depending on it, without an ordering contract.
setupMonacoWorkers();
