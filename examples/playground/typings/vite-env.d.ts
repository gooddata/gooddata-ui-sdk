// (C) 2024-2025 GoodData Corporation

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_TIGER_API_TOKEN: string;
    readonly VITE_WORKSPACE: string;
    readonly VITE_DASHBOARD: string;
    readonly VITE_INSIGHT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
