// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IErrorProps, convertError, isContractExpiredSdkError } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectDashboardLoading } from "../../../model/store/loading/loadingSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { useDashboardExportData } from "../../export/useExportData.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { type IDashboardProps } from "../types.js";

import { DashboardContractExpired } from "./DashboardContractExpired.js";
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
        // The dashboard did not get far enough to set up its own IntlProvider (that happens in
        // DashboardInner), so the error rendering brings its own.
        return (
            <IntlWrapper locale={props.config?.locale}>
                <DashboardLoadingError error={error} ErrorComponent={ErrorComponent} />
            </IntlWrapper>
        );
    }

    if (loading || !result) {
        // In export mode, emit the loading export status right away so that the exporter
        // can tell the rendering has started even before any dashboard data is loaded.
        // The element is a hidden sibling (same as the gd-dashboard-meta export data),
        // so it cannot affect the layout of the loading indicator.
        return (
            <>
                {exportData ? <div style={{ display: "none" }} {...exportData} /> : null}
                <LoadingComponent className="sdk-dashboard-loading s-loading" />
            </>
        );
    }

    return <DashboardInner {...props} />;
}

function DashboardLoadingError({
    error,
    ErrorComponent,
}: {
    error: Error;
    ErrorComponent: ComponentType<IErrorProps>;
}) {
    const sdkError = convertError(error);

    if (isContractExpiredSdkError(sdkError)) {
        return <DashboardContractExpired tier={sdkError.tier} />;
    }

    return <ErrorComponent message={error.message} />;
}
