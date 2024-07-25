// (C) 2023-2024 GoodData Corporation

import { ITigerClient } from "@gooddata/api-client-tiger";
import { IWebhookMetadataObject, IWebhookMetadataObjectDefinition } from "@gooddata/sdk-model";
import { IOrganizationNotificationChannelService } from "@gooddata/sdk-backend-spi";

import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { convertWebhookFromNotificationChannel } from "../../convertors/fromBackend/NotificationChannelsConvertor.js";
import {
    convertWebhookToNotificationChannel,
    convertCreateWebhookToNotificationChannel,
} from "../../convertors/toBackend/NotificationChannelsConvertor.js";

export class OrganizationNotificationChannelService implements IOrganizationNotificationChannelService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    /**
     * @alpha
     * Get all webhooks
     * @returns Promise resolved with array of webhooks.
     */
    public getWebhooks = async (): Promise<IWebhookMetadataObject[]> => {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getAllEntitiesNotificationChannels({});
            const channels = result.data?.data || [];

            const webhooks = channels.filter((webhook) => webhook.attributes?.webhook);
            return webhooks.map((webhook) => convertWebhookFromNotificationChannel(webhook));
        });
    };

    /**
     * @alpha
     * Get webhook by id
     *
     * @param id - id of the webhook
     */
    public getWebhook = async (id: string): Promise<IWebhookMetadataObject> => {
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
    public createWebhook = async (
        webhook: IWebhookMetadataObjectDefinition,
    ): Promise<IWebhookMetadataObject> => {
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
     * Update existing webhook
     *
     * @param webhook - definition of the webhook
     * @returns Promise resolved when the webhook is updated.
     */
    public updateWebhook = async (webhook: IWebhookMetadataObject): Promise<IWebhookMetadataObject> => {
        //NOTE: If webhook has token but token is undefined, we need to patch the webhook
        // instead of updating it because we want to keep the token on the backend
        if (webhook.hasToken && webhook.token === undefined) {
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
        return this.authCall(async (client: ITigerClient) => {
            await client.entities.deleteEntityNotificationChannels({ id });
        });
    }
}
