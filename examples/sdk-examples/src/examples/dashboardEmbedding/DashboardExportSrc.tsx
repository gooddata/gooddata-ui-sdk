// (C) 2007-2018 GoodData Corporation
import React from "react";
import { useDashboardPdfExporter } from "@gooddata/sdk-ui-ext";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("aeO5PVgShc0T");

const DashboardExport: React.FC = () => {
    const { exportDashboard, status } = useDashboardPdfExporter();
    const isLoading = status === "loading";

    return status === "success" ? (
        <span>Export successful!</span>
    ) : (
        <button onClick={() => exportDashboard(dashboardRef)} disabled={isLoading}>
            {isLoading ? "Exporting..." : "Export dashboard"}
        </button>
    );
};

export default DashboardExport;
