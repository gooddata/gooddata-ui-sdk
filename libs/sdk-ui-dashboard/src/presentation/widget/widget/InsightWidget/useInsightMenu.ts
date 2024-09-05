// (C) 2021-2024 GoodData Corporation

import { useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { selectExecutionResultByRef, useDashboardSelector } from "../../../../model/index.js";

import { isDataError } from "../../../../_staging/errors/errorPredicates.js";
import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import {
    getDefaultInsightMenuItems,
    IInsightMenuItem,
    AlertingDisabledReason,
    SchedulingDisabledReason,
} from "../../insightMenu/index.js";

type UseInsightMenuConfig = {
    insight: IInsight;
    widget: IInsightWidget;
    exportCSVEnabled: boolean;
    exportXLSXEnabled: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
    onScheduleExport: () => void;
    onScheduleManagementExport: () => void;
    isScheduleExportVisible: boolean;
    isScheduleExportManagementVisible: boolean;
    isAlertingVisible: boolean;
    alertingDisabled: boolean;
    scheduleExportDisabled: boolean;
    scheduleExportManagementDisabled: boolean;
    scheduleExportDisabledReason?: SchedulingDisabledReason;
    alertingDisabledReason?: AlertingDisabledReason;
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
        return insightMenuItemsProvider
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "view")
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu]);

    return { menuItems, isMenuOpen, openMenu, closeMenu };
};

function useDefaultMenuItems(config: UseInsightMenuConfig, setIsMenuOpen: Dispatch<SetStateAction<boolean>>) {
    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        isAlertingVisible,
        alertingDisabled,
        scheduleExportDisabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabledReason,
        alertingDisabledReason,
        widget,
    } = config;

    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));

    return useMemo<IInsightMenuItem[]>(() => {
        return getDefaultInsightMenuItems(intl, {
            exportCSVDisabled: !exportCSVEnabled,
            exportXLSXDisabled: !exportXLSXEnabled,
            scheduleExportManagementDisabled,
            scheduleExportDisabled,
            scheduleExportDisabledReason,
            onExportCSV: () => {
                setIsMenuOpen(false);
                onExportCSV();
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
            isScheduleExportVisible,
            isScheduleExportManagementVisible,
            isDataError: isDataError(execution?.error),
            isAlertingVisible,
            alertingDisabled,
            alertingDisabledReason,
        });
    }, [
        intl,
        exportCSVEnabled,
        exportXLSXEnabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabled,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        execution?.error,
        isAlertingVisible,
        alertingDisabled,
        setIsMenuOpen,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        scheduleExportDisabledReason,
        alertingDisabledReason,
    ]);
}
