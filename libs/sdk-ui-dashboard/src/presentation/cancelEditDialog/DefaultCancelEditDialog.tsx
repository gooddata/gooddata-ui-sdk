// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";
import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";
import { ICancelEditDialogProps } from "./types.js";
import {
    cancelEditRenderMode,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    selectIsCancelEditModeDialogOpen,
} from "../../model/index.js";

/**
 * @internal
 */
export const useCancelEditDialog = () => {
    const dispatch = useDashboardDispatch();

    const onCancel = useCallback(() => dispatch(uiActions.closeCancelEditModeDialog()), [dispatch]);
    const onSubmit = useCallback(() => {
        dispatch(cancelEditRenderMode());
        dispatch(uiActions.closeCancelEditModeDialog());
    }, [dispatch]);

    return {
        onCancel,
        onSubmit,
    };
};

/**
 * @internal
 */
export function DefaultCancelEditDialog({ onCancel, onSubmit }: ICancelEditDialogProps) {
    const intl = useIntl();

    const showCancelEditDialog = useDashboardSelector(selectIsCancelEditModeDialogOpen);

    if (!showCancelEditDialog) {
        return null;
    }

    return (
        <ConfirmDialog
            headline={intl.formatMessage({ id: "cancelConfirmationDialog.headline" })}
            submitButtonText={intl.formatMessage({ id: "cancelConfirmationDialog.submitButtonText" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            onCancel={onCancel}
            onSubmit={onSubmit}
            isPositive={false}
            className="s-dialog s-cancel_confirmation_dialog"
        >
            <Typography tagName="p">
                {intl.formatMessage({ id: "cancelConfirmationDialog.message" })}
            </Typography>
        </ConfirmDialog>
    );
}
