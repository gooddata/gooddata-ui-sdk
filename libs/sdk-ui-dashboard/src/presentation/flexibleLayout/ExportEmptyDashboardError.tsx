// (C) 2020-2025 GoodData Corporation

import { EmptyDashboardError } from "./EmptyDashboardError.js";
import { useDashboardExportData } from "../export/index.js";

export function ExportEmptyDashboardError() {
    const exportData = useDashboardExportData("export", "empty", "root");
    return (
        <div {...exportData}>
            <EmptyDashboardError />
        </div>
    );
}
