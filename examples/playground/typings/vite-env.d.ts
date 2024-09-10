// (C) 2024 GoodData Corporation

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_TIGER_API_TOKEN: string;
    readonly VITE_WORKSPACE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
