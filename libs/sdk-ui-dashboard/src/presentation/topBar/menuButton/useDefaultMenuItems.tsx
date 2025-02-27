// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useMediaQuery } from "@gooddata/sdk-ui-kit";

import {
    uiActions,
    selectIsReadOnly,
    selectIsNewDashboard,
    selectLayoutHasAnalyticalWidgets,
    selectMenuButtonItemsVisibility,
    selectEnableDashboardTabularExport,
    selectEnableOrchestratedTabularExports,
    useDashboardDispatch,
    useDashboardScheduledEmails,
    useDashboardSelector,
    useDashboardAlerts,
    selectCanCreateAutomation,
    selectDeleteVisible,
    selectFilterViewsVisible,
    selectPdfExportVisible,
    selectSaveAsVisible,
    selectSlideShowExportVisible,
} from "../../../model/index.js";
import { IMenuButtonItem } from "../types.js";

import { useExportDashboardToPdf } from "./useExportDashboardToPdf.js";
import { useExportDashboardToExcel } from "./useExportDashboardToExcel.js";
import { useExportDashboardToPdfPresentation } from "./useExportDashboardToPdfPresentation.js";
import { useExportDashboardToPowerPointPresentation } from "./useExportDashboardToPowerPointPresentation.js";

// inject separator to each visible section, flat map the sections into a list of menu items
const buildMenuItemList = (menuSections: IMenuButtonItem[][]): IMenuButtonItem[] =>
    menuSections
        .filter((section) => section.some((item) => item.visible))
        .map((visibleSection, index, visibleSections) => {
            const isLastVisibleSection = index === visibleSections.length - 1;
            return isLastVisibleSection
                ? visibleSection
                : [
                      ...visibleSection,
                      {
                          type: "separator" as const,
                          itemId: `separator-${index}`,
                          visible: true,
                      },
                  ];
        })
        .flatMap((visibleSection) => visibleSection);

/**
 * @internal
 */
