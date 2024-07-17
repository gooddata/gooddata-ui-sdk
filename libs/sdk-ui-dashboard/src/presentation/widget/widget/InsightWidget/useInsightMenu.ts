// (C) 2021-2024 GoodData Corporation

import { useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { selectExecutionResultByRef, useDashboardSelector } from "../../../../model/index.js";

import { isDataError } from "../../../../_staging/errors/errorPredicates.js";
import {
    useDashboardCustomizationsContext,
    InsightMenuItemsProvider,
} from "../../../dashboardContexts/index.js";
import {
    getDefaultInsightMenuItems,
    getDefaultLegacyInsightMenuItems,
    IInsightMenuItem,
} from "../../insightMenu/index.js";

type UseInsightMenuConfig = {
    insight: IInsight;
    widget: IInsightWidget;
    exportCSVEnabled: boolean;
    exportXLSXEnabled: boolean;
    scheduleExportEnabled: boolean;
    scheduleExportManagementEnabled: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
    onScheduleExport: () => void;
    onScheduleManagementExport: () => void;
    isScheduleExportVisible: boolean;
    isScheduleExportManagementVisible: boolean;
};

export const useInsightMenu = (
    config: UseInsightMenuConfig,
): { menuItems: IInsightMenuItem[]; isMenuOpen: boolean; openMenu: () => void; closeMenu: () => void } => {
    const { insight, widget } = config;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setIsMenuOpen(false), []);
    const openMenu = useCallback(() => setIsMenuOpen(true), []);

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useDefaultMenuItems(config, insightMenuItemsProvider, setIsMenuOpen);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "view")
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu]);

    return { menuItems, isMenuOpen, openMenu, closeMenu };
};

function useDefaultMenuItems(
    config: UseInsightMenuConfig,
    insightMenuItemsProvider: InsightMenuItemsProvider | undefined,
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>,
) {
    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        scheduleExportEnabled,
        scheduleExportManagementEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        widget,
    } = config;

    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));

    return useMemo<IInsightMenuItem[]>(() => {
        const defaultMenuItemsGetter = !insightMenuItemsProvider
            ? getDefaultLegacyInsightMenuItems
            : getDefaultInsightMenuItems;

        return defaultMenuItemsGetter(intl, {
            exportCSVDisabled: !exportCSVEnabled,
            exportXLSXDisabled: !exportXLSXEnabled,
            scheduleExportDisabled: !scheduleExportEnabled,
            scheduleExportManagementDisabled: !scheduleExportManagementEnabled,
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
        });
    }, [
        insightMenuItemsProvider,
        execution,
        exportCSVEnabled,
        exportXLSXEnabled,
        scheduleExportEnabled,
        scheduleExportManagementEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        intl,
        setIsMenuOpen,
    ]);
}
