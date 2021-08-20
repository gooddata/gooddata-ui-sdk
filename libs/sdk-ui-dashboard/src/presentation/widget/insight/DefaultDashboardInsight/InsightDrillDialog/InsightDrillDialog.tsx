// (C) 2020 GoodData Corporation
import React, { useCallback, useState } from "react";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight, insightTitle } from "@gooddata/sdk-model";
import {
    ExportDialog,
    FullScreenOverlay,
    Overlay,
    OverlayPositionType,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";
import { GoodDataSdkError, ILocale, OnLoadingChanged } from "@gooddata/sdk-ui";

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
import { selectSettings, useDashboardSelector } from "../../../../../model";
import { DOWNLOADER_ID } from "../../../../../_staging/fileUtils/downloadFile";

import { DrillDialog } from "./DrillDialog";
import { useDashboardDrillTargetsLocal } from "../useDashboardDrillTargets";
import { useDrillExport } from "./useDrillExport";
import { useExportHandler } from "./useExportHandler";

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

    const handleLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading) {
                setError(undefined);
            }

            setIsLoading(isLoading);
        },
        [isLoading],
    );

    const onExport = useExportHandler();

    const settings = useDashboardSelector(selectSettings);

    const modalTitle = insightTitle(insight);

    const positionType: OverlayPositionType = "fixed";

    const overlayProps = {
        className: "gd-drill-modal-overlay",
        isModal: true,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        ignoreClicksOnByClass: [
            ".s-sort-direction-arrow",
            ".gd-export-dialog",
            ".options-menu-export-xlsx",
            ".options-menu-export-csv",
            `#${DOWNLOADER_ID}`,
        ],
        onClose,
        positionType,
    };

    const {
        exportFunction,
        onExportReady,
        isExportDialogVisible,
        onExportDialogSubmit,
        onExportDialogCancel,
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
    } = useDrillExport(modalTitle, error, isLoading, onExport);

    const OverlayComponent = isMobileDevice ? FullScreenOverlay : Overlay;
    return (
        <OverlayComponent {...overlayProps}>
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
                        onExportReady={onExportReady}
                    />
                </DrillDialog>
                {isExportDialogVisible && (
                    <ExportDialog
                        onCancel={onExportDialogCancel}
                        onSubmit={onExportDialogSubmit}
                        includeFilterContext={Boolean(settings?.activeFiltersByDefault ?? true)}
                        mergeHeaders={Boolean(settings?.cellMergedByDefault ?? true)}
                        filterContextVisible={Boolean(settings?.enableActiveFilterContext ?? true)}
                    />
                )}
            </IntlWrapper>
        </OverlayComponent>
    );
};
