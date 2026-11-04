// (C) 2022-2026 GoodData Corporation

import {
    type DeclarativeNotificationChannelDestinationTypeEnum,
    type DefaultSmtp,
    type JsonApiNotificationChannelIn,
    type JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum,
    type JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum,
    type JsonApiNotificationChannelPostOptionalId,
    type Smtp,
    type Webhook,
} from "@gooddata/api-client-tiger";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    type ICustomSmtpDestinationConfiguration,
    type IDefaultSmtpDestinationConfiguration,
    type IInPlatformNotificationChannelMetadataObject,
    type IInPlatformNotificationChannelMetadataObjectDefinition,
    type INotificationChannelMetadataObject,
    type INotificationChannelMetadataObjectDefinition,
    type ISmtpNotificationChannelMetadataObject,
    type ISmtpNotificationChannelMetadataObjectDefinition,
    type IWebhookNotificationChannelMetadataObject,
    type IWebhookNotificationChannelMetadataObjectDefinition,
    type NotificationChannelAllowedRecipients,
    type NotificationChannelDashboardLinkVisibility,
    type NotificationChannelDestinationType,
    assertNever,
    isNotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

type BackendReturnType<T> = T extends INotificationChannelMetadataObject
    ? JsonApiNotificationChannelIn
    : JsonApiNotificationChannelPostOptionalId;

type NotificationChannelConversionMode = "replace" | "merge";

/**
 * Converts notification channel from SDK model to backend format.
 *
 * @param channel - notification channel to convert
 * @param mode - whether the backend replaces the destination or merges it with stored credentials
 *
 * @internal
 */
export function convertNotificationChannelToBackend<
    T extends INotificationChannelMetadataObject | INotificationChannelMetadataObjectDefinition,
>(channel: T, mode: NotificationChannelConversionMode = "replace"): BackendReturnType<T> {
    switch (channel.destinationType) {
        case "webhook":
            return convertWebhookNotificationChannelToBackend(channel, mode) as BackendReturnType<T>;
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
>(channel: T, mode: NotificationChannelConversionMode): BackendReturnType<T> {
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
                      token: mode === "replace" && config.token === "" ? undefined : config.token,
                      hasToken: config.hasToken,
                      secretKey: mode === "replace" && config.secretKey === "" ? undefined : config.secretKey,
                      hasSecretKey: config.hasSecretKey,
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
            return "CREATOR";
        case "internal":
            return "INTERNAL";
        case "external":
            return "EXTERNAL";
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
            return ["WEBHOOK"];
        case "smtp":
            return ["SMTP", "DEFAULT_SMTP"];
        case "inPlatform":
            return ["IN_PLATFORM"];
        default:
            assertNever(type);
            return ["WEBHOOK"];
    }
}

function convertDashboardLinkVisibility(
    type?: NotificationChannelDashboardLinkVisibility,
): JsonApiNotificationChannelOutAttributesDashboardLinkVisibilityEnum | undefined {
    switch (type) {
        case "hidden":
            return "HIDDEN";
        case "visible":
            return "ALL";
        case "internalOnly":
            return "INTERNAL_ONLY";
        default:
            return undefined;
    }
}
