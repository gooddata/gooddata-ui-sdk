// (C) 2022-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useCallback } from "react";

import { compact } from "lodash-es";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { deleteDashboard } from "../../model/commands/dashboard.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { dispatchAndWaitFor } from "../../model/store/_infra/dispatchAndWaitFor.js";
import {
    selectDashboardUserAutomationAlerts,
    selectDashboardUserAutomationSchedules,
} from "../../model/store/automations/automationsSelectors.js";
import { selectDashboardTitle } from "../../model/store/meta/metaSelectors.js";
import { uiActions } from "../../model/store/ui/index.js";
import { selectIsDeleteDialogOpen } from "../../model/store/ui/uiSelectors.js";

import { type IDeleteDialogProps } from "./types.js";

const deleteMessages = defineMessages({
    default: {
        id: "deleteDashboardDialog.defaultMessage",
    },
    objects: {
        id: "deleteDashboardDialog.objectsMessage",
    },
    alerts: {
        id: "deleteDashboardDialog.alerts",
    },
    schedules: {
        id: "deleteDashboardDialog.schedules",
    },
});

/**
 * @internal
 */
export function useDeleteDialogProps(): IDeleteDialogProps {
    const dispatch = useDashboardDispatch();
    const onCancel = useCallback(() => dispatch(uiActions.closeDeleteDialog()), [dispatch]);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);

    const onDelete = useCallback(
        () =>
            void dispatchAndWaitFor(dispatch, deleteDashboard()).finally(() => {
                dispatch(uiActions.closeDeleteDialog());
            }),
        [dispatch],
    );

    const isVisible = useDashboardSelector(selectIsDeleteDialogOpen);

    const alerts = useDashboardSelector(selectDashboardUserAutomationAlerts); // Should be in dashboard context
    const schedules = useDashboardSelector(selectDashboardUserAutomationSchedules); // Should be in dashboard context

    return {
        isVisible,

        showAlertsMessage: alerts.length > 0,
        showSchedulesMessage: schedules.length > 0,

        onCancel,
        onDelete,

        dashboardTitle,
    };
}

/**
 * @internal
 */
export function DefaultDeleteDialog({
    isVisible,
    onDelete,
    onCancel,
    dashboardTitle,
    showAlertsMessage,
    showSchedulesMessage,
}: IDeleteDialogProps): ReactElement | null {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    // Names of the object types deleted along with the dashboard, woven into one sentence.
    const objectTypes = compact([
        showAlertsMessage && intl.formatMessage(deleteMessages.alerts),
        showSchedulesMessage && intl.formatMessage(deleteMessages.schedules),
    ]);

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onDelete}
            isPositive={false}
            className="s-dialog s-delete_dashboard_dialog"
            headline={intl.formatMessage({ id: "deleteDashboardDialog.headline" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "deleteDashboardDialog.submitButtonText" })}
        >
            {objectTypes.length > 0 ? (
                <FormattedMessage
                    id={deleteMessages.objects.id}
                    values={{
                        title: dashboardTitle,
                        objects: intl.formatList(objectTypes, { type: "unit" }),
                        strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    }}
                />
            ) : (
                <FormattedMessage
                    id={deleteMessages.default.id}
                    values={{
                        title: dashboardTitle,
                        strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    }}
                />
            )}
        </ConfirmDialog>
    );
}
