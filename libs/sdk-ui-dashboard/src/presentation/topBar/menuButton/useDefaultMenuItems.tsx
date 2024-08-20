// (C) 2022-2024 GoodData Corporation
import React, { useCallback, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { useToastMessage, useMediaQuery } from "@gooddata/sdk-ui-kit";

import {
    exportDashboardToPdf,
    selectCanCreateAnalyticalDashboard,
    selectCanExportPdf,
    selectEnableKPIDashboardExportPDF,
    selectEntitlementExportPdf,
    selectIsInEditMode,
    selectIsInViewMode,
    selectIsNewDashboard,
    selectIsReadOnly,
    selectIsSaveAsNewButtonHidden,
    selectLayoutHasAnalyticalWidgets,
    selectMenuButtonItemsVisibility,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardScheduledEmails,
    useDashboardSelector,
    useDashboardAlerts,
    selectDashboardId,
    selectEnableFilterViews,
    selectDisableFilterViews,
} from "../../../model/index.js";
import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { IMenuButtonItem } from "../types.js";
import { messages } from "../../../locales.js";
import { selectIsSaveAsNewButtonVisible } from "../buttonBar/button/index.js";

const useExportDashboard = () => {
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const lastExportMessageId = useRef("");
    const { run: exportDashboard } = useDashboardCommandProcessing({
        commandCreator: exportDashboardToPdf,
        successEvent: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            lastExportMessageId.current = addProgress(
                messages.messagesExportResultStart,
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            );
        },
        onSuccess: (event) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }
            addSuccess(messages.messagesExportResultSuccess);
            downloadFile(event.payload.result);
        },
        onError: (error) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }

            if (isProtectedDataError(error)) {
                addError(messages.messagesExportResultRestrictedError);
            } else {
                addError(messages.messagesExportResultError);
            }
        },
    });
    return exportDashboard;
};

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

    const dashboard = useDashboardSelector(selectDashboardId);
    const {
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        defaultOnScheduleEmailing,
        defaultOnScheduleEmailingManagement,
        numberOfAvailableWebhooks,
    } = useDashboardScheduledEmails({
        dashboard,
    });
    const { defaultOnAlertsManagement, isAlertsManagementVisible } = useDashboardAlerts({
        dashboard,
    });

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

    const exportDashboard = useExportDashboard();
    const defaultOnExportToPdf = useCallback(() => {
        if (isNewDashboard) {
            return;
        }
        exportDashboard();
    }, [exportDashboard, isNewDashboard]);

    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const canCreateDashboard = useDashboardSelector(selectCanCreateAnalyticalDashboard);
    const isSaveAsNewHidden = useDashboardSelector(selectIsSaveAsNewButtonHidden);
    const isStandaloneSaveAsNewButtonVisible = useDashboardSelector(selectIsSaveAsNewButtonVisible);

    const canExport = useDashboardSelector(selectCanExportPdf);
    const isKPIDashboardExportPDFEnabled = !!useDashboardSelector(selectEnableKPIDashboardExportPDF);
    const isExportPdfEntitlementPresent = !!useDashboardSelector(selectEntitlementExportPdf);

    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    const isFilterViewsFeatureFlagEnabled = useDashboardSelector(selectEnableFilterViews);
    const isFilterViewsEnabledForDashboard = !useDashboardSelector(selectDisableFilterViews);
    const isFilterViewsVisible =
        isMobile && isFilterViewsFeatureFlagEnabled && isFilterViewsEnabledForDashboard;

    const isDeleteVisible = isInEditMode && (menuButtonItemsVisibility.deleteButton ?? true);

    // Do not show save as new button in menu item when it is already shown as a standalone top bar button.
    const isSaveAsVisible =
        !isStandaloneSaveAsNewButtonVisible &&
        canCreateDashboard &&
        !isSaveAsNewHidden &&
        (menuButtonItemsVisibility.saveAsNewButton ?? true);
    const isSaveAsDisabled = isEmptyLayout || isNewDashboard || isReadOnly;

    const isPdfExportVisible =
        isInViewMode &&
        canExport &&
        isKPIDashboardExportPDFEnabled &&
        isExportPdfEntitlementPresent &&
        (menuButtonItemsVisibility.pdfExportButton ?? true);

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
                    itemName: intl.formatMessage({ id: "options.menu.alerts.edit" }),
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
                        numberOfAvailableWebhooks === 0
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
                    itemName: intl.formatMessage({ id: "options.menu.schedule.email.edit" }),
                    onClick: defaultOnScheduleEmailingManagement,
                    visible: isScheduledManagementEmailingVisible,
                    icon: "gd-icon-list",
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
                    itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                    onClick: defaultOnExportToPdf,
                    visible: isPdfExportVisible,
                    icon: "gd-icon-download",
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
        intl,
        isDeleteVisible,
        isFilterViewsVisible,
        isNewDashboard,
        isPdfExportVisible,
        isReadOnly,
        isSaveAsDisabled,
        isSaveAsVisible,
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        numberOfAvailableWebhooks,
        openDeleteDialog,
        openFilterViewsAddDialog,
        openFilterViewsListDialog,
    ]);
}
