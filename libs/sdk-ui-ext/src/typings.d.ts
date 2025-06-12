// (C) 2007-2022 GoodData Corporation
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
