// (C) 2019-2022 GoodData Corporation
import { useCallback } from "react";
import {
    IScheduledMailDefinition,
    IScheduledMail,
    FilterContextItem,
    IUser,
} from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError, ILocale } from "@gooddata/sdk-ui";
import { UriRef } from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";

import {
    CommandProcessingStatus,
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
    selectOriginalFilterContextFilters,
} from "../../../model";

import { useCreateScheduledEmail } from "./useCreateScheduledEmail";
import { invariant } from "ts-invariant";

interface UseScheduledEmailResult {
    /**
     * Filters to apply to the exported dashboard attached to the scheduled email.
     */
    filters?: FilterContextItem[];

    /**
     * Reference of the dashboard to be attached to the scheduled email.
     */
    dashboardRef: UriRef;

    /**
     * Dashboard title. It's used as the default scheduled email subject.
     */
    dashboardTitle: string;

    /**
     * Has user permissions to list users in the workspace?
     */
    canListUsersInWorkspace?: boolean;

    /**
     * Is user able to create scheduled emails?
     */
    enableKPIDashboardSchedule?: boolean;

    /**
     * Is user able to send scheduled email to other recipients?
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Date format user for the date select and default scheduled email subject.
     */
    dateFormat?: string;

    /**
     * Currently logged in user. Current user has to be one of the recipients of the scheduled email.
     */
    currentUser: IUser;

    /**
     * Locale used for translations
     */
    locale: ILocale;

    /**
     * Function that results in the creation of the scheduled email on the backend.
     */
    handleCreateScheduledEmail: (
        scheduledEmailToCreate: IScheduledMailDefinition,
        filters?: FilterContextItem[],
    ) => void;

    /**
     * Status of the scheduled email creation -
     */
    scheduledEmailCreationStatus?: CommandProcessingStatus;
}

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

export const useScheduledEmail = (props: UseScheduledEmailProps): UseScheduledEmailResult => {
    const { onSubmit, onSubmitSuccess, onSubmitError } = props;

    // Bear model expects that all refs are sanitized to uriRefs.
    const dashboardUriRef = useDashboardSelector(selectDashboardUriRef);
    // if this bombs then the controller code is bugged because it should not even allow to get
    // to this point for dashboards that are not persisted. scheduling is not possible for such
    // dashboards and so the respective menus to trigger the scheduling must not be present
    invariant(dashboardUriRef, "attempting to schedule email for unsaved dashboard");

    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const currentUser = useDashboardSelector(selectUser);
    const locale = useDashboardSelector(selectLocale);
    const filters = useDashboardSelector(selectFilterContextFilters);
    const originalFilters = useDashboardSelector(selectOriginalFilterContextFilters);
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
            // If dashboard filters are not changed, do not save them to scheduled email filter context.
            // Like this, future filter changes stored in the original dashboard filter context
            // are correctly propagated to the scheduled emails with the original filter context.
            const filtersToStore = isEqual(originalFilters, filters) ? undefined : filters;
            scheduledEmailCreator.create(scheduledEmail, customFilters ?? filtersToStore);
        },
        [filters, originalFilters],
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
