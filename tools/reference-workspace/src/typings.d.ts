// (C) 2007-2025 GoodData Corporation

declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

declare module "*.svg" {
    const value: any;
    // eslint-disable-next-line no-restricted-exports
    export default value;
}

declare module "*.json" {
    const value: any;
    // eslint-disable-next-line no-restricted-exports
    export default value;
}
