// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { ISaveAsDialogProps } from "../types";
import { useSaveAs } from "./useSaveAs";
import { SaveAsDialogRenderer } from "./SaveAsDialogRenderer";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import {
    selectIsSaveAsDialogOpen,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";

/**
 * @internal
 */
export function useSaveAsDialogProps(): ISaveAsDialogProps {
    const { addSuccess, addError } = useToastMessage();

    const dispatch = useDashboardDispatch();
    const closeSaveAsDialog = useCallback(() => dispatch(uiActions.closeSaveAsDialog()), [dispatch]);

    const isSaveAsDialogOpen = useDashboardSelector(selectIsSaveAsDialogOpen);

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

    return {
        isVisible: isSaveAsDialogOpen,
        onCancel: onSaveAsCancel,
        onError: onSaveAsError,
        onSuccess: onSaveAsSuccess,
    };
}

/**
 * @alpha
 */
export const DefaultSaveAsDialog = (props: ISaveAsDialogProps): JSX.Element | null => {
    const { onSubmit, onCancel, onError, isVisible, onSuccess } = props;

    const {
        locale,
        dashboardTitle,
        isKpiWidgetEnabled,
        isScheduleEmailsEnabled,
        isDashboardSaving,
        isDashboardLoaded,
        handleSaveAs,
    } = useSaveAs({ onSubmit, onSubmitSuccess: onSuccess, onSubmitError: onError });

    if (!isVisible) {
        return null;
    }

    return (
        <SaveAsDialogRenderer
            locale={locale}
            dashboardTitle={dashboardTitle}
            isKpiWidgetEnabled={isKpiWidgetEnabled}
            isDashboardLoaded={isDashboardLoaded}
            isDashboardSaving={isDashboardSaving}
            isScheduleEmailsEnabled={isScheduleEmailsEnabled}
            onSubmit={handleSaveAs}
            onCancel={onCancel}
        />
    );
};
