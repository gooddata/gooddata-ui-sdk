// (C) 2021-2025 GoodData Corporation
import {
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    NotificationChannelDestinationType,
} from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";

export function loadNotificationChannels(
    ctx: DashboardContext,
    enableInPlatformNotifications: boolean,
    enableNotificationChannelIdentifiers: boolean,
): Promise<INotificationChannelIdentifier[] | INotificationChannelMetadataObject[]> {
    const { backend } = ctx;

    const typesToLoad: NotificationChannelDestinationType[] = ["smtp", "webhook"];

    if (enableInPlatformNotifications) {
        typesToLoad.push("inPlatform");
    }

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
