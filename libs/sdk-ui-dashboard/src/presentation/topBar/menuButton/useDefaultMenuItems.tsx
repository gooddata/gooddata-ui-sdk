// (C) 2022-2024 GoodData Corporation
import React, { useCallback, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

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
} from "../../../model/index.js";
import { downloadFile } from "../../../_staging/fileUtils/downloadFile.js";
import { IMenuButtonItem } from "../types.js";
import { messages } from "../../../locales.js";
import { selectIsSaveAsNewButtonVisible } from "../buttonBar/button/index.js";

/**
 * @internal
 */
export function useDefaultMenuItems(): IMenuButtonItem[] {
    const intl = useIntl();
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isEmptyLayout = !useDashboardSelector(selectLayoutHasAnalyticalWidgets); // we need at least one non-custom widget there
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const {
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        defaultOnScheduleEmailing,
        defaultOnScheduleEmailingManagement,
        numberOfAvailableWebhooks,
    } = useDashboardScheduledEmails();

    const dispatch = useDashboardDispatch();
    const openSaveAsDialog = useCallback(() => dispatch(uiActions.openSaveAsDialog()), [dispatch]);
    const openDeleteDialog = useCallback(() => dispatch(uiActions.openDeleteDialog()), [dispatch]);

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
        onSuccess: (e) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }
            addSuccess(messages.messagesExportResultSuccess);
            downloadFile(e.payload.result);
        },
        onError: (err) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }

            if (isProtectedDataError(err)) {
                addError(messages.messagesExportResultRestrictedError);
            } else {
                addError(messages.messagesExportResultError);
            }
        },
    });

    const defaultOnSaveAs = useCallback(() => {
        if (isNewDashboard) {
            return;
        }

        openSaveAsDialog();
    }, [isNewDashboard, openSaveAsDialog]);

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

    return useMemo<IMenuButtonItem[]>(() => {
        if (isNewDashboard) {
            return [];
        }

        const isDeleteVisible = isInEditMode && (menuButtonItemsVisibility.deleteButton ?? true);

        /**
         * Do not show save as new button in menu item when it is already shown
         * as a standalone top bar button.
         */
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

        return [
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
            },
            {
                type: "separator",
                itemId: "save-as-separator",
                // show the separator if at least one item of the two groups is visible as well
                visible: isSaveAsVisible && isPdfExportVisible,
            },
            {
                type: "button",
                itemId: "pdf-export-item", // careful, this is also used as a selector in tests, do not change
                itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                onClick: defaultOnExportToPdf,
                visible: isPdfExportVisible,
            },
            {
                type: "separator",
                itemId: "schedule-separator",
                // show the separator if at least one item of the two groups is visible as well
                visible:
                    isPdfExportVisible &&
                    (isScheduledEmailingVisible || isScheduledManagementEmailingVisible),
            },
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
            },
            {
                type: "button",
                itemId: "schedule-email-edit-item", // careful, this is also used as a selector in tests, do not change
                itemName: intl.formatMessage({ id: "options.menu.schedule.email.edit" }),
                onClick: defaultOnScheduleEmailingManagement,
                visible: isScheduledManagementEmailingVisible,
            },
            {
                type: "separator",
                itemId: "delete-separator",
                // show the separator if at least one item of the two groups is visible as well
                visible:
                    (isScheduledEmailingVisible || isScheduledManagementEmailingVisible) && isDeleteVisible,
            },
            {
                type: "button",
                itemId: "delete_dashboard", // careful, also a s- class selector, do not change
                itemName: intl.formatMessage({ id: "options.menu.delete" }),
                onClick: openDeleteDialog,
                visible: isDeleteVisible,
                className: "delete-button",
            },
        ];
    }, [
        canCreateDashboard,
        canExport,
        defaultOnExportToPdf,
        defaultOnSaveAs,
        defaultOnScheduleEmailing,
        defaultOnScheduleEmailingManagement,
        intl,
        isEmptyLayout,
        isExportPdfEntitlementPresent,
        isInEditMode,
        isInViewMode,
        isKPIDashboardExportPDFEnabled,
        isNewDashboard,
        isReadOnly,
        isSaveAsNewHidden,
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        isStandaloneSaveAsNewButtonVisible,
        menuButtonItemsVisibility.deleteButton,
        menuButtonItemsVisibility.pdfExportButton,
        menuButtonItemsVisibility.saveAsNewButton,
        numberOfAvailableWebhooks,
        openDeleteDialog,
    ]);
}
