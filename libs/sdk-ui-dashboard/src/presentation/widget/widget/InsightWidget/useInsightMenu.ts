// (C) 2021-2024 GoodData Corporation

import { useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { selectExecutionResultByRef, useDashboardSelector } from "../../../../model/index.js";

import { isDataError } from "../../../../_staging/errors/errorPredicates.js";
import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import { getDefaultInsightMenuItems, IInsightMenuItem } from "../../insightMenu/index.js";

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
    isAlertingVisible: boolean;
    alertingDisabled: boolean;
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
        scheduleExportEnabled,
        scheduleExportManagementEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        isAlertingVisible,
        alertingDisabled,
        widget,
    } = config;

    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));

    //NOTE: Check if widget has localIdentifier, if not that is probably widget from old dashboard
    // and we should not allow to schedule export because we need localIdentifier to create schedule
    const noLocalIdentifier = !widget.localIdentifier;
    const scheduleExportDisabled = !scheduleExportEnabled || noLocalIdentifier;
    const scheduleExportManagementDisabled = !scheduleExportManagementEnabled;

    return useMemo<IInsightMenuItem[]>(() => {
        return getDefaultInsightMenuItems(intl, {
            exportCSVDisabled: !exportCSVEnabled,
            exportXLSXDisabled: !exportXLSXEnabled,
            scheduleExportManagementDisabled,
            scheduleExportDisabled,
            scheduleExportDisabledReason: scheduleExportDisabled
                ? noLocalIdentifier
                    ? "oldWidget"
                    : "incompatibleWidget"
                : undefined,
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
        });
    }, [
        intl,
        exportCSVEnabled,
        exportXLSXEnabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabled,
        noLocalIdentifier,
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
    ]);
}
