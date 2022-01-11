// (C) 2019-2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";
import { IScheduledEmailDialogProps } from "../types";

import { ScheduledMailDialogRenderer } from "./ScheduledMailDialogRenderer/ScheduledMailDialogRenderer";
import { useScheduledEmail } from "./useScheduledEmail";

/**
 * @alpha
 */
export const DefaultScheduledEmailDialog = (props: IScheduledEmailDialogProps): JSX.Element | null => {
    const { onSubmit, onCancel, onError, isVisible, onSuccess } = props;

    const {
        currentUser,
        dashboardRef,
        dashboardTitle,
        handleCreateScheduledEmail,
        locale,
        canListUsersInWorkspace,
        dateFormat,
        enableKPIDashboardSchedule,
        enableKPIDashboardScheduleRecipients,
    } = useScheduledEmail({ onSubmit, onSubmitSuccess: onSuccess, onSubmitError: onError });

    // trigger the invariant only if the user tries to open the dialog
    if (isVisible) {
        invariant(
            enableKPIDashboardSchedule,
            "Feature flag enableKPIDashboardSchedule must be enabled to make ScheduledMailDialog work properly.",
        );
    }

    if (!isVisible) {
        return null;
    }

    return (
        <ScheduledMailDialogRenderer
            locale={locale}
            canListUsersInProject={canListUsersInWorkspace}
            enableKPIDashboardScheduleRecipients={enableKPIDashboardScheduleRecipients}
            dateFormat={dateFormat}
            currentUser={currentUser}
            dashboard={dashboardRef}
            dashboardTitle={dashboardTitle}
            onSubmit={handleCreateScheduledEmail}
            onCancel={onCancel}
            onError={onError}
        />
    );
};
