// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import { FilterContextItem, IDashboardAttributeFilter, IDashboardDateFilter } from "@gooddata/sdk-model";
import { ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    renameDashboard,
    selectDashboardShareInfo,
    selectDashboardTitle,
    selectFilterContextFilters,
    selectIsReadOnly,
    selectIsSaveAsDialogOpen,
    selectPersistedDashboard,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";

import { ExportDialogProvider } from "../../dialogs";
import {
    DefaultButtonBar,
    DefaultMenuButton,
    DefaultTopBar,
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
import { DeleteDialog, useDeleteDialogProps } from "../../deleteDialog";
import { useDefaultMenuItems } from "../../topBar/menuButton/useDefaultMenuItems";

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
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = useFilterBar();
    const { title, onTitleChanged, buttonProps, shareInfo } = useTopBar();
    const { addSuccess, addError } = useToastMessage();

    const dispatch = useDashboardDispatch();
    const isSaveAsDialogOpen = useDashboardSelector(selectIsSaveAsDialogOpen);
    const closeSaveAsDialog = () => dispatch(uiActions.closeSaveAsDialog());
    const persistedDashboard = useDashboardSelector(selectPersistedDashboard);

    const deleteDialogProps = useDeleteDialogProps();

    const defaultMenuItems = useDefaultMenuItems();

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
            <DeleteDialog {...deleteDialogProps} />
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
