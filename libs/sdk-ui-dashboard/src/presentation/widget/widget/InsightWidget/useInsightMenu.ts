// (C) 2021-2025 GoodData Corporation

import { useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import {
    selectCanCreateAutomation,
    selectExecutionResultByRef,
    useDashboardAutomations,
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
): {
    initializeMenuItems: () => void;
    isLoading: boolean;
    isInitialized: boolean;
    menuItems: IInsightMenuItem[];
    isMenuOpen: boolean;
    openMenu: () => void;
    closeMenu: () => void;
} => {
    const { insight, widget } = config;
    const { initializeAutomations, isLoading, isInitialized } = useDashboardAutomations();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setIsMenuOpen(false), [setIsMenuOpen]);
    const openMenu = useCallback(() => {
        initializeAutomations();
        setIsMenuOpen(true);
    }, [initializeAutomations, setIsMenuOpen]);

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useDefaultMenuItems(config, {
        setIsMenuOpen,
        isAutomationsInitialized: isInitialized,
        isAutomationsLoading: isLoading,
    });

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider && insight
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "view")
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu]);

    return {
        initializeMenuItems: initializeAutomations,
        isLoading,
        isInitialized,
        menuItems,
        isMenuOpen,
        openMenu,
        closeMenu,
    };
};

function useDefaultMenuItems(
    config: UseInsightMenuConfig,
    {
        setIsMenuOpen,
        isAutomationsInitialized,
        isAutomationsLoading,
    }: {
        setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
        isAutomationsInitialized: boolean;
        isAutomationsLoading: boolean;
    },
) {
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
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);

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
            canCreateAutomation,
            isAutomationsInitialized,
            isAutomationsLoading,
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
        isAutomationsInitialized,
        isAutomationsLoading,
    ]);
}
