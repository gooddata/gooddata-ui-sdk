// (C) 2007-2019 GoodData Corporation
declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

declare module "*.svg" {
    const value: any;
    export default value;
}

declare module "*.json" {
    const value: any;
    export default value;
}

declare module "custom-event" {
    export default CustomEvent;
}
