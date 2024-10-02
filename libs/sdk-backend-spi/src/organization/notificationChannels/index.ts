// (C) 2023-2024 GoodData Corporation

import {
    INotificationChannelDefinitionObject,
    IWebhookDefinitionObject,
    IWebhookDefinition,
    ISmtpDefinitionObject,
    ISmtpDefinition,
} from "@gooddata/sdk-model";

/**
 * This service provides access to organization notifications channels.
 *
 * @alpha
 */
export interface IOrganizationNotificationChannelService {
    /**
     * Get count of all notification channels
     */
    getCount(): Promise<number>;

    /**
     * Get all notification channels
     */
    getAll(): Promise<INotificationChannelDefinitionObject[]>;

    /**
     * Delete channel
     *
     * @param id - id of the channel
     * @returns Promise resolved when the channel is deleted.
     */
    deleteChannel(id: string): Promise<void>;

    /**
     * Get all emails
     *
     * @returns Promise resolved with array of emails.
     * @throws In case of error.
     */
    getEmails(): Promise<ISmtpDefinitionObject[]>;

    /**
     * Get email by id
     *
     * @param id - id of the smtp
     * @returns Promise resolved with smtp definition or undefined if not found.
     */
    getEmail(id: string): Promise<ISmtpDefinitionObject>;

    /**
     * Create new email
     *
     * @param smtp - definition of the smtp
     * @returns Promise resolved with created smtp.
     */
    createEmail(smtp: ISmtpDefinition): Promise<ISmtpDefinitionObject>;

    /**
     * Update existing email
     *
     * @param smtp - definition of the smtp
     * @returns Promise resolved when the smtp is updated.
     */
    updateEmail(smtp: ISmtpDefinitionObject): Promise<ISmtpDefinitionObject>;

    /**
     * Delete email
     *
     * @param id - id of the smtp
     * @returns Promise resolved when the smtp is deleted.
     */
    deleteEmail(id: string): Promise<void>;

    /**
     * Get all webhooks
     *
     * @returns Promise resolved with array of webhooks.
     * @throws In case of error.
     */
    getWebhooks(): Promise<IWebhookDefinitionObject[]>;

    /**
     * Get webhook by id
     *
     * @param id - id of the webhook
     * @returns Promise resolved with webhook definition or undefined if not found.
     */
    getWebhook(id: string): Promise<IWebhookDefinitionObject>;

    /**
     * Create new webhook
     *
     * @param webhook - definition of the webhook
     * @returns Promise resolved with created webhook.
     */
    createWebhook(webhook: IWebhookDefinition): Promise<IWebhookDefinitionObject>;

    /**
     * Update existing webhook
     *
     * @param webhook - definition of the webhook
     * @returns Promise resolved when the webhook is updated.
     */
    updateWebhook(webhook: IWebhookDefinitionObject): Promise<IWebhookDefinitionObject>;

    /**
     * Delete webhook
     *
     * @param id - id of the webhook
     * @returns Promise resolved when the webhook is deleted.
     */
    deleteWebhook(id: string): Promise<void>;
}
