// (C) 2021-2024 GoodData Corporation
import { INotificationChannelMetadataObject, NotificationChannelDestinationType } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes.js";

export function loadNotificationChannels(
    ctx: DashboardContext,
    enableInPlatformNotifications: boolean,
): Promise<INotificationChannelMetadataObject[]> {
    const { backend } = ctx;

    const typesToLoad: NotificationChannelDestinationType[] = ["smtp", "webhook"];

    if (enableInPlatformNotifications) {
        typesToLoad.push("inPlatform");
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
