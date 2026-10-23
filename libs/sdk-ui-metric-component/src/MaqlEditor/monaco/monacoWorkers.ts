// (C) 2026 GoodData Corporation

// Monaco lazily spawns one web worker of its own (label `editorWorkerService`) for the work it keeps
// off the UI thread: diff computation, word-based suggestions, link detection. We never construct it,
// so its script URL comes from Monaco's bundler fallback in
// `monaco-editor/esm/vs/editor/browser/services/editorWorkerService.js`:
//
//     new URL("../../common/services/editorWebWorkerMain.js", import.meta.url)
//
// Vite/rolldown sees a bare `new URL(..., import.meta.url)` (not wrapped in `new Worker(...)`), so it
// treats it as a plain *asset* reference. That entry file is 544 B — below the 4 kB
// `build.assetsInlineLimit` — so the production build inlines the untouched Monaco source as a
// `data:` URI instead of emitting a bundled worker chunk. The worker then fails on its own first
// relative import, because a `data:` URL is not a hierarchical base to resolve against:
//
//     Failed to load worker script for label: editorWorkerService.
//     TypeError: Failed to resolve module specifier "../../../base/common/worker/webWorkerBootstrap.js".
//
// The dev server never hits this: there the same `new URL(...)` yields a real http URL, so the
// worker's relative imports resolve as ordinary module requests. It surfaces only in a built bundle,
// e.g. once this editor is loaded from a Module Federation remote by the host application.
//
// The fix is to hand Monaco the URL of a properly bundled worker: `?worker&url` makes Vite bundle the
// entry with its whole dependency graph and give us the emitted chunk's URL.
//
// `getWorkerUrl` — not `getWorker` — is deliberate. Monaco wraps the URL in a same-origin blob that
// `import()`s it, which is what keeps the worker constructible while the code is served from a
// federated remote on a different origin than the host page; `new Worker(<cross-origin url>)` would
// be blocked by the browser.
//
// `?worker&url` is Vite-only. The one consumer still built with webpack (apps/gdc-dashboards, which
// reaches this lib through gdc-dashboards-runtime → gdc-analytical-designer) replaces this
// specifier with a module of its own — see webpack.monacoWorker.loader.cjs there. That module solves
// the same problem the webpack way: it bundles the entry as a real worker chunk and installs
// `MonacoEnvironment.getWorker` on import, leaving its own default export `undefined`. Because it is
// this file's first import, it runs before `setupMonacoWorkers()` below, whose `getWorker` guard then
// makes it a no-op. Do NOT add a `if (!editorWorkerUrl)` guard here to accommodate that `undefined`
// — Vite emits this import as `"" + new URL(...).href`, and the minifier drops the parentheses when
// that expression is negated (`!"" + url + ""`, a truthy string), which silently short-circuits the
// whole assignment below.
// oxlint-disable-next-line import/default -- `?worker&url` makes this module export the worker's URL as its default; the linter only sees the plain file, which has no default export
import editorWorkerUrl from "monaco-editor/editor/common/services/editorWebWorkerMain.js?worker&url";

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
        getWorkerUrl: () => editorWorkerUrl,
    };
}

// Run on import, so the environment is in place before any Monaco module can ask for the worker —
// importers of this module get the wiring by depending on it, without an ordering contract.
setupMonacoWorkers();
