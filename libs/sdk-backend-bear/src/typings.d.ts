// (C) 2022 GoodData Corporation
// declare package json so that we can import it even without resolveJsonModule which breaks outputs
declare module "*/package.json" {
    export const name: string;
    export const version: string;
}
