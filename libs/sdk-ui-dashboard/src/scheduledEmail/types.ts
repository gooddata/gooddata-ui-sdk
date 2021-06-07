// (C) 2019-2021 GoodData Corporation
import { UriRef } from "@gooddata/sdk-model";
import { FilterContextItem, IScheduledMailDefinition, IUser } from "@gooddata/sdk-backend-spi";
import { ILocale, GoodDataSdkError } from "@gooddata/sdk-ui";
import { CommandProcessingStatus } from "../dashboard/useDashboardCommandProcessing";

/**
 * @internal
 */
export interface ScheduledEmailProps {
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
     * Has user permissions to list users in the project?
     */
    canListUsersInProject?: boolean;

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
export interface ScheduledEmailDialogProps {
    /**
     * Is scheduled e-mail dialog visible?
     */
    isVisible?: boolean;

    /**
     * Callback to be called, when user submit the scheduled email dialog.
     */
    onSubmit?: (scheduledEmailDefinition: IScheduledMailDefinition) => void;

    /**
     * Callback to be called, when user close the scheduled email dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;
}
