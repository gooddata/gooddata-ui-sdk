// (C) 2022-2026 GoodData Corporation

// Globals injected by Vite

declare const BACKEND_URL: string;
declare const WORKSPACE_ID: string;
declare const TIGER_API_TOKEN: string;

declare const BASEPATH: string;
declare const BUILTIN_MAPBOX_TOKEN: string;

// Runtime globals injected via window (e.g. by nginx/Docker entrypoint)
// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    WORKSPACE_ID: string;
}
