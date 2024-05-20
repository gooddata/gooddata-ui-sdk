// (C) 2022-2024 GoodData Corporation
import { JsonApiNotificationChannelOut } from "@gooddata/api-client-tiger";

/**
 * @internal
 */
type INotificationChannel = Omit<JsonApiNotificationChannelOut, "type">;

export function convertWebhookFromNotificationChannel(webhook: INotificationChannel) {
    return {
        id: webhook.id,
        name: webhook.attributes?.name ?? "",
        endpoint: webhook.attributes?.webhook?.url ?? "",
        token: webhook.attributes?.webhook?.token ?? "",
        triggers:
            webhook.attributes?.triggers?.map((trigger) => ({
                type: trigger.type,
                allowOn: (trigger.metadata as any).allowedOn ?? [],
            })) ?? [],
    };
}
