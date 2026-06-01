// (C) 2026 GoodData Corporation

/* eslint-disable no-restricted-exports */

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    COMMITHASH: string;
}

declare const SDK_BACKEND: "tiger";
declare const PRODUCTION: boolean;
declare const TIGER_API_TOKEN: string | undefined;

declare module "*.svg" {
    const content: string;
    export default content;
}
