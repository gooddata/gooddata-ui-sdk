// (C) 2022-2024 GoodData Corporation

/**
 * @alpha
 */
export interface IWebhookMetadataObject extends IWebhookMetadataObjectBase {
    /**
     * Optional identifier of the webhook.
     */
    id: string;
}

/**
 * @alpha
 */
export interface IWebhookMetadataObjectDefinition
    extends Partial<IWebhookMetadataObjectBase>,
        Partial<Pick<IWebhookMetadataObject, "id">> {}

/**
 * @alpha
 */
export interface IWebhookMetadataObjectBase {
    /**
     * Name of the webhook.
     */
    name: string;
    /**
     * URL of the webhook endpoint.
     */
    endpoint: string;
    /**
     * Optional token to be used for authentication as bearer token.
     */
    token?: string;
    /**
     * Flag indicating whether the webhook has setup a token.
     */
    hasToken?: boolean;
    /**
     * Triggers that the webhook are used for.
     */
    triggers: IWebhookTrigger[];
}

/**
 * @alpha
 */
export interface IWebhookTrigger {
    /**
     * Type of the trigger.
     */
    type: "SCHEDULE" | "ALERT";
    /**
     * Optional list of objects that specify where the trigger is allowed to be used.
     */
    allowOn?: ("dashboard" | "visualization")[];
}
