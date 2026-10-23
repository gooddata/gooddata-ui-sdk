// (C) 2026 GoodData Corporation

// oxlint-disable eslint-js/no-restricted-exports

// Vite resolves an import whose specifier ends in `?worker&url` to the URL of the worker chunk it
// bundles from that entry. It ships that knowledge only in `vite/client`, whose ~700 lines of
// ambient declarations — `import.meta.env`, the HMR API, CSS modules, every other asset suffix —
// are all unused here and would otherwise become part of this package's type surface. Declaring the
// one form we do use keeps that surface to exactly what `MaqlEditor/monaco/monacoWorkers.ts`
// imports, with the same shape `vite/client` gives it.
declare module "*?worker&url" {
    const src: string;
    export default src;
}
