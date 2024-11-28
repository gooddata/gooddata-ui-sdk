// (C) 2022-2024 GoodData Corporation
import {
    DeclarativeNotificationChannelDestinationTypeEnum,
    JsonApiNotificationChannelOut,
    Webhook,
    Smtp,
    JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum,
    DefaultSmtp,
} from "@gooddata/api-client-tiger";
import {
    assertNever,
    NotificationChannelAllowedRecipients,
    IWebhookNotificationChannelMetadataObject,
    ISmtpNotificationChannelMetadataObject,
    IInPlatformNotificationChannelMetadataObject,
    INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

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
        case DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK: {
            return convertWebhookNotificationChannelFromBackend(channel);
        }
        case DeclarativeNotificationChannelDestinationTypeEnum.SMTP: {
            return convertCustomSmtpNotificationChannelFromBackend(channel);
        }
        case DeclarativeNotificationChannelDestinationTypeEnum.DEFAULT_SMTP: {
            return convertDefaultSmtpNotificationChannelFromBackend(channel);
        }
        case DeclarativeNotificationChannelDestinationTypeEnum.IN_PLATFORM: {
            return convertInPlatformNotificationChannelFromBackend(channel);
        }
        case undefined:
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
    "id" | "type" | "title" | "description" | "customDashboardUrl" | "allowedRecipients" | "tags"
> {
    return {
        type: "notificationChannel",
        id: channel.id,
        title: channel.attributes?.name ?? undefined,
        description: channel.attributes?.description ?? undefined,
        customDashboardUrl: channel.attributes?.customDashboardUrl,
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
        case JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum.CREATOR:
            return "creator";
        case JsonApiNotificationChannelOutAttributesAllowedRecipientsEnum.INTERNAL:
            return "internal";
        default:
            assertNever(allowedRecipients);
            return undefined;
    }
}
