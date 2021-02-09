// (C) 2007-2018 GoodData Corporation
import React from "react";
import { useExportDashboardToPdf } from "@gooddata/sdk-ui-ext/esm/internal";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("aeO5PVgShc0T");

const DashboardExport: React.FC = () => {
    const { exportDashboard, status } = useExportDashboardToPdf();
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
