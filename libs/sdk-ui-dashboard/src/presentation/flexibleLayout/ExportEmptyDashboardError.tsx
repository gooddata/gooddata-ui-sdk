// (C) 2020-2026 GoodData Corporation

import { EmptyDashboardError } from "./EmptyDashboardError.js";
import { useDashboardExportData } from "../export/useExportData.js";

export function ExportEmptyDashboardError() {
    const exportData = useDashboardExportData("export", "empty", "root");
    return (
        <div {...exportData}>
            <EmptyDashboardError />
        </div>
    );
}
