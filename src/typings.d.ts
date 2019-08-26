// (C) 2007-2018 GoodData Corporation
declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

declare module "*.json" {
    const value: any;
    export default value;
}

declare module "js-object-pretty-print" {
    // element can be any and is handled based on its detected type
    export function pretty(element: any, indent?: number, fromArray?: string): string;
}

declare module "fetch-cookie" {
    export default function fetchCookie(f: typeof fetch): typeof fetch;
}
