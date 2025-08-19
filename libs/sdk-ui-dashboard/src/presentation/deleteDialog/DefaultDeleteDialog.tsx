// (C) 2022-2025 GoodData Corporation
import React, { ReactElement, useCallback } from "react";

import compact from "lodash/compact.js";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { IDeleteDialogProps } from "./types.js";
import {
    deleteDashboard,
    dispatchAndWaitFor,
    selectDashboardTitle,
    selectDashboardUserAutomationAlerts,
    selectDashboardUserAutomationSchedules,
    selectEnableAlerting,
    selectEnableKPIDashboardDrillToDashboard,
    selectEnableScheduling,
    selectIsDeleteDialogOpen,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../model/index.js";

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
            dispatchAndWaitFor(dispatch, deleteDashboard()).finally(() => {
                dispatch(uiActions.closeDeleteDialog());
            }),
        [dispatch],
    );

    const isVisible = useDashboardSelector(selectIsDeleteDialogOpen);
    const isSchedulingEnabled = useDashboardSelector(selectEnableScheduling);
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);
    const isDrillToDashboardEnabled = useDashboardSelector(selectEnableKPIDashboardDrillToDashboard);

    const alerts = useDashboardSelector(selectDashboardUserAutomationAlerts); // Should be in dashboard context
    const schedules = useDashboardSelector(selectDashboardUserAutomationSchedules); // Should be in dashboard context

    return {
        isVisible,
        isSchedulingEnabled,
        isAlertingEnabled,
        isDrillToDashboardEnabled,

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
export const DefaultDeleteDialog = (props: IDeleteDialogProps): ReactElement | null => {
    const {
        isVisible,
        isSchedulingEnabled,
        isAlertingEnabled,
        isDrillToDashboardEnabled,
        onDelete,
        onCancel,
        dashboardTitle,
        showAlertsMessage,
        showSchedulesMessage,
    } = props;

    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    const messages = compact([
        isAlertingEnabled && showAlertsMessage && deleteMessages.alerts,
        isSchedulingEnabled && showSchedulesMessage && deleteMessages.schedules,
        isDrillToDashboardEnabled && deleteMessages.drills,
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
};
