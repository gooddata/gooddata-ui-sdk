// (C) 2019-2026 GoodData Corporation

import { type ReactElement, useCallback, useState } from "react";

import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../../model/store/ui/index.js";
import { selectIsSaveAsDialogOpen } from "../../../model/store/ui/uiSelectors.js";
import { type ISaveAsDialogProps } from "../types.js";

import { SaveAsDialogRenderer } from "./SaveAsDialogRenderer.js";
import { useSaveAs } from "./useSaveAs.js";

/**
 * @internal
 */
export function useSaveAsDialogProps(): ISaveAsDialogProps {
    const { addSuccess, addError } = useToastMessage();

    const dispatch = useDashboardDispatch();
    const closeSaveAsDialog = useCallback(() => dispatch(uiActions.closeSaveAsDialog()), [dispatch]);

    const isSaveAsDialogOpen = useDashboardSelector(selectIsSaveAsDialogOpen);

    const onSaveAsError = useCallback(() => {
        // keep the dialog open so the user is not left in an unknown state and can retry or cancel
        addError(messages.messagesDashboardSaveFailed, { id: "message_dashboard_save_failed" });
    }, [addError]);

    const onSaveAsSuccess = useCallback(() => {
        closeSaveAsDialog();
        addSuccess(messages.messagesDashboardSaveSuccess, { id: "message_dashboard_save_success" });
    }, [closeSaveAsDialog, addSuccess]);

    const onSaveAsCancel = useCallback(() => {
        closeSaveAsDialog();
    }, [closeSaveAsDialog]);

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
export function DefaultSaveAsDialog({
    onSubmit,
    onCancel,
    onError,
    isVisible,
    onSuccess,
}: ISaveAsDialogProps): ReactElement | null {
    const [hasSaveError, setHasSaveError] = useState(false);

    // the command handlers are bound once, so only the stable state setter is used here besides the props
    const handleSubmitError = useCallback(
        (error: GoodDataSdkError) => {
            setHasSaveError(true);
            onError?.(error);
        },
        [onError],
    );

    const {
        locale,
        dashboardTitle,
        isKpiWidgetEnabled,
        isDashboardSaving,
        isDashboardLoaded,
        handleSaveAs,
        isInEditMode,
    } = useSaveAs({ onSubmit, onSubmitSuccess: onSuccess, onSubmitError: handleSubmitError });

    const handleSubmit = useCallback(
        (title: string, switchToCopy?: boolean, useOriginalFilterContext?: boolean) => {
            setHasSaveError(false);
            handleSaveAs(title, switchToCopy, useOriginalFilterContext);
        },
        [handleSaveAs],
    );

    // forget the previous failure once the dialog is closed
    if (!isVisible && hasSaveError) {
        setHasSaveError(false);
    }

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
            isInEditMode={isInEditMode}
            hasSaveError={hasSaveError}
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    );
}
