// (C) 2023-2024 GoodData Corporation

import { ITigerClient } from "@gooddata/api-client-tiger";
import {
    INotificationChannelDefinitionObject,
    INotificationChannelTestResponse,
    ISmtpDefinition,
    ISmtpDefinitionObject,
    IWebhookDefinition,
    IWebhookDefinitionObject,
} from "@gooddata/sdk-model";
import { IOrganizationNotificationChannelService } from "@gooddata/sdk-backend-spi";

import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import {
    convertChannelFromNotificationChannel,
    convertEmailFromNotificationChannel,
    convertWebhookFromNotificationChannel,
} from "../../convertors/fromBackend/NotificationChannelsConvertor.js";
import {
    convertWebhookToNotificationChannel,
    convertCreateWebhookToNotificationChannel,
    convertCreateEmailToNotificationChannel,
    convertEmailToNotificationChannel,
} from "../../convertors/toBackend/NotificationChannelsConvertor.js";

export class OrganizationNotificationChannelService implements IOrganizationNotificationChannelService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    /**
     * @alpha
     *
     * Get all notification channels count.
     * @returns Promise resolved with number of notification channels.
     */
    public getCount = async (): Promise<number> => {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getAllEntitiesNotificationChannels({
                size: 1,
                metaInclude: ["page"],
            });
            return result.data.meta?.page?.totalElements ?? 0;
        });
    };

    /**
     * @alpha
     *
     * Get all notification channels
     * @returns Promise resolved with array of notification channels.
     */
    public getAll = async (): Promise<INotificationChannelDefinitionObject[]> => {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getAllEntitiesNotificationChannels({});
            const channels = result.data?.data || [];
            return channels.map((channel) => convertChannelFromNotificationChannel(channel));
        });
    };

    /**
     * @alpha
     * Delete webhook
     *
     * @param id - id of the webhook
     * @returns Promise resolved when the webhook is deleted.
     */
    public deleteChannel(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClient) => {
            await client.entities.deleteEntityNotificationChannels({ id });
        });
    }

    //webhooks

    /**
     * @alpha
     * Get all webhooks
     * @returns Promise resolved with array of webhooks.
     */
    public getWebhooks = async (): Promise<IWebhookDefinitionObject[]> => {
        return (await this.getAll()).filter(
            (channel) => channel.type === "webhook",
        ) as IWebhookDefinitionObject[];
    };

    /**
     * @alpha
     * Get webhook by id
     *
     * @param id - id of the webhook
     */
    public getWebhook = async (id: string): Promise<IWebhookDefinitionObject> => {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getEntityNotificationChannels({ id });
            return convertWebhookFromNotificationChannel(result.data.data);
        });
    };

    /**
     * @alpha
     * Create new webhook
     *
     * @param webhook - definition of the webhook
     * @returns Promise resolved with created webhook.
     */
    public createWebhook = async (webhook: IWebhookDefinition): Promise<IWebhookDefinitionObject> => {
        return this.authCall(async (client: ITigerClient) => {
            const channel = await client.entities.createEntityNotificationChannels({
                jsonApiNotificationChannelPostOptionalIdDocument: {
                    data: convertCreateWebhookToNotificationChannel(webhook),
                },
            });
            return convertWebhookFromNotificationChannel(channel.data.data);
        });
    };

    /**
     * @alpha
     * Test webhook
     *
     * This method will test the webhook by sending a test notification to the destination.
     * @param webhook - definition of the webhook
     * @returns Promise resolved with the response from the test.
     */
    public testWebhook = async (webhook: IWebhookDefinition): Promise<INotificationChannelTestResponse> => {
        const obj = convertCreateWebhookToNotificationChannel(webhook);
        const destination = obj.attributes?.destination;
        if (!destination) {
            throw new Error("Missing destination in the webhook");
        }

        return this.authCall(async (client: ITigerClient) => {
            const result = await client.automation.testNotificationChannel({
                testDestinationRequest: {
                    destination,
                },
            });
            return result.data;
        });
    };

    /**
     * @alpha
     * Update existing webhook
     *
     * @param webhook - definition of the webhook
     * @returns Promise resolved when the webhook is updated.
     */
    public updateWebhook = async (webhook: IWebhookDefinitionObject): Promise<IWebhookDefinitionObject> => {
        //NOTE: If webhook has token but token is undefined, we need to patch the webhook
        // instead of updating it because we want to keep the token on the backend
        if (webhook.destination?.hasToken && webhook.destination?.token === undefined) {
            return this.authCall(async (client: ITigerClient) => {
                const channel = await client.entities.patchEntityNotificationChannels({
                    id: webhook.id,
                    jsonApiNotificationChannelPatchDocument: {
                        data: convertWebhookToNotificationChannel(webhook),
                    },
                });
                return convertWebhookFromNotificationChannel(channel.data.data);
            });
        }

        return this.authCall(async (client: ITigerClient) => {
            const channel = await client.entities.updateEntityNotificationChannels({
                id: webhook.id,
                jsonApiNotificationChannelInDocument: {
                    data: convertWebhookToNotificationChannel(webhook),
                },
            });
            return convertWebhookFromNotificationChannel(channel.data.data);
        });
    };

    /**
     * @alpha
     * Delete webhook
     *
     * @param id - id of the webhook
     * @returns Promise resolved when the webhook is deleted.
     */
    public deleteWebhook(id: string): Promise<void> {
        return this.deleteChannel(id);
    }

    //emails

    /**
     * @alpha
     * Get all emails
     * @returns Promise resolved with array of emails.
     */
    public getEmails = async (): Promise<ISmtpDefinitionObject[]> => {
        return (await this.getAll()).filter((channel) => channel.type === "smtp") as ISmtpDefinitionObject[];
    };

    /**
     * @alpha
     * Get email by id
     *
     * @param id - id of the email
     */
    public getEmail = async (id: string): Promise<ISmtpDefinitionObject> => {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getEntityNotificationChannels({ id });
            return convertEmailFromNotificationChannel(result.data.data);
        });
    };

    /**
     * @alpha
     * Create new email
     *
     * @param smtp - definition of the smtp
     * @returns Promise resolved with created smtp.
     */
    public createEmail = async (smtp: ISmtpDefinition): Promise<ISmtpDefinitionObject> => {
        return this.authCall(async (client: ITigerClient) => {
            const channel = await client.entities.createEntityNotificationChannels({
                jsonApiNotificationChannelPostOptionalIdDocument: {
                    data: convertCreateEmailToNotificationChannel(smtp),
                },
            });
            return convertEmailFromNotificationChannel(channel.data.data);
        });
    };

    /**
     * @alpha
     * Test email
     *
     * This method will test the email by sending a test notification to the destination.
     * @param smtp - definition of the email
     * @returns Promise resolved with the response from the test.
     */
    public testEmail = async (smtp: ISmtpDefinition): Promise<INotificationChannelTestResponse> => {
        const obj = convertCreateEmailToNotificationChannel(smtp);
        const destination = obj.attributes?.destination;
        if (!destination) {
            throw new Error("Missing destination in the email");
        }

        return this.authCall(async (client: ITigerClient) => {
            const result = await client.automation.testNotificationChannel({
                testDestinationRequest: {
                    destination,
                },
            });
            return result.data;
        });
    };

    /**
     * @alpha
     * Update existing email
     *
     * @param smtp - definition of the email
     * @returns Promise resolved when the email is updated.
     */
    public updateEmail = async (smtp: ISmtpDefinitionObject): Promise<ISmtpDefinitionObject> => {
        //NOTE: If smtp has password but password is undefined, we need to patch the smtp
        // instead of updating it because we want to keep the password on the backend
        if (
            smtp.destination?.type === "custom" &&
            smtp.destination?.hasPassword &&
            smtp.destination?.password === undefined
        ) {
            return this.authCall(async (client: ITigerClient) => {
                const channel = await client.entities.patchEntityNotificationChannels({
                    id: smtp.id,
                    jsonApiNotificationChannelPatchDocument: {
                        data: convertEmailToNotificationChannel(smtp),
                    },
                });
                return convertEmailFromNotificationChannel(channel.data.data);
            });
        }

        return this.authCall(async (client: ITigerClient) => {
            const channel = await client.entities.updateEntityNotificationChannels({
                id: smtp.id,
                jsonApiNotificationChannelInDocument: {
                    data: convertEmailToNotificationChannel(smtp),
                },
            });
            return convertEmailFromNotificationChannel(channel.data.data);
        });
    };

    /**
     * @alpha
     * Delete email
     *
     * @param id - id of the smtp
     * @returns Promise resolved when the smtp is deleted.
     */
    public deleteEmail(id: string): Promise<void> {
        return this.deleteChannel(id);
    }
}
