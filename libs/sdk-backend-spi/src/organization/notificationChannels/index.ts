// (C) 2023-2024 GoodData Corporation

import { IWebhookMetadataObject, IWebhookMetadataObjectDefinition } from "@gooddata/sdk-model";

/**
 * This service provides access to organization notifications channels.
 *
 * @alpha
 */
export interface IOrganizationNotificationChannelService {
    /**
     * Get all webhooks
     *
     * @returns Promise resolved with array of webhooks.
     * @throws In case of error.
     */
    getWebhooks(): Promise<IWebhookMetadataObject[]>;

    /**
     * Get webhook by id
     *
     * @param id - id of the webhook
     * @returns Promise resolved with webhook definition or undefined if not found.
     */
    getWebhook(id: string): Promise<IWebhookMetadataObject>;

    /**
     * Create new webhook
     *
     * @param webhook - definition of the webhook
     * @returns Promise resolved with created webhook.
     */
    createWebhook(webhook: IWebhookMetadataObjectDefinition): Promise<IWebhookMetadataObject>;

    /**
     * Update existing webhook
     *
     * @param webhook - definition of the webhook
     * @returns Promise resolved when the webhook is updated.
     */
    updateWebhook(webhook: IWebhookMetadataObject): Promise<IWebhookMetadataObject>;

    /**
     * Delete webhook
     *
     * @param id - id of the webhook
     * @returns Promise resolved when the webhook is deleted.
     */
    deleteWebhook(id: string): Promise<void>;
}
