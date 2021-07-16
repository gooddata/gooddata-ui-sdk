// (C) 2019-2020 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";
import {
    ScheduledEmailDialogPropsProvider,
    useScheduledEmailDialogProps,
} from "../ScheduledEmailDialogPropsContext";

import { IScheduledEmailDialogProps } from "../types";

import { ScheduledMailDialogRenderer } from "./ScheduledMailDialogRenderer/ScheduledMailDialogRenderer";
import { useScheduledEmail } from "./useScheduledEmail";

/**
 * @internal
 */
export const DefaultScheduledEmailDialogInner = (): JSX.Element | null => {
    const { onSubmit, onCancel, onError, isVisible, onSuccess } = useScheduledEmailDialogProps();

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
    } = useScheduledEmail({ onSubmit, onSubmitSuccess: onSuccess });

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

/**
 * @alpha
 */
export const DefaultScheduledEmailDialog = (props: IScheduledEmailDialogProps): JSX.Element => {
    return (
        <ScheduledEmailDialogPropsProvider {...props}>
            <DefaultScheduledEmailDialogInner />
        </ScheduledEmailDialogPropsProvider>
    );
};
