// (C) 2022 GoodData Corporation

import { useIntl } from "react-intl";
import {
    exportDashboardToPdf,
    selectCanCreateAnalyticalDashboard,
    selectCanExportReport,
    selectEnableKPIDashboardExportPDF,
    selectIsLayoutEmpty,
    selectIsReadOnly,
    selectMenuButtonItemsVisibility,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardScheduledEmails,
    useDashboardSelector,
} from "../../../model";
import { selectIsNewDashboard } from "../../../model/store/meta/metaSelectors";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { useCallback, useMemo, useRef } from "react";
import { downloadFile } from "../../../_staging/fileUtils/downloadFile";
import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { selectIsInEditMode, selectIsInViewMode } from "../../../model/store/ui/uiSelectors";
import { IMenuButtonItem } from "../../topBar/types";
import { selectIsSaveAsNewButtonHidden } from "../../../model/store/config/configSelectors";

/**
 * @internal
 */
export const useDefaultMenuItems = function (): IMenuButtonItem[] {
    const intl = useIntl();
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isEmptyLayout = useDashboardSelector(selectIsLayoutEmpty);
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const { isScheduledEmailingVisible, defaultOnScheduleEmailing } = useDashboardScheduledEmails();

    const dispatch = useDashboardDispatch();
    const openSaveAsDialog = () => dispatch(uiActions.openSaveAsDialog());
    const openDeleteDialog = () => dispatch(uiActions.openDeleteDialog());

    const lastExportMessageId = useRef("");
    const { run: exportDashboard } = useDashboardCommandProcessing({
        commandCreator: exportDashboardToPdf,
        successEvent: "GDC.DASH/EVT.EXPORT.PDF.RESOLVED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            lastExportMessageId.current = addProgress(
                { id: "messages.exportResultStart" },
                // make sure the message stays there until removed by either success or error
                { duration: 0 },
            );
        },
        onSuccess: (e) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }
            addSuccess({ id: "messages.exportResultSuccess" });
            downloadFile(e.payload.resultUri);
        },
        onError: (err) => {
            if (lastExportMessageId.current) {
                removeMessage(lastExportMessageId.current);
            }

            if (isProtectedDataError(err)) {
                addError({ id: "messages.exportResultRestrictedError" });
            } else {
                addError({ id: "messages.exportResultError" });
            }
        },
    });

    const defaultOnSaveAs = useCallback(() => {
        if (isNewDashboard) {
            return;
        }

        openSaveAsDialog();
    }, [isNewDashboard]);

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

    const canExportReport = useDashboardSelector(selectCanExportReport);
    const isKPIDashboardExportPDFEnabled = !!useDashboardSelector(selectEnableKPIDashboardExportPDF);

    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    return useMemo<IMenuButtonItem[]>(() => {
        if (isNewDashboard) {
            return [];
        }

        const isDeleteVisible = isInEditMode && (menuButtonItemsVisibility.deleteButton ?? true);
        const isSaveAsVisible =
            canCreateDashboard && !isSaveAsNewHidden && (menuButtonItemsVisibility.saveAsNewButton ?? true);
        const isSaveAsDisabled = isEmptyLayout || isNewDashboard || isReadOnly;

        const isPdfExportVisible =
            isInViewMode &&
            canExportReport &&
            isKPIDashboardExportPDFEnabled &&
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
                visible: isSaveAsVisible,
            },
            {
                type: "button",
                itemId: "pdf-export-item", // careful, this is also used as a selector in tests, do not change
                itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                onClick: defaultOnExportToPdf,
                visible: isPdfExportVisible,
            },
            {
                type: "button",
                itemId: "schedule-email-item", // careful, this is also used as a selector in tests, do not change
                itemName: intl.formatMessage({ id: "options.menu.schedule.email" }),
                onClick: defaultOnScheduleEmailing,
                visible: isScheduledEmailingVisible,
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
        defaultOnScheduleEmailing,
        defaultOnExportToPdf,
        isNewDashboard,
        isReadOnly,
        menuButtonItemsVisibility,
        canExportReport,
        isKPIDashboardExportPDFEnabled,
        isScheduledEmailingVisible,
    ]);
};
