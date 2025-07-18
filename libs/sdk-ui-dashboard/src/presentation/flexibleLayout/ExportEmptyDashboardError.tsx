// (C) 2020-2025 GoodData Corporation

import { useDashboardExportData } from "../export/index.js";

import { EmptyDashboardError } from "./EmptyDashboardError.js";

export function ExportEmptyDashboardError() {
    const exportData = useDashboardExportData("export", "empty", "root");
    return (
        <div {...exportData}>
            <EmptyDashboardError />
        </div>
    );
}
