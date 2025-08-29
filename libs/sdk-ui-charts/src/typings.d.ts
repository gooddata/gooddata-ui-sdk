// (C) 2007-2025 GoodData Corporation
declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

declare module "*.json" {
    const value: any;
    export default value;
}

declare module "custom-event" {
    export default CustomEvent;
}
