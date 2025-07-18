// (C) 2024-2025 GoodData Corporation

import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { InsightView } from "@gooddata/sdk-ui-ext";

const dashboard = import.meta.env.VITE_DASHBOARD;
const dashboardInitialRenderMode = import.meta.env.VITE_DASHBOARD_INITIAL_RENDER_MODE;
const insight = import.meta.env.VITE_INSIGHT;
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

export function Playground() {
    if (insight) {
        return <InsightView insight={insight} />;
    }
    if (dashboard) {
        return (
            <Dashboard
                dashboard={dashboard}
                config={{
                    initialRenderMode: dashboardInitialRenderMode ?? "view",
                    mapboxToken: mapboxToken,
                }}
            />
        );
    }

    return null;
}
