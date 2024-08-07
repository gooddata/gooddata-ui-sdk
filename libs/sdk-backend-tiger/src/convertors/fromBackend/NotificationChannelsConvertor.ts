// (C) 2022-2024 GoodData Corporation
import { JsonApiNotificationChannelOut, Webhook } from "@gooddata/api-client-tiger";
import { IWebhookMetadataObject } from "@gooddata/sdk-model";

/**
 * @internal
 */
type INotificationChannel = Omit<JsonApiNotificationChannelOut, "type">;

export function convertWebhookFromNotificationChannel(channel: INotificationChannel): IWebhookMetadataObject {
    const wh = channel.attributes?.destination as Webhook | undefined;
    return {
        id: channel.id,
        name: channel.attributes?.name ?? "",
        endpoint: wh?.url ?? "",
        token: wh?.token ?? "",
        hasToken: wh?.hasToken ?? false,
        triggers:
            channel.attributes?.triggers?.map((trigger) => ({
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
