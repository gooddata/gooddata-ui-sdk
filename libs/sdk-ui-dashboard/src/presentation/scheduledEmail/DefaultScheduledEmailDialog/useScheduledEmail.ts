// (C) 2019-2022 GoodData Corporation
import { useCallback } from "react";
import { GoodDataSdkError, ILocale } from "@gooddata/sdk-ui";
import {
    ObjRef,
    UriRef,
    IUser,
    FilterContextItem,
    IInsightWidget,
    isInsightWidget,
    IScheduledMail,
    IScheduledMailDefinition,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";

import {
    CommandProcessingStatus,
    useDashboardSelector,
    selectDashboardTitle,
    selectDashboardUriRef,
    selectCurrentUser,
    selectLocale,
    selectFilterContextFilters,
    selectDateFormat,
    selectEnableKPIDashboardScheduleRecipients,
    selectCanListUsersInWorkspace,
    selectEnableKPIDashboardSchedule,
    selectEnableInsightExportScheduling,
    selectOriginalFilterContextFilters,
    selectWidgets,
    isCustomWidget,
    selectCanExportReport,
    selectScheduleEmailDialogDefaultAttachment,
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
     * Analytical insights widgets on the dashboard
     */
    dashboardInsightWidgets: IInsightWidget[];

    /**
     * Filters on the dashboard have not been changed so the dashboard filters should be used for the schedule
     */
    hasDefaultFilters: boolean;

    /**
     * Has user permissions to list users in the workspace?
     */
    canListUsersInWorkspace?: boolean;

    /**
     * Has user permissions to list users in the canExportReport?
     */
    canExportReport?: boolean;

    /**
     * Is user able to create scheduled emails?
     */
    enableKPIDashboardSchedule?: boolean;

    /**
     * Is user able to send scheduled email to other recipients?
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Is the new UI and workflow for scheduled emailing with widgets is enabled?
     */
    enableWidgetExportScheduling?: boolean;

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

    /**
     * Attachment to be selected by default.
     */
    defaultAttachment?: ObjRef;
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
    const dashboardWidgets = useDashboardSelector(selectWidgets);
    const dashboardInsightWidgets: IInsightWidget[] = dashboardWidgets
        .filter(isInsightWidget)
        .filter((widget) => !isCustomWidget(widget));
    const currentUser = useDashboardSelector(selectCurrentUser);
    const locale = useDashboardSelector(selectLocale);
    const filters = useDashboardSelector(selectFilterContextFilters);
    const originalFilters = useDashboardSelector(selectOriginalFilterContextFilters);
    const dateFormat = useDashboardSelector(selectDateFormat);
    const enableKPIDashboardScheduleRecipients = useDashboardSelector(
        selectEnableKPIDashboardScheduleRecipients,
    );
    const canListUsersInWorkspace = useDashboardSelector(selectCanListUsersInWorkspace);
    const canExportReport = useDashboardSelector(selectCanExportReport);
    const enableKPIDashboardSchedule = useDashboardSelector(selectEnableKPIDashboardSchedule);
    const enableWidgetExportScheduling = useDashboardSelector(selectEnableInsightExportScheduling);
    const defaultAttachment = useDashboardSelector(selectScheduleEmailDialogDefaultAttachment);

    const scheduledEmailCreator = useCreateScheduledEmail({
        onSuccess: onSubmitSuccess,
        onError: onSubmitError,
        onBeforeRun: onSubmit,
    });

    const hasDefaultFilters = isEqual(originalFilters, filters);
    const handleCreateScheduledEmail = useCallback(
        (scheduledEmail: IScheduledMailDefinition, customFilters?: FilterContextItem[]) => {
            // If dashboard filters are not changed, do not save them to scheduled email filter context.
            // Like this, future filter changes stored in the original dashboard filter context
            // are correctly propagated to the scheduled emails with the original filter context.
            const filtersToStore = hasDefaultFilters ? undefined : filters;
            scheduledEmailCreator.create(scheduledEmail, customFilters ?? filtersToStore);
        },
        [filters, hasDefaultFilters],
    );

    const scheduledEmailCreationStatus = scheduledEmailCreator.creationStatus;

    return {
        dashboardRef: dashboardUriRef,
        dashboardTitle,
        dashboardInsightWidgets,
        hasDefaultFilters,
        canListUsersInWorkspace,
        canExportReport,
        enableKPIDashboardSchedule,
        enableKPIDashboardScheduleRecipients,
        enableWidgetExportScheduling,
        dateFormat,
        currentUser,
        locale,
        handleCreateScheduledEmail,
        scheduledEmailCreationStatus,
        defaultAttachment,
    };
};
