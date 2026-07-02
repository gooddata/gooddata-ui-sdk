// (C) 2021-2026 GoodData Corporation

import { NotSupported } from "@gooddata/sdk-backend-spi";
import { type ISettings, type NotificationChannelDestinationType } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export async function loadNotificationChannelsCount(
    ctx: DashboardContext,
    settings: ISettings,
): Promise<number> {
    const { backend } = ctx;

    if (ctx.config?.isReadOnly || ctx.config?.isExport || ctx.config?.initialRenderMode === "export") {
        return Promise.resolve(0);
    }

    const typesToLoad: NotificationChannelDestinationType[] = ["smtp", "webhook", "inPlatform"];

    try {
        const organization = await backend.organizations().getCurrentOrganization();

        if (settings?.enableNotificationChannelIdentifiers) {
            const result = await organization
                .notificationChannels()
                .getNotificationChannelsQuery()
                .withTypes(typesToLoad)
                .withSize(1)
                .queryIdentifiers();

            return result.totalCount ?? 0;
        }

        const result = await organization
            .notificationChannels()
            .getNotificationChannelsQuery()
            .withTypes(typesToLoad)
            .withSize(1)
            .query();

        return result.totalCount ?? 0;
    } catch (e) {
        if (e instanceof NotSupported) {
            return 0;
        }

        throw e;
    }
}
