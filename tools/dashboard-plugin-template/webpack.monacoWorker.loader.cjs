// (C) 2026 GoodData Corporation

// Replaces Vite's `?worker&url` import of the Monaco editor worker, which the embedded Analytical
// Designer uses, with a worker that webpack bundles with its whole dependency graph. Copying the
// worker entry as an asset is not enough: its relative imports then resolve against the output
// root and fail at runtime. The default export stays undefined, so Monaco uses `getWorker`. A host
// callback stays in place: Monaco prefers `getWorker` over `getWorkerUrl`, so a new `getWorker` would
// hide the `getWorkerUrl` of the host.
module.exports = function monacoWorkerLoader() {
    return `
const environment = globalThis.MonacoEnvironment;
if (typeof environment?.getWorker !== "function" && typeof environment?.getWorkerUrl !== "function") {
    globalThis.MonacoEnvironment = {
        ...globalThis.MonacoEnvironment,
        getWorker: (_workerId, label) =>
            new Worker(new URL("./editorWebWorkerMain.js", import.meta.url), { name: label }),
    };
}

export default undefined;
`;
};
