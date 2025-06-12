// (C) 2022-2025 GoodData Corporation
import {
    JsonApiNotificationChannelPostOptionalId,
    JsonApiNotificationChannelIn,
    DeclarativeNotificationChannelDestinationTypeEnum,
    Smtp,
    DefaultSmtp,
    Webhook,
    JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum,
    JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum,
} from "@gooddata/api-client-tiger";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    INotificationChannelMetadataObject,
    IInPlatformNotificationChannelMetadataObject,
    ISmtpNotificationChannelMetadataObject,
    IWebhookNotificationChannelMetadataObject,
    NotificationChannelAllowedRecipients,
    assertNever,
    IDefaultSmtpDestinationConfiguration,
    ICustomSmtpDestinationConfiguration,
    INotificationChannelMetadataObjectDefinition,
    IInPlatformNotificationChannelMetadataObjectDefinition,
    ISmtpNotificationChannelMetadataObjectDefinition,
    IWebhookNotificationChannelMetadataObjectDefinition,
    isNotificationChannelMetadataObject,
    NotificationChannelDestinationType,
    NotificationChannelDashboardLinkVisibility,
} from "@gooddata/sdk-model";

type BackendReturnType<T> = T extends INotificationChannelMetadataObject
    ? JsonApiNotificationChannelIn
    : JsonApiNotificationChannelPostOptionalId;

/**
 * Converts notification channel from SDK model to backend format.
 *
 * @internal
 */
export function convertNotificationChannelToBackend<
    T extends INotificationChannelMetadataObject | INotificationChannelMetadataObjectDefinition,
>(channel: T): BackendReturnType<T> {
    switch (channel.destinationType) {
        case "webhook":
            return convertWebhookNotificationChannelToBackend(channel) as BackendReturnType<T>;
        case "smtp":
            return channel.destinationConfig?.type === "customSmtp"
                ? (convertCustomSmtpNotificationChannelToBackend(channel) as BackendReturnType<T>)
                : (convertDefaultSmtpNotificationChannelToBackend(channel) as BackendReturnType<T>);
        case "inPlatform":
            return convertInPlatformNotificationChannelToBackend(channel) as BackendReturnType<T>;
        default:
            assertNever(channel);
            throw new UnexpectedError(
                `Unknown notification channel type: ${(channel as any).destinationType}`,
            );
    }
}

function convertSharedNotificationChannelPropertiesToBackend<
    T extends INotificationChannelMetadataObject | INotificationChannelMetadataObjectDefinition,
>(channel: T): BackendReturnType<T> {
    const notificationChannel: JsonApiNotificationChannelPostOptionalId = {
        type: "notificationChannel",
        attributes: {
            name: channel.title,
            description: channel.description,
            customDashboardUrl: channel.customDashboardUrl,
            dashboardLinkVisibility: convertDashboardLinkVisibility(channel.dashboardLinkVisibility),
            allowedRecipients: convertAllowedRecipientsToBackend(channel.allowedRecipients),
        },
    };

    if (isNotificationChannelMetadataObject(channel)) {
        return {
            id: channel.id,
            ...notificationChannel,
        } as BackendReturnType<T>;
    }
    return notificationChannel as BackendReturnType<T>;
}

function convertInPlatformNotificationChannelToBackend<
    T extends
        | IInPlatformNotificationChannelMetadataObject
        | IInPlatformNotificationChannelMetadataObjectDefinition,
>(channel: T): BackendReturnType<T> {
    const shared = convertSharedNotificationChannelPropertiesToBackend(channel);
    return {
        ...shared,
        attributes: {
            ...shared.attributes,
            destination: { type: "IN_PLATFORM" },
        },
    };
}

function convertCustomSmtpNotificationChannelToBackend<
    T extends ISmtpNotificationChannelMetadataObject | ISmtpNotificationChannelMetadataObjectDefinition,
