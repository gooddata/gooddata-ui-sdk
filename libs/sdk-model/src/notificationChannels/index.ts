// (C) 2024-2025 GoodData Corporation
import {
    type IMdObject,
    type ToMdObjectDefinition,
    isMdObject,
    isMdObjectDefinition,
} from "../ldm/metadata/next.js";

/**
 * Type of the destination of the notification channel, where the notifications are to be sent.
 *
 * @beta
 */
export type NotificationChannelDestinationType = "webhook" | "smtp" | "inPlatform";

/**
 * Visibility of the dashboard link in the email notification.
 *
 * Hidden - the link is not visible
 * Visible - the link is visible for all
 * InternalOnly - the link is visible only for internal users
 *
 * @beta
 */
export type NotificationChannelDashboardLinkVisibility = "hidden" | "visible" | "internalOnly";

/**
 * Lightweight identifier object for notification channel.
 * @beta
 */
export interface INotificationChannelIdentifier {
    type: "notificationChannel";
    destinationType: NotificationChannelDestinationType;
    id: string;
    title?: string;
    description?: string;
    allowedRecipients?: NotificationChannelAllowedRecipients;
}

/**
 * Allowed recipients of notifications from this channel.
 *
 * Creator - only the creator of the report.
 * Internal - all users within the organization.
 * @beta
 */
export type NotificationChannelAllowedRecipients = "creator" | "internal" | "external";

/**
 * Shared base interface for all notification channel metadata objects.
 *
 * @beta
 */
export interface INotificationChannelMetadataObjectBase {
    type: "notificationChannel";

    /**
     * Type of the destination of the notification channel.
     */
    destinationType: NotificationChannelDestinationType;

    /**
     * Allowed recipients of notifications from this channel.
     *
     * If creator is specified, the notification will be sent to the creator of the report only.
     * If internal is specified, the notification will be sent to all internal users.
     */
    allowedRecipients?: NotificationChannelAllowedRecipients;

    /**
     * Custom dashboard url that is going to be used in the notification.
     * If not specified it is going to be deduced based on the context. Allowed placeholders are \{workspaceId\}, \{dashboardId\}.
     */
    customDashboardUrl?: string;

    /**
     * Dashboard link visibility.
     */
    dashboardLinkVisibility?: NotificationChannelDashboardLinkVisibility;
}

/**
 * Metadata object for webhook notification channel.
 *
 * @beta
 */
export interface IWebhookNotificationChannelMetadataObject
    extends INotificationChannelMetadataObjectBase, IMdObject {
    type: "notificationChannel";
    destinationType: "webhook";

    /**
     * Send also in-platform notifications for this channel.
     */
    sendInPlatformNotifications: boolean;

    /**
     * Configuration of the webhook, where the notifications are to be sent.
     */
    destinationConfig?: IWebhookDestinationConfiguration;
}

/**
 * Metadata object definition for webhook notification channel.
 * @beta
 */
export type IWebhookNotificationChannelMetadataObjectDefinition =
    ToMdObjectDefinition<IWebhookNotificationChannelMetadataObject>;

/**
 * @beta
 */
export interface IWebhookDestinationConfiguration {
    /**
     * URL of the webhook endpoint.
     */
    endpoint?: string;

    /**
     * Optional token to be used for authentication as bearer token.
     */
    token?: string;

    /**
     * Flag indicating whether the webhook has setup a token.
     */
    hasToken?: boolean;
}

/**
 * @beta
 */
export interface ISmtpNotificationChannelMetadataObject
    extends INotificationChannelMetadataObjectBase, IMdObject {
    type: "notificationChannel";
    destinationType: "smtp";

    /**
     * Send also in-platform notifications for this channel.
     */
    sendInPlatformNotifications: boolean;

    /**
     * Configuration of the SMTP, where the notifications are to be sent.
     */
    destinationConfig?: ISmtpDestinationConfiguration;
}

/**
 * Metadata object definition for SMTP notification channel.
 * @beta
 */
export type ISmtpNotificationChannelMetadataObjectDefinition =
    ToMdObjectDefinition<ISmtpNotificationChannelMetadataObject>;

/**
 * Configuration of the SMTP, where the notifications are to be sent.
 * Custom SMTP - custom SMTP server.
 * Default SMTP - default SMTP server (users in organization).
 * @beta
 */
