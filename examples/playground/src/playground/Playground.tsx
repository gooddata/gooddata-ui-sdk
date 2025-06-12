// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { InsightView } from "@gooddata/sdk-ui-ext";

const dashboard = import.meta.env.VITE_DASHBOARD;
const insight = import.meta.env.VITE_INSIGHT;

export const Playground: React.FC = () => {
    if (insight) {
        return <InsightView insight={insight} />;
    }
    if (dashboard) {
        return (
            <Dashboard
                dashboard={dashboard}
                config={{
                    initialRenderMode: "view",
                }}
            />
        );
    }

    return null;
};
