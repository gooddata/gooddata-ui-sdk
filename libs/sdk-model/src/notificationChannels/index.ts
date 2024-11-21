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
     * Allowed recipients of notifications from this channel.
     */
    allowedRecipients?: NotificationChannelAllowedRecipient;
}

/**
 * @alpha
 */
export type NotificationChannelAllowedRecipient = "CREATOR" | "INTERNAL";

//Notification channel

/**
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface INotificationChannelDefinitionObject extends INotificationChannelMetadataObject {}

/**
 * @alpha
 */
export interface INotificationChannelConfiguration {
    /**
     * @alpha
     * URL of the dashboard.
     */
    dashboardUrl?: string;
}

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
    configuration: INotificationChannelConfiguration;
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
    configuration: INotificationChannelConfiguration;
}

/**
 * @alpha
 */
export type ISmtpDestination = ICustomSmtpDestination | IDefaultSmtpDestination;

/**
 * @alpha
 */
export type ICustomSmtpDestination = {
    /**
     * Type of the SMTP.
     */
    type: "custom";
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
     * Who the email is from.
     */
    person: string;
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
};

/**
 * @alpha
 */
export type IDefaultSmtpDestination = {
    /**
     * Type of the SMTP.
     */
    type: "default";
    /**
     * Name of the smtp.
     */
    name: string;
    /**
     * Email address of the sender.
     */
    address: string;
    /**
     * Who the email is from.
     */
    person: string;
};

//Test

/**
 * @alpha
 */
export interface INotificationChannelTestResponse {
    /**
     * Flag indicating whether the test was successful.
     */
    successful: boolean;
    /**
     * Optional error message in case the test was not successful.
     */
    error?: string;
}
