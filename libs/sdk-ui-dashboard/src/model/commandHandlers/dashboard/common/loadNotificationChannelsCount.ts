// (C) 2021-2025 GoodData Corporation
import { ISettings, NotificationChannelDestinationType } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function loadNotificationChannelsCount(ctx: DashboardContext, settings: ISettings): Promise<number> {
    const { backend } = ctx;

    if (!(settings?.enableScheduling || settings?.enableAlerting) || ctx.config?.isReadOnly) {
        return Promise.resolve(0);
    }

    const typesToLoad: NotificationChannelDestinationType[] = ["smtp", "webhook"];

    if (settings?.enableInPlatformNotifications) {
        typesToLoad.push("inPlatform");
    }

    if (settings?.enableNotificationChannelIdentifiers) {
        return backend
            .organizations()
            .getCurrentOrganization()
            .then((organization) => {
                return organization
                    .notificationChannels()
                    .getNotificationChannelsQuery()
                    .withTypes(typesToLoad)
                    .withSize(1)
                    .queryIdentifiers();
            })
            .then((result) => result.totalCount ?? 0);
    }

    return backend
        .organizations()
        .getCurrentOrganization()
        .then((organization) => {
            return organization
                .notificationChannels()
                .getNotificationChannelsQuery()
                .withTypes(typesToLoad)
                .withSize(1)
                .query();
        })
        .then((result) => result.totalCount ?? 0);
}
