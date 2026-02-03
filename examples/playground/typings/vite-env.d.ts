// (C) 2024-2025 GoodData Corporation

/// <reference types="vite/client" />

import type { RenderMode } from "@gooddata/sdk-ui-dashboard";

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_TIGER_API_TOKEN: string;
    readonly VITE_WORKSPACE: string;
    readonly VITE_DASHBOARD: string;
    readonly VITE_DASHBOARD_INITIAL_RENDER_MODE: RenderMode;
    readonly VITE_INSIGHT: string;
    readonly VITE_MAPBOX_TOKEN: string;
    readonly VITE_AG_GRID_TOKEN: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
