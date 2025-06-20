// (C) 2023-2025 GoodData Corporation

import { ITigerClient } from "@gooddata/api-client-tiger";
import {
    assertNever,
    INotificationChannelExternalRecipient,
    INotificationChannelMetadataObject,
    INotificationChannelMetadataObjectDefinition,
    INotificationChannelTestResponse,
    ISmtpNotificationChannelMetadataObject,
    IWebhookNotificationChannelMetadataObject,
    ToNotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
import {
    INotificationChannelsQuery,
    IOrganizationNotificationChannelService,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";

import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { convertNotificationChannelFromBackend } from "../../convertors/fromBackend/NotificationChannelsConvertor.js";
import { convertNotificationChannelToBackend } from "../../convertors/toBackend/NotificationChannelsConvertor.js";
import { NotificationChannelsQuery } from "./notificationChannelsQuery.js";

export class OrganizationNotificationChannelService implements IOrganizationNotificationChannelService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    /**
     * Test notification channel
     * This method will test the notification channel by sending a test notification to the destination.
     *
     * @param channel - definition of the notification channel
     * @param externalRecipients - external recipients of the test result
     * @returns Promise resolved with the response from the test.
     *
     * @beta
     */
    public testNotificationChannel = async (
        channel: INotificationChannelMetadataObject | INotificationChannelMetadataObjectDefinition,
        externalRecipients?: INotificationChannelExternalRecipient[],
    ): Promise<INotificationChannelTestResponse> => {
        const convertedChannel = convertNotificationChannelToBackend(channel);

        const destination = convertedChannel.attributes?.destination;
        if (!destination) {
            throw new UnexpectedError("Cannot test notification channel with empty destination.");
        }

        if ("id" in channel && channel.id) {
            return this.authCall(async (client: ITigerClient) => {
                const result = await client.automation.testExistingNotificationChannel({
                    notificationChannelId: channel.id,
                    automationTestDestinationRequest: {
                        destination,
                        externalRecipients,
                    },
                });
                return result.data;
            });
        }

        return this.authCall(async (client: ITigerClient) => {
            const result = await client.automation.testNotificationChannel({
                automationTestDestinationRequest: {
                    destination,
                    externalRecipients,
                },
            });
            return result.data;
        });
    };

    /**
     * Get notification channel by id
     * @param id - id of the notification channel
     * @returns Promise resolved with notification channel.
     *
     * @beta
     */
    public getNotificationChannel(id: string): Promise<INotificationChannelMetadataObject> {
        return this.authCall(async (client: ITigerClient) => {
            const result = await client.entities.getEntityNotificationChannels({ id });
            const convertedChannel = convertNotificationChannelFromBackend(result.data.data);
            if (!convertedChannel) {
                throw new UnexpectedError(`Notification channel with id ${id} not found`);
            }
            return convertedChannel;
        });
    }

    /**
     * Create new notification channel
     *
     * @param notificationChannel - definition of the notification channel
     * @returns Promise resolved with created notification channel.
     *
     * @beta
     */
    public createNotificationChannel<T extends INotificationChannelMetadataObjectDefinition>(
        notificationChannel: T,
    ): Promise<ToNotificationChannelMetadataObject<T>> {
        return this.authCall(async (client: ITigerClient) => {
            const channel = await client.entities.createEntityNotificationChannels({
                jsonApiNotificationChannelPostOptionalIdDocument: {
                    data: convertNotificationChannelToBackend(notificationChannel),
                },
            });
            const convertedChannel = convertNotificationChannelFromBackend(
                channel.data.data,
            ) as ToNotificationChannelMetadataObject<T>;
            if (!convertedChannel) {
                throw new UnexpectedError(`Failed to create notification channel`);
            }
            return convertedChannel;
        });
    }

    /**
     * Update existing notification channel
     *
     * @param notificationChannel - definition of the notification channel
     * @returns Promise resolved with updated notification channel.
     *
     * @beta
     */
    public updateNotificationChannel<T extends INotificationChannelMetadataObject>(
        notificationChannel: T,
    ): Promise<T> {
        return this.authCall(async (client: ITigerClient) => {
            const destinationType = notificationChannel.destinationType;
            switch (destinationType) {
                case "smtp":
                    return this.updateSmtpNotificationChannel(notificationChannel) as unknown as T;
                case "webhook":
                    return this.updateWebhookNotificationChannel(notificationChannel) as unknown as T;
                case "inPlatform": {
                    const channel = await client.entities.updateEntityNotificationChannels({
                        id: notificationChannel.id,
                        jsonApiNotificationChannelInDocument: {
                            data: convertNotificationChannelToBackend(notificationChannel),
                        },
                    });
                    const convertedChannel = convertNotificationChannelFromBackend(channel.data.data) as T;
                    if (!convertedChannel) {
                        throw new UnexpectedError(`Failed to update notification channel`);
                    }
                    return convertedChannel;
                }
                default:
                    assertNever(destinationType);
                    throw new UnexpectedError(`Unknown notification channel type: ${destinationType}`);
            }
        });
    }

    /**
     * Delete notification channel.
     *
     * @param id - id of the notification channel
     * @returns Promise resolved when the notification channel is deleted.
     *
     * @beta
     */
    public deleteNotificationChannel(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClient) => {
            await client.entities.deleteEntityNotificationChannels({ id });
        });
    }

    /**
     * Query notification channels
     *
     * @beta
     */
    public getNotificationChannelsQuery = (): INotificationChannelsQuery => {
        return new NotificationChannelsQuery(this.authCall);
    };

    //
    // PRIVATE METHODS
    //

    /**
     * @internal
     */
    private updateSmtpNotificationChannel = async (
        smtp: ISmtpNotificationChannelMetadataObject,
    ): Promise<ISmtpNotificationChannelMetadataObject> => {
        //NOTE: If smtp has password but password is undefined, we need to patch the smtp
        // instead of updating it because we want to keep the password on the backend
        if (smtp.destinationConfig?.type === "customSmtp" && !smtp.destinationConfig?.password) {
            return this.authCall(async (client: ITigerClient) => {
                const channel = await client.entities.patchEntityNotificationChannels({
                    id: smtp.id,
                    jsonApiNotificationChannelPatchDocument: {
                        data: convertNotificationChannelToBackend(smtp),
                    },
                });
                const convertedChannel = convertNotificationChannelFromBackend(
                    channel.data.data,
                ) as ISmtpNotificationChannelMetadataObject;
                if (!convertedChannel) {
                    throw new UnexpectedError(`Failed to update notification channel`);
                }
                return convertedChannel;
            });
        }

        return this.authCall(async (client: ITigerClient) => {
            const channel = await client.entities.updateEntityNotificationChannels({
                id: smtp.id,
                jsonApiNotificationChannelInDocument: {
                    data: convertNotificationChannelToBackend(smtp),
                },
            });
            const convertedChannel = convertNotificationChannelFromBackend(
                channel.data.data,
            ) as ISmtpNotificationChannelMetadataObject;
            if (!convertedChannel) {
                throw new UnexpectedError(`Failed to update notification channel`);
            }
            return convertedChannel;
        });
    };

    /**
     * @internal
     */
    private updateWebhookNotificationChannel = async (
        webhook: IWebhookNotificationChannelMetadataObject,
    ): Promise<IWebhookNotificationChannelMetadataObject> => {
        //NOTE: If webhook has token but token is undefined, we need to patch the webhook
        // instead of updating it because we want to keep the token on the backend
        if (webhook.destinationConfig?.hasToken && !webhook.destinationConfig?.token) {
            return this.authCall(async (client: ITigerClient) => {
                const channel = await client.entities.patchEntityNotificationChannels({
                    id: webhook.id,
                    jsonApiNotificationChannelPatchDocument: {
                        data: convertNotificationChannelToBackend(webhook),
                    },
                });

                const convertedChannel = convertNotificationChannelFromBackend(
                    channel.data.data,
                ) as IWebhookNotificationChannelMetadataObject;

                if (!convertedChannel) {
                    throw new UnexpectedError(`Failed to update notification channel`);
                }
                return convertedChannel;
            });
        }

        return this.authCall(async (client: ITigerClient) => {
            const channel = await client.entities.updateEntityNotificationChannels({
                id: webhook.id,
                jsonApiNotificationChannelInDocument: {
                    data: convertNotificationChannelToBackend(webhook),
                },
            });

            const convertedChannel = convertNotificationChannelFromBackend(
                channel.data.data,
            ) as IWebhookNotificationChannelMetadataObject;

            if (!convertedChannel) {
                throw new UnexpectedError(`Failed to update notification channel`);
            }
            return convertedChannel;
        });
    };
}
