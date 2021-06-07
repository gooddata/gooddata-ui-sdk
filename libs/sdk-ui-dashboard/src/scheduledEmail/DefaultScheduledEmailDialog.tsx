// (C) 2019-2020 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";
import { ScheduledMailDialogRenderer } from "@gooddata/sdk-ui-ext/esm/internal";
import { useScheduledEmail } from "./useScheduledEmail";
import { ScheduledEmailDialogProps } from "./types";

/**
 * @internal
 */
export const DefaultScheduledEmailDialog: React.FC<ScheduledEmailDialogProps> = (props) => {
    const { onSubmit, onCancel, onError, isVisible } = props;

    const {
        currentUser,
        dashboardRef,
        dashboardTitle,
        handleCreateScheduledEmail,
        locale,
        canListUsersInProject,
        dateFormat,
        enableKPIDashboardSchedule,
        enableKPIDashboardScheduleRecipients,
    } = useScheduledEmail({ onSubmit });

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
            canListUsersInProject={canListUsersInProject}
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
