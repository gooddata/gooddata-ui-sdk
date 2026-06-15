// (C) 2022-2026 GoodData Corporation

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectDashboardLoading } from "../../../model/store/loading/loadingSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { useDashboardExportData } from "../../export/useExportData.js";
import { type IDashboardProps } from "../types.js";

import { DashboardInner } from "./DashboardInner.js";

export function DashboardLoading(props: IDashboardProps) {
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();
    // The render mode and the settings are set in the store only after the dashboard
    // initialization finishes, so both must be read from the config here.
    const isEarlyExportStatusEnabled = Boolean(props.config?.settings?.enableExportTimeoutFix);
    const exportData = useDashboardExportData(
        isEarlyExportStatusEnabled ? props.config?.initialRenderMode : undefined,
        "loading",
        "root",
    );

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (loading || !result) {
        // In export mode, emit the loading export status right away so that the exporter
        // can tell the rendering has started even before any dashboard data is loaded.
        // The element is a hidden sibling (same as the gd-dashboard-meta export data),
        // so it cannot affect the layout of the loading indicator.
        return (
            <>
                {exportData ? <div style={{ display: "none" }} {...exportData} /> : null}
                <LoadingComponent />
            </>
        );
    }

    return <DashboardInner {...props} />;
}
