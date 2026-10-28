// (C) 2007-2026 GoodData Corporation

// oxlint-disable eslint-js/no-restricted-exports

// The bundler rewrites an asset import to the emitted URL of the file.
declare module "*.png" {
    const value: string;
    export default value;
}

declare module "*.ico" {
    const value: string;
    export default value;
}

declare module "*.json" {
    const value: unknown;
    export default value;
}
