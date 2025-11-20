// (C) 2022-2025 GoodData Corporation

import {
    DefaultSmtp,
    JsonApiNotificationChannelIdentifierOut,
    JsonApiNotificationChannelOut,
    JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum,
    JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum,
    JsonApiNotificationChannelOutAttributesDestinationTypeEnum,
    Smtp,
    Webhook,
} from "@gooddata/api-client-tiger";
import {
    IInPlatformNotificationChannelMetadataObject,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    ISmtpNotificationChannelMetadataObject,
    IWebhookNotificationChannelMetadataObject,
    NotificationChannelAllowedRecipients,
    NotificationChannelDestinationType,
    assertNever,
} from "@gooddata/sdk-model";

/**
 * Converts a notification channel identifier from backend to SDK model.
 * @internal
 */
export function convertNotificationChannelIdentifierFromBackend(
    channel: JsonApiNotificationChannelIdentifierOut,
): INotificationChannelIdentifier | undefined {
    if (!channel.attributes?.destinationType) {
        return undefined;
    }
    return {
        type: "notificationChannel",
        destinationType: convertJsonApiNotificationChannelOutAttributesDestinationTypeEnum(
            channel.attributes.destinationType,
        ),
        id: channel.id,
        title: channel.attributes?.name ?? undefined,
        description: channel.attributes?.description ?? undefined,
        allowedRecipients: convertAllowedRecipientsFromBackend(channel.attributes?.allowedRecipients),
    };
}

export const convertJsonApiNotificationChannelOutAttributesDestinationTypeEnum = (
    destinationType: JsonApiNotificationChannelOutAttributesDestinationTypeEnum,
): NotificationChannelDestinationType => {
    switch (destinationType) {
        case "DEFAULT_SMTP":
        case "SMTP":
            return "smtp";
        case "IN_PLATFORM":
            return "inPlatform";
        case "WEBHOOK":
            return "webhook";
    }
};

/**
 * Converts notification channel from backend to SDK model.
 *
 * If unknown notification channel type is encountered, the function returns `undefined`.
 *
 * @internal
 */
export function convertNotificationChannelFromBackend(
    channel: JsonApiNotificationChannelOut,
): INotificationChannelMetadataObject | undefined {
    const destinationType = channel.attributes?.destinationType;

    switch (destinationType) {
        case "WEBHOOK": {
            return convertWebhookNotificationChannelFromBackend(channel);
        }
        case "SMTP": {
            return convertCustomSmtpNotificationChannelFromBackend(channel);
        }
        case "DEFAULT_SMTP": {
            return convertDefaultSmtpNotificationChannelFromBackend(channel);
        }
        case "IN_PLATFORM": {
            return convertInPlatformNotificationChannelFromBackend(channel);
        }
        case undefined:
        case null:
            return undefined;
        default:
            assertNever(destinationType);
            return undefined;
    }
}

function convertSharedNotificationChannelPropertiesFromBackend(
    channel: JsonApiNotificationChannelOut,
): Pick<
    INotificationChannelMetadataObject,
    | "id"
    | "type"
    | "title"
    | "description"
    | "customDashboardUrl"
    | "allowedRecipients"
    | "tags"
    | "dashboardLinkVisibility"
> {
    return {
        type: "notificationChannel",
        id: channel.id,
        title: channel.attributes?.name ?? undefined,
        description: channel.attributes?.description ?? undefined,
        customDashboardUrl: channel.attributes?.customDashboardUrl,
        dashboardLinkVisibility: convertDashboardLinkVisibility(channel.attributes?.dashboardLinkVisibility),
        allowedRecipients: convertAllowedRecipientsFromBackend(channel.attributes?.allowedRecipients),
        tags: [],
    };
}

function convertInPlatformNotificationChannelFromBackend(
    channel: JsonApiNotificationChannelOut,
): IInPlatformNotificationChannelMetadataObject {
    const shared = convertSharedNotificationChannelPropertiesFromBackend(channel);

    return {
        ...shared,
        destinationType: "inPlatform",
    };
}

function convertCustomSmtpNotificationChannelFromBackend(
    channel: JsonApiNotificationChannelOut,
): ISmtpNotificationChannelMetadataObject | undefined {
    const destination = channel.attributes?.destination as Smtp | undefined;
    const shared = convertSharedNotificationChannelPropertiesFromBackend(channel);

    return {
        ...shared,
        destinationType: "smtp",
        sendInPlatformNotifications: channel.attributes?.inPlatformNotification === "ENABLED",
        destinationConfig: destination
            ? {
                  type: "customSmtp",
                  senderEmail: destination.fromEmail,
                  senderDisplayName: destination.fromEmailName,
                  host: destination.host,
                  port: destination.port,
                  username: destination.username,
                  password: destination.password,
              }
            : undefined,
    };
}

function convertDefaultSmtpNotificationChannelFromBackend(
    channel: JsonApiNotificationChannelOut,
): ISmtpNotificationChannelMetadataObject | undefined {
    const destination = channel.attributes?.destination as DefaultSmtp | undefined;
    const shared = convertSharedNotificationChannelPropertiesFromBackend(channel);

    return {
        ...shared,
        destinationType: "smtp",
        sendInPlatformNotifications: channel.attributes?.inPlatformNotification === "ENABLED",
        destinationConfig: destination
            ? {
                  type: "defaultSmtp",
                  senderDisplayName: destination.fromEmailName,
                  senderEmail: destination.fromEmail,
              }
            : destination,
    };
}

function convertWebhookNotificationChannelFromBackend(
    channel: JsonApiNotificationChannelOut,
): IWebhookNotificationChannelMetadataObject | undefined {
    const destination = channel.attributes?.destination as Webhook | undefined;
    const shared = convertSharedNotificationChannelPropertiesFromBackend(channel);

    return {
        ...shared,
        destinationType: "webhook",
        sendInPlatformNotifications: channel.attributes?.inPlatformNotification === "ENABLED",
        destinationConfig: destination
            ? {
                  endpoint: destination.url,
                  token: destination.token ?? undefined,
                  hasToken: destination.hasToken ?? undefined,
              }
            : undefined,
    };
}

function convertAllowedRecipientsFromBackend(
    allowedRecipients: JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum | undefined,
): NotificationChannelAllowedRecipients | undefined {
    if (!allowedRecipients) {
        return undefined;
    }

    switch (allowedRecipients) {
        case "CREATOR":
            return "creator";
        case "INTERNAL":
            return "internal";
        case "EXTERNAL":
            return "external";
        default:
            assertNever(allowedRecipients);
            return undefined;
    }
}

function convertDashboardLinkVisibility(
    type?: JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum,
) {
    switch (type) {
        case "HIDDEN":
            return "hidden";
        case "ALL":
            return "visible";
        case "INTERNAL_ONLY":
            return "internalOnly";
        default:
            return undefined;
    }
}
