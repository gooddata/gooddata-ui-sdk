// (C) 2007-2026 GoodData Corporation

declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

declare module "*.svg" {
    const value: any;
    // oxlint-disable-next-line eslint-js/no-restricted-exports
    export default value;
}

declare module "*.json" {
    const value: any;
    // oxlint-disable-next-line eslint-js/no-restricted-exports
    export default value;
}