export function useDefaultMenuItems(): IMenuButtonItem[] {
    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isEmptyLayout = !useDashboardSelector(selectLayoutHasAnalyticalWidgets); // we need at least one non-custom widget there

    const {
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        numberOfAvailableDestinations,
        defaultOnScheduleEmailing,
        defaultOnScheduleEmailingManagement,
    } = useDashboardScheduledEmails();

    const { defaultOnAlertsManagement, isAlertsManagementVisible } = useDashboardAlerts();

    const dispatch = useDashboardDispatch();
    const openSaveAsDialog = useCallback(() => dispatch(uiActions.openSaveAsDialog()), [dispatch]);
    const openDeleteDialog = useCallback(() => dispatch(uiActions.openDeleteDialog()), [dispatch]);
    const openFilterViewsListDialog = useCallback(
        () =>
            dispatch(
                uiActions.toggleFilterViewsDialog({
                    open: true,
                    mode: "list",
                }),
            ),
        [dispatch],
    );
    const openFilterViewsAddDialog = useCallback(
        () =>
            dispatch(
                uiActions.toggleFilterViewsDialog({
                    open: true,
                    mode: "add",
                }),
            ),
        [dispatch],
    );

    const defaultOnSaveAs = useCallback(() => {
        if (isNewDashboard) {
            return;
        }

        openSaveAsDialog();
    }, [isNewDashboard, openSaveAsDialog]);

    const { exportDashboardToPdf, exportDashboardToPdfStatus } = useExportDashboardToPdf();
    const defaultOnExportToPdf = useCallback(() => {
        if (isNewDashboard) {
            return;
        }
        exportDashboardToPdf();
    }, [exportDashboardToPdf, isNewDashboard]);

    const { exportDashboardToExcel, exportDashboardToExcelStatus } = useExportDashboardToExcel();
    const defaultOnExportToExcel = useCallback(() => {
        if (isNewDashboard) {
            return;
        }
        exportDashboardToExcel();
    }, [exportDashboardToExcel, isNewDashboard]);

    const { exportDashboardToPdfPresentation, exportDashboardToPdfPresentationStatus } =
        useExportDashboardToPdfPresentation();
    const defaultOnExportToPdfPresentation = useCallback(() => {
        if (isNewDashboard) {
            return;
        }
        exportDashboardToPdfPresentation();
    }, [exportDashboardToPdfPresentation, isNewDashboard]);

    const { exportDashboardToPptPresentation, exportDashboardToPptPresentationStatus } =
        useExportDashboardToPowerPointPresentation();
    const defaultOnExportToPowerPointPresentation = useCallback(() => {
        if (isNewDashboard) {
            return;
        }
        exportDashboardToPptPresentation();
    }, [exportDashboardToPptPresentation, isNewDashboard]);

    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);

    const isEnableDashboardTabularExport = useDashboardSelector(selectEnableDashboardTabularExport);
    const isEnableOrchestratedTabularExports = useDashboardSelector(selectEnableOrchestratedTabularExports);

    const isExportVisible = useDashboardSelector(selectSlideShowExportVisible);
    const isPdfExportVisible = useDashboardSelector(selectPdfExportVisible);

    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    const isFilterViewsEnabled = useDashboardSelector(selectFilterViewsVisible);
    const isFilterViewsVisible = isMobile && isFilterViewsEnabled;

    const isDeleteVisible = useDashboardSelector(selectDeleteVisible);

    // Do not show save as new button in menu item when it is already shown as a standalone top bar button.
    const isSaveAsVisible = useDashboardSelector(selectSaveAsVisible);
    const isSaveAsDisabled = isEmptyLayout || isNewDashboard || isReadOnly;

    const isInProgress =
        exportDashboardToPdfStatus === "running" ||
        exportDashboardToExcelStatus === "running" ||
        exportDashboardToPdfPresentationStatus === "running" ||
        exportDashboardToPptPresentationStatus === "running";

    return useMemo<IMenuButtonItem[]>(() => {
        if (isNewDashboard) {
            return [];
        }
        return buildMenuItemList([
            // save as new section
            [
                {
                    type: "button",
                    itemId: "save_as_menu_item", // careful, also a s- class selector, do not change
                    disabled: isSaveAsDisabled,
                    visible: isSaveAsVisible,
                    itemName: intl.formatMessage({ id: "options.menu.save.as" }),
                    tooltip:
                        // the tooltip is only relevant to non-read only states
                        !isReadOnly && isSaveAsDisabled
                            ? intl.formatMessage({ id: "options.menu.save.as.tooltip" })
                            : undefined,
                    onClick: defaultOnSaveAs,
                    icon: "gd-icon-save-as-new",
                },
            ],
            // alerts section
            [
                {
                    type: "button",
                    itemId: "alerts-edit-item", // careful, this is also used as a selector in tests, do not change
                    itemName: canCreateAutomation
                        ? intl.formatMessage({ id: "options.menu.alerts.edit" })
                        : intl.formatMessage({ id: "options.menu.alerts.edit.noCreatePermissions" }),
                    onClick: defaultOnAlertsManagement,
                    visible: isAlertsManagementVisible,
                    icon: "gd-icon-bell",
                },
            ],
            // schedules section
            [
                {
                    type: "button",
                    itemId: "schedule-email-item", // careful, this is also used as a selector in tests, do not change
                    itemName: intl.formatMessage({ id: "options.menu.schedule.email" }),
                    onClick: defaultOnScheduleEmailing,
                    visible: isScheduledEmailingVisible,
                    tooltip:
                        numberOfAvailableDestinations === 0
                            ? intl.formatMessage(
                                  { id: "options.menu.schedule.email.tooltip" },
                                  {
                                      a: (chunk: React.ReactNode) => (
                                          <a href="/settings" rel="noopener noreferrer" target="_blank">
                                              {chunk}
                                          </a>
                                      ),
                                  },
                              )
                            : undefined,
                    icon: "gd-icon-clock",
                },
                {
                    type: "button",
                    itemId: "schedule-email-edit-item", // careful, this is also used as a selector in tests, do not change
                    itemName: canCreateAutomation
                        ? intl.formatMessage({ id: "options.menu.schedule.email.edit" })
                        : intl.formatMessage({ id: "options.menu.schedule.email.edit.noCreatePermissions" }),
                    onClick: defaultOnScheduleEmailingManagement,
                    visible: isScheduledManagementEmailingVisible,
                    icon: canCreateAutomation ? "gd-icon-list" : "gd-icon-clock",
                },
            ],
            // filter views section
            [
                {
                    type: "button",
                    itemId: "add-filter-views",
                    itemName: intl.formatMessage({ id: "options.menu.addFilterViews" }),
                    onClick: openFilterViewsAddDialog,
                    visible: isFilterViewsVisible,
                    icon: "gd-icon-filter",
                },
                {
                    type: "button",
                    itemId: "list-filter-views",
                    itemName: intl.formatMessage({ id: "options.menu.listFilterViews" }),
                    onClick: openFilterViewsListDialog,
                    visible: isFilterViewsVisible,
                    icon: "gd-icon-list",
                },
            ],
            // export section
            [
                {
                    type: "button",
                    itemId: "pdf-export-item", // careful, this is also used as a selector in tests, do not change
                    itemName: intl.formatMessage({ id: "options.menu.export_to_pdf" }),
                    onClick: defaultOnExportToPdf,
                    visible: isPdfExportVisible && !isExportVisible,
                    icon: "gd-icon-download",
                },
                {
                    type: "menu",
                    itemId: "menu-exports-list", // careful, this is also used as a selector in tests, do not change
                    itemName: intl.formatMessage({ id: "options.menu.export" }),
                    visible: isExportVisible,
                    icon: "gd-icon-download",
                    items: [
                        {
                            type: "button",
                            itemId: "pdf-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                            onClick: defaultOnExportToPdf,
                            visible: menuButtonItemsVisibility.pdfExportButton ?? true,
                            disabled: isInProgress,
                            icon: "gd-icon-download",
                        },
                        {
                            type: "button",
                            itemId: "excel-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.EXCEL" }),
                            onClick: defaultOnExportToExcel,
                            visible:
                                (menuButtonItemsVisibility.excelExportButton ?? true) &&
                                isEnableDashboardTabularExport &&
                                isEnableOrchestratedTabularExports,
                            disabled: isInProgress,
                            icon: "gd-icon-download",
                        },
                        {
                            type: "header",
                            itemId: "export-header-presentation",
                            itemName: intl.formatMessage({ id: "options.menu.export.header.presentation" }),
                        },
                        {
                            type: "button",
                            itemId: "pdf-presentation-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                            onClick: defaultOnExportToPdfPresentation,
                            visible: menuButtonItemsVisibility.pdfExportButton ?? true,
                            disabled: isInProgress,
                            icon: "gd-icon-download",
                        },
                        {
                            type: "button",
                            itemId: "pptx-presentation-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.PPTX" }),
                            onClick: defaultOnExportToPowerPointPresentation,
                            visible: menuButtonItemsVisibility.powerPointExportButton ?? true,
                            disabled: isInProgress,
                            icon: "gd-icon-download",
                        },
                    ],
                },
            ],
            // delete section
            [
                {
                    type: "button",
                    itemId: "delete_dashboard", // careful, also a s- class selector, do not change
                    itemName: intl.formatMessage({ id: "options.menu.delete" }),
                    onClick: openDeleteDialog,
                    visible: isDeleteVisible,
                    className: "delete-button",
                    icon: "gd-icon-trash",
                },
            ],
        ]);
    }, [
        isEnableDashboardTabularExport,
        isEnableOrchestratedTabularExports,
        defaultOnExportToPdf,
        defaultOnSaveAs,
        defaultOnScheduleEmailing,
        defaultOnScheduleEmailingManagement,
        defaultOnAlertsManagement,
        defaultOnExportToExcel,
        defaultOnExportToPdfPresentation,
        defaultOnExportToPowerPointPresentation,
        intl,
        isDeleteVisible,
        isFilterViewsVisible,
        isAlertsManagementVisible,
        isNewDashboard,
        isPdfExportVisible,
        isReadOnly,
        isSaveAsDisabled,
        isSaveAsVisible,
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        numberOfAvailableDestinations,
        openDeleteDialog,
        openFilterViewsAddDialog,
        openFilterViewsListDialog,
        isExportVisible,
        menuButtonItemsVisibility.pdfExportButton,
        menuButtonItemsVisibility.excelExportButton,
        menuButtonItemsVisibility.powerPointExportButton,
        isInProgress,
        canCreateAutomation,
    ]);
}
