// (C) 2022-2025 GoodData Corporation
import React, { ReactElement, useCallback } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";

import { IKpiDeleteDialogProps } from "./types.js";
import {
    dispatchAndWaitFor,
    eagerRemoveNestedLayoutSectionItem,
    selectIsKpiDeleteDialogOpen,
    selectKpiDeleteDialogWidgetLayoutPath,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../model/index.js";

/**
 * @internal
 */
export function useKpiDeleteDialogProps(): IKpiDeleteDialogProps {
    const dispatch = useDashboardDispatch();
    const layoutPath = useDashboardSelector(selectKpiDeleteDialogWidgetLayoutPath);
    const onCancel = useCallback(() => dispatch(uiActions.closeKpiDeleteDialog()), [dispatch]);

    const onDelete = useCallback(() => {
        if (layoutPath !== undefined) {
            dispatchAndWaitFor(dispatch, eagerRemoveNestedLayoutSectionItem(layoutPath)).finally(() => {
                dispatch(uiActions.closeKpiDeleteDialog());
            });
        }
    }, [layoutPath, dispatch]);

    const isVisible = useDashboardSelector(selectIsKpiDeleteDialogOpen);

    return {
        isVisible,
        onCancel,
        onDelete,
    };
}

/**
 * @internal
 */
export function DefaultKpiDeleteDialog(props: IKpiDeleteDialogProps): ReactElement | null {
    const { isVisible, onDelete, onCancel } = props;

    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onDelete}
            isPositive={false}
            className="s-dialog"
            headline={intl.formatMessage({ id: "deleteKpiConfirmationDialog.headline" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "deleteKpiConfirmationDialog.submitButtonText" })}
        >
            <Typography tagName="p">
                <FormattedMessage id="deleteKpiConfirmationDialog.message" />
            </Typography>
        </ConfirmDialog>
    );
}
