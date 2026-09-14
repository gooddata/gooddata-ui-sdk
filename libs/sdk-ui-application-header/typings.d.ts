// (C) 2022-2026 GoodData Corporation

// oxlint-disable eslint-js/no-restricted-exports

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    _paq: [string, ...any[]][];
}

declare module "*.svg" {
    const content: any;
    export default content;
}
