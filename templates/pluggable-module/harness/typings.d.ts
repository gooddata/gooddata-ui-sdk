// (C) 2026 GoodData Corporation

export declare global {
    export const SDK_BACKEND: "tiger";
    export const PRODUCTION: boolean;
    export const TIGER_API_TOKEN: string | undefined;

    /**
     * URL of this module's Module Federation remote entry. Injected at build time in dev;
     * in production the harness loads the remote from a relative path on the same origin.
     */
    export const APP_TEMPLATE_REMOTE_URL: string | undefined;
}
