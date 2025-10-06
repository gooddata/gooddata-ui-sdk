// (C) 2022-2025 GoodData Corporation

import { ReactNode, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { IconType, UiIcon, useMediaQuery } from "@gooddata/sdk-ui-kit";

import {
    selectCanCreateAutomation,
    selectCanExportPdf,
    selectCanExportTabular,
    selectDashboardTitle,
    selectDeleteVisible,
    selectEnableAutomationManagement,
    selectEnableDashboardTabularExport,
    selectEnableSnapshotExport,
    selectFilterViewsVisible,
    selectIsNewDashboard,
    selectIsReadOnly,
    selectLayoutHasAnalyticalWidgets,
    selectMenuButtonItemsVisibility,
    selectPdfExportVisible,
    selectSaveAsVisible,
    selectSettings,
    selectSettingsVisible,
    selectSlideShowExportVisible,
    uiActions,
    useDashboardAlerts,
    useDashboardDispatch,
    useDashboardScheduledEmails,
    useDashboardSelector,
} from "../../../model/index.js";
import { useExportXlsxDialogContext } from "../../dashboardContexts/ExportXlsxDialogContext.js";
import { IMenuButtonItem } from "../types.js";
import { useExportDashboardToPdf } from "./useExportDashboardToPdf.js";
import { useExportDashboardToPdfPresentation } from "./useExportDashboardToPdfPresentation.js";
import { useExportDashboardToPowerPointPresentation } from "./useExportDashboardToPowerPointPresentation.js";
import { useExportToTabular } from "./useExportToTabular.js";

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

function MenuIcon({ type }: { type: IconType }) {
    return <UiIcon type={type} size={16} color="complementary-5" ariaHidden />;
}

/**
 * @internal
 */
export function useDefaultMenuItems(): IMenuButtonItem[] {
    const intl = useIntl();
    const isMobile = useMediaQuery("mobileDevice");
    const isSmall = useMediaQuery("<=md");
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isEmptyLayout = !useDashboardSelector(selectLayoutHasAnalyticalWidgets); // we need at least one non-custom widget there
    const settings = useDashboardSelector(selectSettings);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);

    const {
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        numberOfAvailableDestinations,
        defaultOnScheduleEmailing,
        defaultOnScheduleEmailingManagement,
    } = useDashboardScheduledEmails();

    const {
        defaultOnAlertingManagement: defaultOnAlertsManagement,
        isAlertManagementVisible: isAlertsManagementVisible,
    } = useDashboardAlerts();

    const dispatch = useDashboardDispatch();
    const openSaveAsDialog = useCallback(() => dispatch(uiActions.openSaveAsDialog()), [dispatch]);
    const openDeleteDialog = useCallback(() => dispatch(uiActions.openDeleteDialog()), [dispatch]);
    const openSettingsDialog = useCallback(() => dispatch(uiActions.openSettingsDialog()), [dispatch]);
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

    const defaultOnSettings = useCallback(() => {
        openSettingsDialog();
    }, [openSettingsDialog]);

    const { exportDashboardToPdf, exportDashboardToPdfStatus } = useExportDashboardToPdf();
    const defaultOnExportToPdf = useCallback(() => {
        if (isNewDashboard) {
            return;
        }
        exportDashboardToPdf();
    }, [exportDashboardToPdf, isNewDashboard]);

    const { exportToTabular, exportToTabularStatus } = useExportToTabular();
    const { openDialog, closeDialog } = useExportXlsxDialogContext();
    const defaultOnExportToExcel = useCallback(() => {
        if (isNewDashboard) {
            return;
        }
        openDialog({
            onSubmit: (data) => {
                closeDialog();
                exportToTabular(
                    data.mergeHeaders ?? true,
                    data.includeFilterContext ?? true,
                    undefined,
                    dashboardTitle,
                    "XLSX",
                );
            },
            headline: intl.formatMessage({ id: "options.menu.export.dialog.EXCEL" }),
            mergeHeaders: Boolean(settings?.["cellMergedByDefault"] ?? true),
            mergeHeadersTitle: null,
            includeFilterContext: Boolean(settings?.["activeFiltersByDefault"] ?? true),
            filterContextVisible: true,
            filterContextTitle: null,
            filterContextText: intl.formatMessage({ id: "options.menu.export.dialog.includeExportInfo" }),
        });
    }, [
        isNewDashboard,
        openDialog,
        intl,
        settings?.["cellMergedByDefault"],
        settings?.["activeFiltersByDefault"],
        closeDialog,
        exportToTabular,
        dashboardTitle,
    ]);

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
    const isAutomationManagementEnabled = useDashboardSelector(selectEnableAutomationManagement);
    const enableSnapshotExport = useDashboardSelector(selectEnableSnapshotExport);

    const isExportVisible = useDashboardSelector(selectSlideShowExportVisible);
    const isPdfExportVisible = useDashboardSelector(selectPdfExportVisible);
    const canExportPdf = useDashboardSelector(selectCanExportPdf);
    const canExportTabular = useDashboardSelector(selectCanExportTabular);

    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    const isFilterViewsEnabled = useDashboardSelector(selectFilterViewsVisible);
    const isFilterViewsVisible = isMobile && isFilterViewsEnabled;

    const isDeleteVisible = useDashboardSelector(selectDeleteVisible);

    // Do not show save as new button in menu item when it is already shown as a standalone top bar button.
    const isSaveAsVisible = useDashboardSelector(selectSaveAsVisible);
    const isSaveAsDisabled = isEmptyLayout || isNewDashboard || isReadOnly;

    const isSettingsVisible = useDashboardSelector(selectSettingsVisible);
    const isSettingsDisabled = isReadOnly;

    const isInProgress =
        exportDashboardToPdfStatus === "running" ||
        exportToTabularStatus === "running" ||
        exportDashboardToPdfPresentationStatus === "running" ||
        exportDashboardToPptPresentationStatus === "running";

    const isSnapshotPdfExportVisible =
        (menuButtonItemsVisibility.pdfExportButton ?? true) &&
        canExportPdf &&
        isExportVisible &&
        enableSnapshotExport;
    const isSlideshowPdfExportVisible =
        (menuButtonItemsVisibility.pdfExportButton ?? true) && canExportPdf && isExportVisible;
    const isSlideshowPptxExportVisible =
        (menuButtonItemsVisibility.powerPointExportButton ?? true) && canExportPdf && isExportVisible;
    const isXlsxExportVisible =
        (menuButtonItemsVisibility.excelExportButton ?? true) &&
        isEnableDashboardTabularExport &&
        canExportTabular;

    const disabledTooltip = isInProgress
        ? intl.formatMessage({ id: "options.menu.export.in.progress" })
        : undefined;

    return useMemo<IMenuButtonItem[]>(() => {
        if (isNewDashboard) {
            return buildMenuItemList([
                // settings section
                [
                    {
                        type: "button",
                        itemId: "settings_item", // careful, also a s- class selector, do not change
                        disabled: isSettingsDisabled,
                        visible: isSmall && isSettingsVisible,
                        itemName: intl.formatMessage({ id: "options.menu.settings" }),
                        onClick: defaultOnSettings,
                        icon: "gd-icon-settings",
                    },
                ],
            ]);
        }
        return buildMenuItemList([
            // settings section
            [
                {
                    type: "button",
                    itemId: "settings_item", // careful, also a s- class selector, do not change
                    disabled: isSettingsDisabled,
                    visible: isSmall && isSettingsVisible,
                    itemName: intl.formatMessage({ id: "options.menu.settings" }),
                    onClick: defaultOnSettings,
                    icon: "gd-icon-settings",
                },
            ],
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
                    icon: <MenuIcon type="copy" />,
                    opensDialog: true,
                },
            ],
            // alerts section
            [
                {
                    type: "button",
                    itemId: "alerts-edit-item", // careful, this is also used as a selector in tests, do not change
                    itemName: canCreateAutomation
                        ? isAutomationManagementEnabled
                            ? intl.formatMessage({ id: "options.menu.alert" })
                            : intl.formatMessage({ id: "options.menu.alerts.edit" })
                        : intl.formatMessage({ id: "options.menu.alerts.edit.noCreatePermissions" }),
                    onClick: defaultOnAlertsManagement,
                    visible: isAlertsManagementVisible,
                    icon: "gd-icon-bell",
                    opensDialog: true,
                },
            ],
            // schedules section
            [
                {
                    type: "button",
                    itemId: "schedule-email-item", // careful, this is also used as a selector in tests, do not change
                    itemName: intl.formatMessage({ id: "options.menu.schedule.email" }),
                    onClick: defaultOnScheduleEmailing,
                    visible: isScheduledEmailingVisible && !isAutomationManagementEnabled,
                    tooltip:
                        numberOfAvailableDestinations === 0
                            ? intl.formatMessage(
                                  { id: "options.menu.schedule.email.tooltip" },
                                  {
                                      a: (chunk: ReactNode) => (
                                          <a href="/settings" rel="noopener noreferrer" target="_blank">
                                              {chunk}
                                          </a>
                                      ),
                                  },
                              )
                            : undefined,
                    icon: "gd-icon-clock",
                    opensDialog: true,
                },
                {
                    type: "button",
                    itemId: "schedule-email-edit-item", // careful, this is also used as a selector in tests, do not change
                    itemName: canCreateAutomation
                        ? isAutomationManagementEnabled
                            ? intl.formatMessage({ id: "options.menu.schedule.email" })
                            : intl.formatMessage({ id: "options.menu.schedule.email.edit" })
                        : intl.formatMessage({ id: "options.menu.schedule.email.edit.noCreatePermissions" }),
                    onClick: defaultOnScheduleEmailingManagement,
                    visible: isScheduledManagementEmailingVisible,
                    icon:
                        canCreateAutomation && !isAutomationManagementEnabled ? (
                            <MenuIcon type="list" />
                        ) : (
                            "gd-icon-clock"
                        ),
                    opensDialog: true,
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
                    opensDialog: true,
                },
                {
                    type: "button",
                    itemId: "list-filter-views",
                    itemName: intl.formatMessage({ id: "options.menu.listFilterViews" }),
                    onClick: openFilterViewsListDialog,
                    visible: isFilterViewsVisible,
                    icon: <MenuIcon type="list" />,
                    opensDialog: true,
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
                    visible:
                        isSnapshotPdfExportVisible ||
                        isSlideshowPdfExportVisible ||
                        isSlideshowPptxExportVisible ||
                        isXlsxExportVisible,
                    icon: "gd-icon-download",
                    items: [
                        {
                            type: "button",
                            itemId: "pdf-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                            onClick: defaultOnExportToPdf,
                            visible: isSnapshotPdfExportVisible,
                            disabled: isInProgress,
                            tooltip: disabledTooltip,
                            icon: "gd-icon-type-pdf",
                        },
                        {
                            type: "button",
                            itemId: "pdf-presentation-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.presentation.PDF" }),
                            onClick: defaultOnExportToPdfPresentation,
                            visible: isSlideshowPdfExportVisible,
                            disabled: isInProgress,
                            tooltip: disabledTooltip,
                            icon: "gd-icon-type-pdf",
                        },
                        {
                            type: "button",
                            itemId: "pptx-presentation-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.presentation.PPTX" }),
                            onClick: defaultOnExportToPowerPointPresentation,
                            visible: isSlideshowPptxExportVisible,
                            disabled: isInProgress,
                            tooltip: disabledTooltip,
                            icon: "gd-icon-type-slides",
                        },
                        {
                            type: "button",
                            itemId: "excel-export-item", // careful, this is also used as a selector in tests, do not change
                            itemName: intl.formatMessage({ id: "options.menu.export.EXCEL" }),
                            onClick: defaultOnExportToExcel,
                            visible: isXlsxExportVisible,
                            disabled: isInProgress,
                            tooltip: disabledTooltip,
                            icon: "gd-icon-type-sheet",
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
        isInProgress,
        canCreateAutomation,
        isSettingsVisible,
        isSettingsDisabled,
        defaultOnSettings,
        isSmall,
        isSnapshotPdfExportVisible,
        isSlideshowPdfExportVisible,
        isSlideshowPptxExportVisible,
        isXlsxExportVisible,
        isAutomationManagementEnabled,
        enableSnapshotExport,
    ]);
}
