// (C) 2007-2019 GoodData Corporation

/* eslint-disable no-restricted-exports */

declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

declare module "*.json" {
    const value: any;
    export default value;
}
