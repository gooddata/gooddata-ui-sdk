// (C) 2019-2020 GoodData Corporation
import { useCallback } from "react";
import { IScheduledMailDefinition, IScheduledMail, FilterContextItem } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import {
    useDashboardSelector,
    selectDashboardTitle,
    selectDashboardUriRef,
    selectUser,
    selectLocale,
    selectFilterContextFilters,
    selectDateFormat,
    selectEnableKPIDashboardScheduleRecipients,
    selectCanListUsersInWorkspace,
    selectEnableKPIDashboardSchedule,
} from "../model";
import { useCreateScheduledEmail } from "./useCreateScheduledEmail";
import { ScheduledEmailProps } from "./types";

/**
 * @internal
 */
export interface UseScheduledEmailProps {
    /**
     * Callback to be called, when user submit the scheduled email dialog.
     */
    onSubmit?: (scheduledEmailDefinition: IScheduledMailDefinition) => void;

    /**
     * Callback to be called, when submitting of the scheduled email was successful.
     */
    onSubmitSuccess?: (scheduledEmail: IScheduledMail) => void;

    /**
     * Callback to be called, when submitting of the scheduled email failed.
     */
    onSubmitError?: (error: GoodDataSdkError) => void;
}

export const useScheduledEmail = (props: UseScheduledEmailProps): ScheduledEmailProps => {
    const { onSubmit, onSubmitSuccess, onSubmitError } = props;

    // Bear model expects that all refs are sanitized to uriRefs.
    const dashboardUriRef = useDashboardSelector(selectDashboardUriRef);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const currentUser = useDashboardSelector(selectUser);
    const locale = useDashboardSelector(selectLocale);
    const filters = useDashboardSelector(selectFilterContextFilters);
    const dateFormat = useDashboardSelector(selectDateFormat);
    const enableKPIDashboardScheduleRecipients = useDashboardSelector(
        selectEnableKPIDashboardScheduleRecipients,
    );
    const canListUsersInWorkspace = useDashboardSelector(selectCanListUsersInWorkspace);
    const enableKPIDashboardSchedule = useDashboardSelector(selectEnableKPIDashboardSchedule);

    const scheduledEmailCreator = useCreateScheduledEmail({
        onSuccess: onSubmitSuccess,
        onError: onSubmitError,
        onBeforeRun: onSubmit,
    });

    const handleCreateScheduledEmail = useCallback(
        (scheduledEmail: IScheduledMailDefinition, customFilters?: FilterContextItem[]) => {
            scheduledEmailCreator.create(scheduledEmail, customFilters);
        },
        [filters],
    );

    const scheduledEmailCreationStatus = scheduledEmailCreator.creationStatus;

    return {
        dashboardRef: dashboardUriRef,
        dashboardTitle,
        canListUsersInWorkspace,
        enableKPIDashboardSchedule,
        enableKPIDashboardScheduleRecipients,
        dateFormat,
        currentUser,
        locale,
        handleCreateScheduledEmail,
        scheduledEmailCreationStatus,
    };
};
