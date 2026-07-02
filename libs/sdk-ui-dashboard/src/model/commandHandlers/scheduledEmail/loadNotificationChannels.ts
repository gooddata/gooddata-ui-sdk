// (C) 2021-2026 GoodData Corporation

import {
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type NotificationChannelDestinationType,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

export function loadNotificationChannels(
    ctx: DashboardContext,
    enableNotificationChannelIdentifiers: boolean,
): Promise<INotificationChannelIdentifier[] | INotificationChannelMetadataObject[]> {
    const { backend } = ctx;

    const typesToLoad: NotificationChannelDestinationType[] = ["smtp", "webhook", "inPlatform"];

    if (enableNotificationChannelIdentifiers) {
        return backend
            .organizations()
            .getCurrentOrganization()
            .then((organization) => {
                return organization
                    .notificationChannels()
                    .getNotificationChannelsQuery()
                    .withTypes(typesToLoad)
                    .queryAllIdentifiers();
            });
    }

    return backend
        .organizations()
        .getCurrentOrganization()
        .then((organization) => {
            return organization
                .notificationChannels()
                .getNotificationChannelsQuery()
                .withTypes(typesToLoad)
                .queryAll();
        });
}
