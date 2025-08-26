// (C) 2024-2025 GoodData Corporation

import * as React from "react";

import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { InsightView } from "@gooddata/sdk-ui-ext";

const dashboard = import.meta.env.VITE_DASHBOARD;
const dashboardInitialRenderMode = import.meta.env.VITE_DASHBOARD_INITIAL_RENDER_MODE;
const insight = import.meta.env.VITE_INSIGHT;
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
const agGridToken = import.meta.env.VITE_AG_GRID_TOKEN;

export function Playground() {
    if (insight) {
        return <InsightView insight={insight} config={{ mapboxToken, agGridToken }} />;
    }
    if (dashboard) {
        return (
            <Dashboard
                dashboard={dashboard}
                config={{
                    initialRenderMode: dashboardInitialRenderMode ?? "view",
                    mapboxToken: mapboxToken,
                    agGridToken: agGridToken,
                }}
            />
        );
    }

    return null;
}
