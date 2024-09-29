// (C) 2021-2024 GoodData Corporation
import { INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes.js";

export function loadNotificationChannels(
    ctx: DashboardContext,
): Promise<INotificationChannelMetadataObject[]> {
    const { backend } = ctx;

    return backend
        .organizations()
        .getCurrentOrganization()
        .then((organization) => {
            return organization.notificationChannels().getAll();
        });
}
