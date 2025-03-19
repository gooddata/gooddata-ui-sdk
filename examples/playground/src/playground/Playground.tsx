// (C) 2024 GoodData Corporation

import * as React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

const dashboard = import.meta.env.VITE_DASHBOARD;

export const Playground: React.FC = () => {
    if (!dashboard) return null;

    return (
        <Dashboard
            dashboard={dashboard}
            config={{
                initialRenderMode: "view",
            }}
        />
    );
};
