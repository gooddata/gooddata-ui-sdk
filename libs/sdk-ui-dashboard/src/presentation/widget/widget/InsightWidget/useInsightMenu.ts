// (C) 2021-2025 GoodData Corporation

import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { isDataError } from "../../../../_staging/errors/errorPredicates.js";
import {
    selectCanCreateAutomation,
    selectDashboardUserAutomationAlertsInContext,
    selectEnableAutomationManagement,
    selectExecutionResultByRef,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import {
    AlertingDisabledReason,
    DisabledReason,
    IInsightMenuItem,
    SchedulingDisabledReason,
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
    isExportPdfTabularVisible: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
    onExportRawCSV: () => void;
    onScheduleExport: () => void;
    onScheduleManagementExport: () => void;
    onAlertingManagementOpen: () => void;
    onExportPowerPointPresentation: () => void;
    onExportPdfPresentation: () => void;
    onExportPngImage: () => void;
    onExportPdfTabular: () => void;
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
    exportPdfTabularDisabled: boolean;
    disabledReason?: DisabledReason;
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
        onAlertingManagementOpen,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        onExportPdfTabular,
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
        isExportPdfTabularVisible,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
        exportPdfTabularDisabled,
        disabledReason,
    } = config;

    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const isAutomationManagementEnabled = useDashboardSelector(selectEnableAutomationManagement);
    const automations = useDashboardSelector(
        selectDashboardUserAutomationAlertsInContext(widget.localIdentifier),
    );
    const isAlertManagementVisible = isAlertingVisible && (canCreateAutomation || automations.length > 0);

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
                isExportPdfTabularVisible,
                isAutomationManagementEnabled,
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
                onAlertingManagementOpen: () => {
                    setIsMenuOpen(false);
                    onAlertingManagementOpen();
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
                onExportPdfTabular: () => {
                    setIsMenuOpen(false);
                    onExportPdfTabular();
                },
                isScheduleExportVisible,
                isScheduleExportManagementVisible,
                isDataError: isDataError(execution?.error),
                isAlertingVisible,
                isAlertManagementVisible,
                alertingDisabled,
                alertingDisabledReason,
                canCreateAutomation,
                exportPdfPresentationDisabled,
                exportPowerPointPresentationDisabled,
                exportPngImageDisabled,
                exportPdfTabularDisabled,
                disabledReason,
            },
            execution,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        isAlertManagementVisible,
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
        onExportPdfTabular,
        scheduleExportDisabledReason,
        alertingDisabledReason,
        canCreateAutomation,
        isExportRawVisible,
        isExportPngImageVisible,
        isExportPdfTabularVisible,
        isExporting,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPdfTabularDisabled,
        execution,
        exportPngImageDisabled,
        disabledReason,
    ]);
}
