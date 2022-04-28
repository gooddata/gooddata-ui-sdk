// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import { isProtectedDataError } from "@gooddata/sdk-backend-spi";
import { FilterContextItem, IDashboardAttributeFilter, IDashboardDateFilter } from "@gooddata/sdk-model";
import { ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    exportDashboardToPdf,
    renameDashboard,
    selectCanCreateAnalyticalDashboard,
    selectCanExportReport,
    selectDashboardShareInfo,
    selectDashboardTitle,
    selectEnableKPIDashboardExportPDF,
    selectFilterContextFilters,
    selectIsLayoutEmpty,
    selectIsReadOnly,
    selectIsSaveAsDialogOpen,
    selectMenuButtonItemsVisibility,
    selectPersistedDashboard,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardScheduledEmails,
    useDashboardSelector,
} from "../../../model";

import { ExportDialogProvider } from "../../dialogs";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile";
import {
    DefaultButtonBar,
    DefaultMenuButton,
    DefaultTopBar,
    IMenuButtonItem,
    TopBar,
    useCancelButtonProps,
    useEditButtonProps,
    useSaveAsNewButtonProps,
    useSaveButtonProps,
    useShareButtonProps,
} from "../../topBar";
import { SaveAsDialog } from "../../saveAs";
import { DefaultFilterBar, FilterBar } from "../../filterBar";
import { ShareDialogDashboardHeader } from "./ShareDialogDashboardHeader";
import { ScheduledEmailDialogProvider } from "./ScheduledEmailDialogProvider";
import { selectIsNewDashboard } from "../../../model/store/meta/metaSelectors";

const useFilterBar = (): {
    filters: FilterContextItem[];
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter) => void;
    onDateFilterChanged: (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => void;
} => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (filter: IDashboardAttributeFilter) => {
            const { attributeElements, negativeSelection, localIdentifier } = filter.attributeFilter;
            dispatch(
                changeAttributeFilterSelection(
                    localIdentifier!,
                    attributeElements,
                    negativeSelection ? "NOT_IN" : "IN",
                ),
            );
        },
        [dispatch],
    );

    const onDateFilterChanged = useCallback(
        (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => {
            if (!filter) {
                // all time filter
                dispatch(clearDateFilterSelection());
            } else {
                const { type, granularity, from, to } = filter.dateFilter;
                dispatch(changeDateFilterSelection(type, granularity, from, to, dateFilterOptionLocalId));
            }
        },
        [dispatch],
    );

    return { filters, onAttributeFilterChanged, onDateFilterChanged };
};

const useTopBar = () => {
    const dispatch = useDashboardDispatch();
    const title = useDashboardSelector(selectDashboardTitle);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const shareInfo = useDashboardSelector(selectDashboardShareInfo);

    const shareButtonProps = useShareButtonProps();
    const editButtonProps = useEditButtonProps();
    const cancelButtonProps = useCancelButtonProps();
    const saveButtonProps = useSaveButtonProps();
    const saveAsNewButtonProps = useSaveAsNewButtonProps();

    const onTitleChanged = useCallback(
        (title: string) => {
            dispatch(renameDashboard(title));
        },
        [dispatch],
    );

    return {
        title,
        onTitleChanged: isReadOnly ? undefined : onTitleChanged,
        shareInfo,
        buttonProps: {
            shareButtonProps,
            editButtonProps,
            cancelButtonProps,
            saveButtonProps,
            saveAsNewButtonProps,
        },
    };
};

