// (C) 2022-2024 GoodData Corporation

/**
 * @alpha
 */
export interface INotificationChannelMetadataObject extends INotificationChannelMetadataObjectBase {
    /**
     * Optional identifier of the notification channel.
     */
    id: string;
}
/**
 * @alpha
 */
export interface INotificationChannelMetadataObjectBase {
    /**
     * Type of the notification channel.
     */
    type: "webhook" | "smtp";

    /**
     * Destination of the notification channel.
     */
    destination: IWebhookDestination | ISmtpDestination;

    /**
     * Triggers that the notification channel are used for.
     */
    triggers: INotificationChannelTrigger[];
}

/**
 * @alpha
 */
export interface INotificationChannelTrigger {
    /**
     * Type of the trigger.
     */
    type: "SCHEDULE" | "ALERT";
    /**
     * Optional list of objects that specify where the trigger is allowed to be used.
     */
    allowOn?: ("dashboard" | "visualization")[];
}

//Notification channel

/**
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface INotificationChannelDefinitionObject extends INotificationChannelMetadataObject {}

//Webhook

/**
 * @alpha
 */
export interface IWebhookDefinitionObject
    extends Partial<IWebhookDefinition>,
        Pick<INotificationChannelMetadataObject, "id"> {}

/**
 * @alpha
 */
export interface IWebhookDefinition extends INotificationChannelMetadataObjectBase {
    type: "webhook";
    destination: IWebhookDestination;
}

/**
 * @alpha
 */
export interface IWebhookDestination {
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
}

//SMTP

/**
 * @alpha
 */
export interface ISmtpDefinitionObject
    extends Partial<ISmtpDefinition>,
        Pick<INotificationChannelMetadataObject, "id"> {}

/**
 * @alpha
 */
export interface ISmtpDefinition extends INotificationChannelMetadataObjectBase {
    type: "smtp";
    destination: ISmtpDestination;
}

/**
 * @alpha
 */
export interface ISmtpDestination {
    /**
     * Name of the smtp.
     */
    name: string;
    /**
     * Name of the SMTP server.
     */
    from: string;
    /**
     * Email address of the sender.
     */
    address: string;
    /**
     * Port of the SMTP server.
     */
    port: 25 | 465 | 587 | 2525;
    /**
     * Login to the SMTP server.
     */
    login: string;
    /**
     * Password to the SMTP server.
     */
    password?: string;
    /**
     * Flag indicating whether the SMTP server has a password.
     */
    hasPassword?: boolean;
}
