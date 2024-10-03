// (C) 2022-2024 GoodData Corporation
import {
    JsonApiNotificationChannelOutTypeEnum,
    JsonApiNotificationChannelOut,
    JsonApiNotificationChannelPostOptionalId,
    DeclarativeNotificationChannelDestinationTypeEnum,
} from "@gooddata/api-client-tiger";
import {
    ISmtpDefinition,
    ISmtpDefinitionObject,
    IWebhookDefinition,
    IWebhookDefinitionObject,
} from "@gooddata/sdk-model";

export function convertWebhookToNotificationChannel(
    webhook: Partial<IWebhookDefinitionObject> & Pick<IWebhookDefinitionObject, "id">,
): JsonApiNotificationChannelOut {
    return {
        id: webhook.id,
        ...convertCreateWebhookToNotificationChannel(webhook),
    };
}

export function convertCreateWebhookToNotificationChannel(
    webhook: Partial<IWebhookDefinition>,
): JsonApiNotificationChannelPostOptionalId {
    return {
        type: JsonApiNotificationChannelOutTypeEnum.NOTIFICATION_CHANNEL,
        attributes: {
            name: webhook.destination?.name,
            destinationType: DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK,
            destination: {
                type: DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK,
                url: webhook.destination?.endpoint ?? "",
                token: webhook.destination?.token,
            },
            customDashboardUrl: webhook.configuration?.dashboardUrl,
            allowedRecipients: webhook.allowedRecipients,
        },
    };
}

export function convertEmailToNotificationChannel(
    smtp: Partial<ISmtpDefinitionObject> & Pick<ISmtpDefinitionObject, "id">,
): JsonApiNotificationChannelOut {
    return {
        id: smtp.id,
        ...convertCreateEmailToNotificationChannel(smtp),
    };
}

export function convertCreateEmailToNotificationChannel(
    smtp: Partial<ISmtpDefinition>,
): JsonApiNotificationChannelPostOptionalId {
    switch (smtp.destination?.type) {
        case "custom":
            return convertCreateCustomEmailToNotificationChannel(smtp);
        case "default":
            return convertCreateDefaultEmailToNotificationChannel(smtp);
        default:
            throw new Error(`Unknown email channel type.`);
    }
}

function convertCreateCustomEmailToNotificationChannel(
    smtp: Partial<ISmtpDefinition>,
): JsonApiNotificationChannelPostOptionalId {
    if (smtp.destination?.type !== "custom") {
        throw new Error("Only custom SMTP destinations are supported");
    }

    return {
        type: JsonApiNotificationChannelOutTypeEnum.NOTIFICATION_CHANNEL,
        attributes: {
            name: smtp.destination?.name,
            destinationType: DeclarativeNotificationChannelDestinationTypeEnum.SMTP,
            destination: {
                type: DeclarativeNotificationChannelDestinationTypeEnum.SMTP,
                host: smtp.destination?.from ?? "",
                fromEmailName: smtp.destination?.person ?? "",
                fromEmail: smtp.destination?.address ?? "",
                username: smtp.destination?.login ?? "",
                port: smtp.destination?.port ?? 25,
                password: smtp.destination?.password,
            },
            customDashboardUrl: smtp.configuration?.dashboardUrl,
            allowedRecipients: smtp.allowedRecipients,
        },
    };
}

function convertCreateDefaultEmailToNotificationChannel(
    smtp: Partial<ISmtpDefinition>,
): JsonApiNotificationChannelPostOptionalId {
    if (smtp.destination?.type !== "default") {
        throw new Error("Only default SMTP destinations are supported");
    }

    return {
        type: JsonApiNotificationChannelOutTypeEnum.NOTIFICATION_CHANNEL,
        attributes: {
            name: smtp.destination?.name,
            destinationType: DeclarativeNotificationChannelDestinationTypeEnum.DEFAULT_SMTP,
            destination: {
                type: DeclarativeNotificationChannelDestinationTypeEnum.DEFAULT_SMTP,
                fromEmailName: smtp.destination?.person ?? "",
                fromEmail: smtp.destination?.address ?? "",
            },
            customDashboardUrl: smtp.configuration?.dashboardUrl,
            allowedRecipients: smtp.allowedRecipients,
        },
    };
}
