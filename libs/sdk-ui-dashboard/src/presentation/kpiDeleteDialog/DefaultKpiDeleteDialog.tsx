// (C) 2022-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";

import { type IKpiDeleteDialogProps } from "./types.js";
import { eagerRemoveNestedLayoutSectionItem } from "../../model/commands/layout.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { dispatchAndWaitFor } from "../../model/store/_infra/dispatchAndWaitFor.js";
import { uiActions } from "../../model/store/ui/index.js";
import {
    selectIsKpiDeleteDialogOpen,
    selectKpiDeleteDialogWidgetLayoutPath,
} from "../../model/store/ui/uiSelectors.js";

/**
 * @internal
 */
export function useKpiDeleteDialogProps(): IKpiDeleteDialogProps {
    const dispatch = useDashboardDispatch();
    const layoutPath = useDashboardSelector(selectKpiDeleteDialogWidgetLayoutPath);
    const onCancel = useCallback(() => dispatch(uiActions.closeKpiDeleteDialog()), [dispatch]);

    const onDelete = useCallback(() => {
        if (layoutPath !== undefined) {
            void dispatchAndWaitFor(dispatch, eagerRemoveNestedLayoutSectionItem(layoutPath)).finally(() => {
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
export function DefaultKpiDeleteDialog({
    isVisible,
    onDelete,
    onCancel,
}: IKpiDeleteDialogProps): ReactElement | null {
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