// split the header parts of the dashboard so that changes to their state
// (e.g. opening email dialog) do not re-render the dashboard body
export const DashboardHeader = (): JSX.Element => {
    const intl = useIntl();
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isEmptyLayout = useDashboardSelector(selectIsLayoutEmpty);
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = useFilterBar();
    const { title, onTitleChanged, buttonProps, shareInfo } = useTopBar();
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const { isScheduledEmailingVisible, defaultOnScheduleEmailing } = useDashboardScheduledEmails();

    const dispatch = useDashboardDispatch();
    const isSaveAsDialogOpen = useDashboardSelector(selectIsSaveAsDialogOpen);
    const openSaveAsDialog = () => dispatch(uiActions.openSaveAsDialog());
    const closeSaveAsDialog = () => dispatch(uiActions.closeSaveAsDialog());
    const persistedDashboard = useDashboardSelector(selectPersistedDashboard);

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
    const canCreateDashboard = useDashboardSelector(selectCanCreateAnalyticalDashboard);

    const canExportReport = useDashboardSelector(selectCanExportReport);
    const isKPIDashboardExportPDFEnabled = !!useDashboardSelector(selectEnableKPIDashboardExportPDF);

    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    const defaultMenuItems = useMemo<IMenuButtonItem[]>(() => {
        if (isNewDashboard) {
            return [];
        }

        const isSaveAsVisible = canCreateDashboard && (menuButtonItemsVisibility.saveAsNewButton ?? false);
        const isSaveAsDisabled = isEmptyLayout || isNewDashboard || isReadOnly;

        const isPdfExportVisible =
            canExportReport &&
            isKPIDashboardExportPDFEnabled &&
            (menuButtonItemsVisibility.pdfExportButton ?? true);

        return [
            {
                type: "button",
                itemId: "save_as_menu_item", // careful, also a s- class selector, do not change
                disabled: isSaveAsDisabled,
                visible: !!isSaveAsVisible,
                itemName: intl.formatMessage({ id: "options.menu.save.as" }),
                tooltip:
                    // the tooltip is only relevant to non-read only states
                    !isReadOnly && isSaveAsDisabled
                        ? intl.formatMessage({ id: "options.menu.save.as.tooltip" })
                        : undefined,
                onClick: defaultOnSaveAs,
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

    const onSaveAsError = useCallback(() => {
        closeSaveAsDialog();
        addError({ id: "messages.dashboardSaveFailed" });
    }, []);

    const onSaveAsSuccess = useCallback(() => {
        closeSaveAsDialog();
        addSuccess({ id: "messages.dashboardSaveSuccess" });
    }, []);

    const onSaveAsCancel = useCallback(() => {
        closeSaveAsDialog();
    }, []);

    return (
        <>
            <ToastMessages />
            <ExportDialogProvider />
            <ScheduledEmailDialogProvider />
            <ShareDialogDashboardHeader />
            {isSaveAsDialogOpen && (
                <SaveAsDialog
                    isVisible={isSaveAsDialogOpen}
                    onCancel={onSaveAsCancel}
                    onError={onSaveAsError}
                    onSuccess={onSaveAsSuccess}
                />
            )}

            <TopBar
                menuButtonProps={{ menuItems: defaultMenuItems, DefaultMenuButton: DefaultMenuButton }}
                titleProps={{ title, onTitleChanged }}
                buttonBarProps={{
                    cancelButtonProps: buttonProps.cancelButtonProps,
                    editButtonProps: buttonProps.editButtonProps,
                    saveAsNewButtonProps: buttonProps.saveAsNewButtonProps,
                    saveButtonProps: buttonProps.saveButtonProps,
                    shareButtonProps: buttonProps.shareButtonProps,
                    DefaultButtonBar: DefaultButtonBar,
                }}
                shareStatusProps={{
                    shareStatus: shareInfo.shareStatus,
                    isUnderStrictControl: !!persistedDashboard?.isUnderStrictControl,
                }}
                lockedStatusProps={{
                    isLocked: !!shareInfo.isLocked,
                }}
                DefaultTopBar={DefaultTopBar}
            />

            <FilterBar
                filters={filters}
                onAttributeFilterChanged={onAttributeFilterChanged}
                onDateFilterChanged={onDateFilterChanged}
                DefaultFilterBar={DefaultFilterBar}
            />
        </>
    );
};
