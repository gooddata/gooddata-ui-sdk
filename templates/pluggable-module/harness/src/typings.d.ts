// (C) 2026 GoodData Corporation

declare const PRODUCTION: boolean;
declare const TIGER_API_TOKEN: string | undefined;

/**
 * URL of this module's Module Federation remote entry. Injected at build time in dev;
 * in production the harness loads the remote from a relative path on the same origin.
 */
declare const APP_TEMPLATE_REMOTE_URL: string | undefined;

declare module "*.css";
declare module "*.scss";
