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
            triggers:
                webhook.triggers?.map((trigger) => ({
                    type: trigger.type,
                    ...(trigger?.allowOn
                        ? {
                              metadata: {
                                  allowedOn: trigger.allowOn,
                              },
                          }
                        : {}),
                })) ?? [],
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
    return {
        type: JsonApiNotificationChannelOutTypeEnum.NOTIFICATION_CHANNEL,
        attributes: {
            name: smtp.destination?.name,
            destinationType: DeclarativeNotificationChannelDestinationTypeEnum.SMTP,
            destination: {
                type: DeclarativeNotificationChannelDestinationTypeEnum.SMTP,
                address: smtp.destination?.address ?? "",
                fromEmail: smtp.destination?.from ?? "",
                login: smtp.destination?.login ?? "",
                port: smtp.destination?.port ?? 25,
                password: smtp.destination?.password,
            },
            triggers:
                smtp.triggers?.map((trigger) => ({
                    type: trigger.type,
                    ...(trigger?.allowOn
                        ? {
                              metadata: {
                                  allowedOn: trigger.allowOn,
                              },
                          }
                        : {}),
                })) ?? [],
        },
    };
}
