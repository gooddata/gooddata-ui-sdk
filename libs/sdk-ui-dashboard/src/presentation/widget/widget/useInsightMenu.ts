// (C) 2021-2022 GoodData Corporation

import { useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { selectExecutionResultByRef, useDashboardSelector, selectRenderMode } from "../../../model";

import { RenderMode } from "../../../types";
import { isDataError } from "../../../_staging/errors/errorPredicates";
import { useDashboardCustomizationsContext, InsightMenuItemsProvider } from "../../dashboardContexts";
import {
    getDefaultInsightMenuItems,
    getDefaultLegacyInsightMenuItems,
    getDefaultInsightEditMenuItems,
    IInsightMenuItem,
} from "../insightMenu";

type UseInsightMenuConfig = {
    insight: IInsight;
    widget: IInsightWidget;
    exportCSVEnabled: boolean;
    exportXLSXEnabled: boolean;
    scheduleExportEnabled: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
    onScheduleExport: () => void;
    isScheduleExportVisible: boolean;
};

export const useInsightMenu = (
    config: UseInsightMenuConfig,
): { menuItems: IInsightMenuItem[]; isMenuOpen: boolean; openMenu: () => void; closeMenu: () => void } => {
    const { insight, widget } = config;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setIsMenuOpen(false), []);
    const openMenu = useCallback(() => setIsMenuOpen(true), []);

    const renderMode = useDashboardSelector(selectRenderMode);

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useDefaultMenuItems(config, renderMode, insightMenuItemsProvider, setIsMenuOpen);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, renderMode)
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu, renderMode]);

    return { menuItems, isMenuOpen, openMenu, closeMenu };
};

function useDefaultMenuItems(
    config: UseInsightMenuConfig,
    renderMode: RenderMode,
    insightMenuItemsProvider: InsightMenuItemsProvider | undefined,
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>,
) {
    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        scheduleExportEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        isScheduleExportVisible,
        widget,
    } = config;

    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));

    return useMemo<IInsightMenuItem[]>(() => {
        const defaultMenuItemsGetter = getDefaultMenuItemsGetter(renderMode, !insightMenuItemsProvider);

        return defaultMenuItemsGetter(intl, {
            widget,
            exportCSVDisabled: !exportCSVEnabled,
            exportXLSXDisabled: !exportXLSXEnabled,
            scheduleExportDisabled: !scheduleExportEnabled,
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
            isScheduleExportVisible,
            isDataError: isDataError(execution?.error),
        });
    }, [
        widget,
        renderMode,
        insightMenuItemsProvider,
        execution,
        exportCSVEnabled,
        exportXLSXEnabled,
        scheduleExportEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        isScheduleExportVisible,
        intl,
        setIsMenuOpen,
    ]);
}

function getDefaultMenuItemsGetter(renderMode: RenderMode, useLegacyMenu: boolean) {
    if (useLegacyMenu) {
        return getDefaultLegacyInsightMenuItems;
    }
    switch (renderMode) {
        case "edit":
            return getDefaultInsightEditMenuItems;
        case "view":
            return getDefaultInsightMenuItems;
    }
}
