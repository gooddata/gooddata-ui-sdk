// (C) 2021-2025 GoodData Corporation

import { useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import {
    selectCanCreateAutomation,
    selectExecutionResultByRef,
    useDashboardSelector,
} from "../../../../model/index.js";

import { isDataError } from "../../../../_staging/errors/errorPredicates.js";
import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import {
    getDefaultInsightMenuItems,
    IInsightMenuItem,
    AlertingDisabledReason,
    SchedulingDisabledReason,
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
    onExportCSV: () => void;
    onExportXLSX: () => void;
    onExportRawCSV: () => void;
    onScheduleExport: () => void;
    onScheduleManagementExport: () => void;
    onExportPowerPointPresentation: () => void;
    onExportPdfPresentation: () => void;
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
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
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
                isScheduleExportVisible,
                isScheduleExportManagementVisible,
                isDataError: isDataError(execution?.error),
                isAlertingVisible,
                alertingDisabled,
                alertingDisabledReason,
                canCreateAutomation,
                exportPdfPresentationDisabled,
                exportPowerPointPresentationDisabled,
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
        scheduleExportDisabledReason,
        alertingDisabledReason,
        canCreateAutomation,
        isExportRawVisible,
        isExporting,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        execution,
    ]);
}
