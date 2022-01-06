// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isProtectedDataError,
} from "@gooddata/sdk-backend-spi";
import { ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    exportDashboardToPdf,
    renameDashboard,
    selectCanCreateAnalyticalDashboard,
    selectCanCreateScheduledMail,
    selectCanExportReport,
    selectDashboardRef,
    selectDashboardShareInfo,
    selectDashboardTitle,
    selectEnableKPIDashboardExportPDF,
    selectEnableKPIDashboardSchedule,
    selectFilterContextFilters,
    selectIsLayoutEmpty,
    selectIsReadOnly,
    selectIsSaveAsDialogOpen,
    selectIsScheduleEmailDialogOpen,
    selectMenuButtonItemsVisibility,
    selectPersistedDashboard,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";

import { ExportDialogProvider } from "../../dialogs";

import { downloadFile } from "../../../_staging/fileUtils/downloadFile";
import { DefaultButtonBar, DefaultMenuButton, DefaultTopBar, IMenuButtonItem, TopBar } from "../../topBar";
import { ScheduledEmailDialog } from "../../scheduledEmail";
import { SaveAsDialog } from "../../saveAs";
import { DefaultFilterBar, FilterBar } from "../../filterBar";
import { ShareDialogDashboardHeader } from "./ShareDialogDashboardHeader";
import { useDashboardCustomizationsContext } from "../../dashboardContexts";

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

    const onTitleChanged = useCallback(
        (title: string) => {
            dispatch(renameDashboard(title));
        },
        [dispatch],
    );

    const onShareButtonClick = useCallback(() => dispatch(uiActions.openShareDialog()), [dispatch]);

    return {
        title,
        onTitleChanged: isReadOnly ? undefined : onTitleChanged,
        onShareButtonClick,
        shareInfo,
    };
};

// split the header parts of the dashboard so that changes to their state
// (e.g. opening email dialog) do not re-render the dashboard body
export const DashboardHeader = (): JSX.Element => {
    const intl = useIntl();
    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const isEmptyLayout = useDashboardSelector(selectIsLayoutEmpty);
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = useFilterBar();
    const { title, onTitleChanged, onShareButtonClick, shareInfo } = useTopBar();
    const { addSuccess, addError, addProgress, removeMessage } = useToastMessage();
    const { enableSaveAsNewButton } = useDashboardCustomizationsContext();

    const dispatch = useDashboardDispatch();
    const isScheduleEmailingDialogOpen = useDashboardSelector(selectIsScheduleEmailDialogOpen);
    const openScheduleEmailingDialog = () => dispatch(uiActions.openScheduleEmailDialog());
    const closeScheduleEmailingDialog = () => dispatch(uiActions.closeScheduleEmailDialog());
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

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnScheduleEmailing = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openScheduleEmailingDialog();
    }, [dashboardRef]);

    const defaultOnSaveAs = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openSaveAsDialog();
    }, [dashboardRef]);

    const defaultOnExportToPdf = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        exportDashboard();
    }, [exportDashboard, dashboardRef]);

    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const canCreateDashboard = useDashboardSelector(selectCanCreateAnalyticalDashboard);

    const canExportReport = useDashboardSelector(selectCanExportReport);
    const isKPIDashboardExportPDFEnabled = !!useDashboardSelector(selectEnableKPIDashboardExportPDF);

    const canCreateScheduledMail = useDashboardSelector(selectCanCreateScheduledMail);
    const isScheduledEmailingEnabled = !!useDashboardSelector(selectEnableKPIDashboardSchedule);

    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    const defaultMenuItems = useMemo<IMenuButtonItem[]>(() => {
        if (!dashboardRef) {
            return [];
        }

        // TODO RAIL-3945 remove enableSaveAsNewButton once gdc-dashboards are ready for this
        const isSaveAsVisible =
            canCreateDashboard && (enableSaveAsNewButton || menuButtonItemsVisibility.saveAsNewButton);
        const isSaveAsDisabled = isEmptyLayout || !dashboardRef || isReadOnly;

        const isPdfExportVisible =
            canExportReport &&
            isKPIDashboardExportPDFEnabled &&
            (menuButtonItemsVisibility.pdfExportButton ?? true);

        const isScheduledEmailingVisible =
            !isReadOnly &&
            canCreateScheduledMail &&
            isScheduledEmailingEnabled &&
            (menuButtonItemsVisibility.scheduleEmailButton ?? true);

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
        dashboardRef,
        isReadOnly,
        menuButtonItemsVisibility,
        canExportReport,
        isKPIDashboardExportPDFEnabled,
        canCreateScheduledMail,
        isScheduledEmailingEnabled,
    ]);

    const onScheduleEmailingError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError({ id: "dialogs.schedule.email.submit.error" });
    }, []);

    const onScheduleEmailingSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess({ id: "dialogs.schedule.email.submit.success" });
    }, []);

    const onScheduleEmailingCancel = useCallback(() => {
        closeScheduleEmailingDialog();
    }, []);

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
            {isScheduleEmailingDialogOpen && (
                <ScheduledEmailDialog
                    isVisible={isScheduleEmailingDialogOpen}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingError}
                    onSuccess={onScheduleEmailingSuccess}
                />
            )}
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
                    shareButtonProps: { onShareButtonClick },
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
