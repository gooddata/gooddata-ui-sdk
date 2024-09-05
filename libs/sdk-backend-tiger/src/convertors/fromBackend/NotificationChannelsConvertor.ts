// (C) 2022-2024 GoodData Corporation
import {
    DeclarativeNotificationChannelDestinationTypeEnum,
    JsonApiNotificationChannelOut,
    Webhook,
    Smtp,
} from "@gooddata/api-client-tiger";
import {
    IWebhookDefinitionObject,
    INotificationChannelTrigger,
    ISmtpDefinitionObject,
    INotificationChannelDefinitionObject,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
type INotificationChannel = Omit<JsonApiNotificationChannelOut, "type">;

export function convertChannelFromNotificationChannel(
    channel: INotificationChannel,
): INotificationChannelDefinitionObject {
    switch (channel.attributes?.destinationType) {
        case DeclarativeNotificationChannelDestinationTypeEnum.WEBHOOK:
            return convertWebhookFromNotificationChannel(channel) as INotificationChannelDefinitionObject;
        case DeclarativeNotificationChannelDestinationTypeEnum.SMTP:
            return convertCustomEmailFromNotificationChannel(channel) as INotificationChannelDefinitionObject;
        case DeclarativeNotificationChannelDestinationTypeEnum.DEFAULT_SMTP:
            return convertDefaultEmailFromNotificationChannel(
                channel,
            ) as INotificationChannelDefinitionObject;
        default:
            throw new Error(`Unknown notification channel type: ${channel.attributes?.destinationType}`);
    }
}

export function convertWebhookFromNotificationChannel(
    channel: INotificationChannel,
): IWebhookDefinitionObject {
    const wh = channel.attributes?.destination as Webhook | undefined;
    return {
        id: channel.id,
        type: "webhook",
        destination: {
            name: channel.attributes?.name ?? "",
            endpoint: wh?.url ?? "",
            token: wh?.token ?? "",
            hasToken: wh?.hasToken ?? false,
        },
        triggers:
            channel.attributes?.triggers?.map((trigger) => ({
                type: trigger.type,
                ...(isAllowedOn(trigger.metadata) ? { allowOn: trigger.metadata.allowedOn } : {}),
            })) ?? [],
    };
}

export function convertEmailFromNotificationChannel(channel: INotificationChannel): ISmtpDefinitionObject {
    switch (channel.attributes?.destinationType) {
        case DeclarativeNotificationChannelDestinationTypeEnum.SMTP:
            return convertCustomEmailFromNotificationChannel(channel);
        case DeclarativeNotificationChannelDestinationTypeEnum.DEFAULT_SMTP:
            return convertDefaultEmailFromNotificationChannel(channel);
        default:
            throw new Error(`Unknown email channel type: ${channel.attributes?.destinationType}`);
    }
}

export function convertCustomEmailFromNotificationChannel(
    channel: INotificationChannel,
): ISmtpDefinitionObject {
    const wh = channel.attributes?.destination as Smtp | undefined;
    return {
        id: channel.id,
        type: "smtp",
        destination: {
            type: "custom",
            name: channel.attributes?.name ?? "",
            address: wh?.fromEmail ?? "",
            person: wh?.fromEmailName ?? "",
            from: wh?.host ?? "",
            port: wh?.port ?? 25,
            login: wh?.username ?? "",
            password: wh?.password ?? "",
            hasPassword: true,
        },
        triggers:
            channel.attributes?.triggers?.map((trigger) => ({
                type: trigger.type,
                ...(isAllowedOn(trigger.metadata) ? { allowOn: trigger.metadata.allowedOn } : {}),
            })) ?? [],
    };
}

export function convertDefaultEmailFromNotificationChannel(
    channel: INotificationChannel,
): ISmtpDefinitionObject {
    const wh = channel.attributes?.destination as Smtp | undefined;
    return {
        id: channel.id,
        type: "smtp",
        destination: {
            type: "default",
            name: channel.attributes?.name ?? "",
            address: wh?.fromEmail ?? "",
            person: wh?.fromEmailName ?? "",
        },
        triggers:
            channel.attributes?.triggers?.map((trigger) => ({
                type: trigger.type,
                ...(isAllowedOn(trigger.metadata) ? { allowOn: trigger.metadata.allowedOn } : {}),
            })) ?? [],
    };
}

interface INotificationChannelAllowedOn {
    allowedOn: INotificationChannelTrigger["allowOn"];
}

function isAllowedOn(obj: any): obj is INotificationChannelAllowedOn {
    return !!(typeof obj === "object" && obj.allowedOn && Array.isArray(obj.allowedOn));
}
