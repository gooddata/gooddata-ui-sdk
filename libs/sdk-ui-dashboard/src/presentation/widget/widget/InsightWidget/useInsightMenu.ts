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
    isExportRawVisible: boolean;
    isExportVisible: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
    onExportRawCSV: () => void;
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
        isExportRawVisible,
        isExportVisible,
    } = config;

    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);

    return useMemo<IInsightMenuItem[]>(() => {
        return getDefaultInsightMenuItems(intl, {
            exportCSVDisabled: !exportCSVEnabled,
            exportXLSXDisabled: !exportXLSXEnabled,
            scheduleExportManagementDisabled,
            scheduleExportDisabled,
            scheduleExportDisabledReason,
            isExportRawVisible,
            isExportVisible,
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
            canCreateAutomation,
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
        canCreateAutomation,
        isExportRawVisible,
    ]);
}