>(channel: T): BackendReturnType<T> {
    const shared = convertSharedNotificationChannelPropertiesToBackend(channel);
    const config = channel.destinationConfig as ICustomSmtpDestinationConfiguration | undefined;

    return {
        ...shared,
        attributes: {
            ...shared.attributes,
            inPlatformNotification: channel.sendInPlatformNotifications ? "ENABLED" : "DISABLED",
            destination: config
                ? ({
                      type: "SMTP",
                      fromEmail: config.senderEmail,
                      fromEmailName: config.senderDisplayName,
                      host: config.host,
                      port: config.port,
                      username: config.username,
                      password: config.password,
                  } as Smtp)
                : { type: "SMTP" },
        },
    };
}

function convertDefaultSmtpNotificationChannelToBackend<
    T extends ISmtpNotificationChannelMetadataObject | ISmtpNotificationChannelMetadataObjectDefinition,
>(channel: T): BackendReturnType<T> {
    const shared = convertSharedNotificationChannelPropertiesToBackend(channel);
    const config = channel.destinationConfig as IDefaultSmtpDestinationConfiguration | undefined;

    return {
        ...shared,
        attributes: {
            ...shared.attributes,
            inPlatformNotification: channel.sendInPlatformNotifications ? "ENABLED" : "DISABLED",
            destination: config
                ? ({
                      type: "DEFAULT_SMTP",
                      fromEmailName: config.senderDisplayName,
                      fromEmail: config.senderEmail,
                  } as DefaultSmtp)
                : { type: "DEFAULT_SMTP" },
        },
    };
}

function convertWebhookNotificationChannelToBackend<
    T extends IWebhookNotificationChannelMetadataObject | IWebhookNotificationChannelMetadataObjectDefinition,
>(channel: T): BackendReturnType<T> {
    const shared = convertSharedNotificationChannelPropertiesToBackend(channel);
    const config = channel.destinationConfig;

    return {
        ...shared,
        attributes: {
            ...shared.attributes,
            inPlatformNotification: channel.sendInPlatformNotifications ? "ENABLED" : "DISABLED",
            destination: config
                ? ({
                      type: "WEBHOOK",
                      url: config.endpoint,
                      token: config.token,
                      hasToken: config.hasToken,
                  } as Webhook)
                : { type: "WEBHOOK" },
        },
    };
}

function convertAllowedRecipientsToBackend(
    allowedRecipients: NotificationChannelAllowedRecipients | undefined,
): JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum | undefined {
    if (!allowedRecipients) {
        return undefined;
    }

    switch (allowedRecipients) {
        case "creator":
            return JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum.CREATOR;
        case "internal":
            return JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum.INTERNAL;
        case "external":
            return JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum.EXTERNAL;
        default:
            assertNever(allowedRecipients);
            return undefined;
    }
}

/**
 * Converts notification channel types from SDK model to backend format.
 *
 * @internal
 */
export function convertNotificationChannelTypesToBackend(
    types: NotificationChannelDestinationType[],
): DeclarativeNotificationChannelDestinationTypeEnum[] {
    return types.flatMap(convertNotificationChannelTypeToBackend);
}

function convertNotificationChannelTypeToBackend(
    type: NotificationChannelDestinationType,
): DeclarativeNotificationChannelDestinationTypeEnum[] {
    switch (type) {
        case "webhook":
            return [DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK];
        case "smtp":
            return [
                DeclarativeNotificationChannelDestinationTypeEnum.SMTP,
                DeclarativeNotificationChannelDestinationTypeEnum.DEFAULT_SMTP,
            ];
        case "inPlatform":
            return [DeclarativeNotificationChannelDestinationTypeEnum.IN_PLATFORM];
        default:
            assertNever(type);
            return [DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK];
    }
}

function convertDashboardLinkVisibility(type?: NotificationChannelDashboardLinkVisibility) {
    switch (type) {
        case "hidden":
            return JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum.HIDDEN;
        case "visible":
            return JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum.ALL;
        case "internalOnly":
            return JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum.INTERNAL_ONLY;
        default:
            return undefined;
    }
}
