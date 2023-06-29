// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { IKpiDeleteDialogProps } from "./types.js";
import {
    dispatchAndWaitFor,
    eagerRemoveSectionItem,
    selectIsKpiDeleteDialogOpen,
    selectKpiDeleteDialogWidgetCoordinates,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../model/index.js";

/**
 * @internal
 */
export function useKpiDeleteDialogProps(): IKpiDeleteDialogProps {
    const dispatch = useDashboardDispatch();
    const coordinates = useDashboardSelector(selectKpiDeleteDialogWidgetCoordinates);

    const onCancel = useCallback(() => dispatch(uiActions.closeKpiDeleteDialog()), [dispatch]);

    const onDelete = useCallback(
        () =>
            dispatchAndWaitFor(
                dispatch,
                eagerRemoveSectionItem(coordinates!.sectionIndex, coordinates!.itemIndex),
            ).finally(() => {
                dispatch(uiActions.closeKpiDeleteDialog());
            }),
        [coordinates, dispatch],
    );

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
export const DefaultKpiDeleteDialog = (props: IKpiDeleteDialogProps): JSX.Element | null => {
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
};