export type ISmtpDestinationConfiguration =
    | ICustomSmtpDestinationConfiguration
    | IDefaultSmtpDestinationConfiguration;

/**
 * @beta
 */
export type ICustomSmtpDestinationConfiguration = {
    /**
     * Custom SMTP server.
     */
    type: "customSmtp";

    /**
     * The email address that will appear as the sender of notifications.
     */
    senderEmail?: string;

    /**
     * The display name that will appear as the sender name in notifications.
     */
    senderDisplayName?: string;

    /**
     * The SMTP server address.
     */
    host?: string;

    /**
     * The SMTP server port.
     */
    port?: 25 | 465 | 587 | 2525;

    /**
     * The SMTP server username.
     */
    username?: string;

    /**
     * The SMTP server password.
     */
    password?: string;
};

/**
 * @beta
 */
export type IDefaultSmtpDestinationConfiguration = {
    /**
     * Type of the SMTP.
     */
    type: "defaultSmtp";

    /**
     * The email address that will appear as the sender of notifications.
     * Note: This setting is currently not used. All notifications are sent from no-reply\@gooddata.com
     */
    senderEmail?: string;

    /**
     * The display name that will appear as the sender name in notifications.
     * Note: This setting is currently not used. All notifications show "GoodData" as the sender name.
     */
    senderDisplayName?: string;
};

/**
 * @beta
 */
export interface IInPlatformNotificationChannelMetadataObject
    extends INotificationChannelMetadataObjectBase, IMdObject {
    type: "notificationChannel";
    destinationType: "inPlatform";
}

/**
 * Metadata object definition for SMTP notification channel.
 * @beta
 */
export type IInPlatformNotificationChannelMetadataObjectDefinition =
    ToMdObjectDefinition<IInPlatformNotificationChannelMetadataObject>;

/**
 * @beta
 */
export type INotificationChannelMetadataObject =
    | IWebhookNotificationChannelMetadataObject
    | ISmtpNotificationChannelMetadataObject
    | IInPlatformNotificationChannelMetadataObject;

/**
 * Type guard checking whether input is an instance of {@link INotificationChannelMetadataObject}.
 *
 * @beta
 */
export function isNotificationChannelMetadataObject(obj: unknown): obj is INotificationChannelMetadataObject {
    return isMdObject(obj) && (obj as INotificationChannelMetadataObject).type === "notificationChannel";
}

/**
 * @beta
 */
export type INotificationChannelMetadataObjectDefinition =
    | IWebhookNotificationChannelMetadataObjectDefinition
    | ISmtpNotificationChannelMetadataObjectDefinition
    | IInPlatformNotificationChannelMetadataObjectDefinition;

/**
 * Type guard checking whether input is an instance of {@link INotificationChannelMetadataObjectDefinition}.
 *
 * @beta
 */
export function isNotificationChannelMetadataObjectDefinition(
    obj: unknown,
): obj is INotificationChannelMetadataObjectDefinition {
    return (
        isMdObjectDefinition(obj) &&
        (obj as INotificationChannelMetadataObjectDefinition).type === "notificationChannel"
    );
}

/**
 * Utility type to transform {@link INotificationChannelMetadataObjectDefinition} to relevant {@link INotificationChannelMetadataObject}.
 *
 * @beta
 */
export type ToNotificationChannelMetadataObject<T extends INotificationChannelMetadataObjectDefinition> =
    T extends IWebhookNotificationChannelMetadataObjectDefinition
        ? IWebhookNotificationChannelMetadataObject
        : T extends ISmtpNotificationChannelMetadataObjectDefinition
          ? ISmtpNotificationChannelMetadataObject
          : T extends IInPlatformNotificationChannelMetadataObjectDefinition
            ? IInPlatformNotificationChannelMetadataObject
            : never;

/**
 * @beta
 */
export interface INotificationChannelTestResponse {
    /**
     * Flag indicating whether the test was successful.
     */
    successful: boolean;
    /**
     * Optional error message in case the test was not successful.
     */
    error?: string;
}

/**
 * @alpha
 */
export interface INotificationChannelExternalRecipient {
    /**
     * E-mail address identifying external recipient.
     */
    email: string;
}
