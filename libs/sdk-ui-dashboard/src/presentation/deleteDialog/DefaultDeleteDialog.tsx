// (C) 2022-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import { compact } from "lodash-es";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { type IDeleteDialogProps } from "./types.js";
import { deleteDashboard } from "../../model/commands/dashboard.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { dispatchAndWaitFor } from "../../model/store/_infra/dispatchAndWaitFor.js";
import {
    selectDashboardUserAutomationAlerts,
    selectDashboardUserAutomationSchedules,
} from "../../model/store/automations/automationsSelectors.js";
import { selectEnableAlerting, selectEnableScheduling } from "../../model/store/config/configSelectors.js";
import { selectDashboardTitle } from "../../model/store/meta/metaSelectors.js";
import { uiActions } from "../../model/store/ui/index.js";
import { selectIsDeleteDialogOpen } from "../../model/store/ui/uiSelectors.js";

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
    drills: {
        id: "deleteDashboardDialog.drills",
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
    const isSchedulingEnabled = useDashboardSelector(selectEnableScheduling);
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);

    const alerts = useDashboardSelector(selectDashboardUserAutomationAlerts); // Should be in dashboard context
    const schedules = useDashboardSelector(selectDashboardUserAutomationSchedules); // Should be in dashboard context

    return {
        isVisible,
        isSchedulingEnabled,
        isAlertingEnabled,

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
    isSchedulingEnabled,
    isAlertingEnabled,
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

    const messages = compact([
        isAlertingEnabled && showAlertsMessage && deleteMessages.alerts,
        isSchedulingEnabled && showSchedulesMessage && deleteMessages.schedules,
        deleteMessages.drills,
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
            {messages.length > 0 ? (
                <div>
                    <FormattedMessage id={deleteMessages.objects.id} values={{ title: dashboardTitle }} />
                    <ul className="gd-delete-dialog-objects-list">
                        {messages.map((message) => (
                            <li key={message.id}>
                                <FormattedMessage {...message} />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <FormattedMessage id={deleteMessages.default.id} values={{ title: dashboardTitle }} />
            )}
        </ConfirmDialog>
    );
}
