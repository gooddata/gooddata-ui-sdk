// (C) 2022-2024 GoodData Corporation
import {
    JsonApiNotificationChannelOutTypeEnum,
    JsonApiNotificationChannelOut,
    JsonApiNotificationChannelPostOptionalId,
    DeclarativeNotificationChannelDestinationTypeEnum,
} from "@gooddata/api-client-tiger";
import { IWebhookMetadataObjectDefinition, IWebhookMetadataObject } from "@gooddata/sdk-model";

export function convertWebhookToNotificationChannel(
    webhook: Partial<IWebhookMetadataObject> & Pick<IWebhookMetadataObject, "id">,
): JsonApiNotificationChannelOut {
    return {
        id: webhook.id,
        ...convertCreateWebhookToNotificationChannel(webhook),
    };
}

export function convertCreateWebhookToNotificationChannel(
    webhook: IWebhookMetadataObjectDefinition,
): JsonApiNotificationChannelPostOptionalId {
    return {
        type: JsonApiNotificationChannelOutTypeEnum.NOTIFICATION_CHANNEL,
        attributes: {
            name: webhook.name,
            destinationType: DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK,
            destination: {
                type: DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK,
                url: webhook.endpoint ?? "",
                token: webhook.token,
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
