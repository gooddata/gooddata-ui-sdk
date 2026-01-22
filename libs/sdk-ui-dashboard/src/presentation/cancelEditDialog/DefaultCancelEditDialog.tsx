// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";

import { type ICancelEditDialogProps } from "./types.js";
import { cancelEditRenderMode } from "../../model/commands/renderMode.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../model/store/ui/index.js";
import { selectIsCancelEditModeDialogOpen } from "../../model/store/ui/uiSelectors.js";

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
export function DefaultCancelEditDialog(props: ICancelEditDialogProps) {
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
            onCancel={props.onCancel}
            onSubmit={props.onSubmit}
            isPositive={false}
            className="s-dialog s-cancel_confirmation_dialog"
        >
            <Typography tagName="p">
                {intl.formatMessage({ id: "cancelConfirmationDialog.message" })}
            </Typography>
        </ConfirmDialog>
    );
}
