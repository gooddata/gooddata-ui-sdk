// (C) 2020-2025 GoodData Corporation
import React from "react";

import { useDashboardExportData } from "../export/index.js";

import { EmptyDashboardError } from "./EmptyDashboardError.js";

export const ExportEmptyDashboardError: React.FC = () => {
    const exportData = useDashboardExportData("export", "empty", "root");
    return (
        <div {...exportData}>
            <EmptyDashboardError />
        </div>
    );
};
