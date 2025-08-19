// (C) 2021-2025 GoodData Corporation

import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { isDataError } from "../../../../_staging/errors/errorPredicates.js";
import {
    selectCanCreateAutomation,
    selectExecutionResultByRef,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import {
    AlertingDisabledReason,
    IInsightMenuItem,
    SchedulingDisabledReason,
    XLSXDisabledReason,
    getDefaultInsightMenuItems,
} from "../../insightMenu/index.js";

type UseInsightMenuConfig = {
    insight?: IInsight;
    widget: IInsightWidget;
    exportCSVEnabled: boolean;
    exportXLSXEnabled: boolean;
    exportCSVRawEnabled: boolean;
    isExporting: boolean;
    isExportRawVisible: boolean;
    isExportVisible: boolean;
    isExportPngImageVisible: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
    onExportRawCSV: () => void;
    onScheduleExport: () => void;
    onScheduleManagementExport: () => void;
    onExportPowerPointPresentation: () => void;
    onExportPdfPresentation: () => void;
    onExportPngImage: () => void;
    isScheduleExportVisible: boolean;
    isScheduleExportManagementVisible: boolean;
    isAlertingVisible: boolean;
    alertingDisabled: boolean;
    scheduleExportDisabled: boolean;
    scheduleExportManagementDisabled: boolean;
    scheduleExportDisabledReason?: SchedulingDisabledReason;
    alertingDisabledReason?: AlertingDisabledReason;
    exportPdfPresentationDisabled: boolean;
    exportPowerPointPresentationDisabled: boolean;
    exportPngImageDisabled: boolean;
    xlsxDisabledReason?: XLSXDisabledReason;
};

export const useInsightMenu = (
    config: UseInsightMenuConfig,
): { menuItems: IInsightMenuItem[]; isMenuOpen: boolean; openMenu: () => void; closeMenu: () => void } => {
    const { insight, widget } = config;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setIsMenuOpen(false), []);
    const openMenu = useCallback(() => setIsMenuOpen(true), []);

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useDefaultMenuItems(config, setIsMenuOpen);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider && insight
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "view")
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu]);

    return { menuItems, isMenuOpen, openMenu, closeMenu };
};

function useDefaultMenuItems(config: UseInsightMenuConfig, setIsMenuOpen: Dispatch<SetStateAction<boolean>>) {
    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExporting,
        onExportCSV,
        onExportRawCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        isAlertingVisible,
        alertingDisabled,
        scheduleExportDisabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabledReason,
        alertingDisabledReason,
        widget,
        isExportRawVisible,
        isExportVisible,
        isExportPngImageVisible,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
        xlsxDisabledReason,
    } = config;

    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);

    return useMemo<IInsightMenuItem[]>(() => {
        return getDefaultInsightMenuItems(
            intl,
            {
                exportCSVDisabled: !exportCSVEnabled,
                exportXLSXDisabled: !exportXLSXEnabled,
                exportCSVRawDisabled: !exportCSVRawEnabled,
                isExporting,
                scheduleExportManagementDisabled,
                scheduleExportDisabled,
                scheduleExportDisabledReason,
                isExportRawVisible,
                isExportVisible,
                isExportPngImageVisible,
                onExportCSV: () => {
                    setIsMenuOpen(false);
                    onExportCSV();
                },
                onExportRawCSV: () => {
                    setIsMenuOpen(false);
                    onExportRawCSV();
                },
                onExportXLSX: () => {
                    setIsMenuOpen(false);
                    onExportXLSX();
                },
                onScheduleExport: () => {
                    setIsMenuOpen(false);
                    onScheduleExport();
                },
                onScheduleManagementExport: () => {
                    setIsMenuOpen(false);
                    onScheduleManagementExport();
                },
                onExportPdfPresentation: () => {
                    setIsMenuOpen(false);
                    onExportPdfPresentation();
                },
                onExportPowerPointPresentation: () => {
                    setIsMenuOpen(false);
                    onExportPowerPointPresentation();
                },
                onExportPngImage: () => {
                    setIsMenuOpen(false);
                    onExportPngImage();
                },
                isScheduleExportVisible,
                isScheduleExportManagementVisible,
                isDataError: isDataError(execution?.error),
                isAlertingVisible,
                alertingDisabled,
                alertingDisabledReason,
                canCreateAutomation,
                exportPdfPresentationDisabled,
                exportPowerPointPresentationDisabled,
                exportPngImageDisabled,
                xlsxDisabledReason,
            },
            execution,
        );
    }, [
        intl,
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabled,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        isAlertingVisible,
        alertingDisabled,
        isExportVisible,
        setIsMenuOpen,
        onExportCSV,
        onExportRawCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        scheduleExportDisabledReason,
        alertingDisabledReason,
        canCreateAutomation,
        isExportRawVisible,
        isExportPngImageVisible,
        isExporting,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        execution,
        exportPngImageDisabled,
        xlsxDisabledReason,
    ]);
}
