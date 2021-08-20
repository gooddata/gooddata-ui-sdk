// (C) 2020 GoodData Corporation
import React, { useCallback, useState } from "react";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight, insightTitle } from "@gooddata/sdk-model";
import { FullScreenOverlay, Overlay, useMediaQuery } from "@gooddata/sdk-ui-kit";
import {
    GoodDataSdkError,
    IExportFunction,
    ILocale,
    OnExportReady,
    OnLoadingChanged,
} from "@gooddata/sdk-ui";

import {
    OnDashboardDrill,
    OnDrillDown,
    OnDrillToAttributeUrl,
    OnDrillToCustomUrl,
    OnDrillToDashboard,
    OnDrillToInsight,
} from "../../../../drill";
import { IntlWrapper } from "../../../../localization";
import { DefaultDashboardInsightWithDrillSelect } from "../DefaultDashboardInsightWithDrillSelect";
import { DOWNLOADER_ID } from "../../../../../_staging/fileUtils/downloadFile";

import { DrillDialog } from "./DrillDialog";
import { useDashboardDrillTargetsLocal } from "../useDashboardDrillTargets";
import { useInsightExport } from "../../../common";

/**
 * @internal
 */
export interface InsightDrillDialogProps {
    locale: ILocale;
    breadcrumbs: string[];
    widget: IInsightWidget;
    insight: IInsight;
    onDrill?: OnDashboardDrill;
    onDrillDown?: OnDrillDown;
    onDrillToInsight?: OnDrillToInsight;
    onDrillToDashboard?: OnDrillToDashboard;
    onDrillToAttributeUrl?: OnDrillToAttributeUrl;
    onDrillToCustomUrl?: OnDrillToCustomUrl;
    onClose: () => void;
    onBackButtonClick: () => void;
}

const overlayIgnoredClasses = [
    ".s-sort-direction-arrow",
    ".gd-export-dialog",
    ".options-menu-export-xlsx",
    ".options-menu-export-csv",
    `#${DOWNLOADER_ID}`,
];

export const InsightDrillDialog = (props: InsightDrillDialogProps): JSX.Element => {
    const {
        locale,
        breadcrumbs,
        widget,
        insight,
        onDrill,
        onClose,
        onBackButtonClick,
        onDrillDown,
        onDrillToAttributeUrl,
        onDrillToCustomUrl,
        onDrillToDashboard,
        onDrillToInsight,
    } = props;

    const isMobileDevice = useMediaQuery("mobileDevice");

    const { drillTargets, onAvailableDrillTargetsReceived } = useDashboardDrillTargetsLocal();

    const [error, setError] = useState<GoodDataSdkError | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [exportFunction, setExportFunction] = useState<IExportFunction | undefined>();

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        if (isLoading) {
            setError(undefined);
        }

        setIsLoading(isLoading);
    }, []);

    const handleExportReady = useCallback<OnExportReady>((newExportFunction) => {
        setExportFunction(() => newExportFunction); // for functions in state, we always need to use the extra lambda
    }, []);

    const modalTitle = insightTitle(insight);

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        error,
        exportFunction,
        isLoading,
        title: modalTitle,
    });

    const OverlayComponent = isMobileDevice ? FullScreenOverlay : Overlay;

    return (
        <OverlayComponent
            className="gd-drill-modal-overlay"
            isModal
            closeOnEscape
            closeOnOutsideClick
            ignoreClicksOnByClass={overlayIgnoredClasses}
            onClose={onClose}
            positionType="fixed"
        >
            <IntlWrapper locale={locale}>
                <DrillDialog
                    title={modalTitle}
                    isBackButtonVisible={breadcrumbs.length > 1}
                    onBackButtonClick={onBackButtonClick}
                    onCloseDialog={onClose}
                    breadcrumbs={breadcrumbs}
                    exportAvailable={!!exportFunction}
                    exportXLSXEnabled={exportXLSXEnabled}
                    exportCSVEnabled={exportCSVEnabled}
                    onExportXLSX={onExportXLSX}
                    onExportCSV={onExportCSV}
                    isLoading={isLoading}
                >
                    <DefaultDashboardInsightWithDrillSelect
                        insight={insight}
                        widget={widget}
                        disableWidgetImplicitDrills
                        onDrill={onDrill}
                        onDrillDown={onDrillDown}
                        onDrillToAttributeUrl={onDrillToAttributeUrl}
                        onDrillToCustomUrl={onDrillToCustomUrl}
                        onDrillToDashboard={onDrillToDashboard}
                        onDrillToInsight={onDrillToInsight}
                        drillTargets={drillTargets}
                        onAvailableDrillTargetsReceived={onAvailableDrillTargetsReceived}
                        onError={setError}
                        onLoadingChanged={handleLoadingChanged}
                        onExportReady={handleExportReady}
                    />
                </DrillDialog>
            </IntlWrapper>
        </OverlayComponent>
    );
};
