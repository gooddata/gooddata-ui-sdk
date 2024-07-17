// (C) 2022-2024 GoodData Corporation
import { JsonApiNotificationChannelOut } from "@gooddata/api-client-tiger";
import { IWebhookMetadataObject } from "@gooddata/sdk-model";

/**
 * @internal
 */
type INotificationChannel = Omit<JsonApiNotificationChannelOut, "type">;

export function convertWebhookFromNotificationChannel(webhook: INotificationChannel): IWebhookMetadataObject {
    return {
        id: webhook.id,
        name: webhook.attributes?.name ?? "",
        endpoint: webhook.attributes?.webhook?.url ?? "",
        token: webhook.attributes?.webhook?.token ?? "",
        hasToken: webhook.attributes?.webhook?.hasToken ?? false,
        triggers:
            webhook.attributes?.triggers?.map((trigger) => ({
                type: trigger.type,
                ...(isMetadataAllowedOn(trigger.metadata) ? { allowOn: trigger.metadata.allowedOn } : {}),
            })) ?? [],
    };
}

interface IWebhookMetadataAllowedOn {
    allowedOn: IWebhookMetadataObject["triggers"][number]["allowOn"];
}

function isMetadataAllowedOn(obj: any): obj is IWebhookMetadataAllowedOn {
    return !!(typeof obj === "object" && obj.allowedOn && Array.isArray(obj.allowedOn));
}
