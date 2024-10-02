// (C) 2021-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function loadNotificationChannelsCount(ctx: DashboardContext, settings: ISettings): Promise<number> {
    const { backend } = ctx;

    if (!(settings?.enableScheduling || settings?.enableAlerting)) {
        return Promise.resolve(0);
    }

    return backend
        .organizations()
        .getCurrentOrganization()
        .then((organization) => {
            return organization.notificationChannels().getCount();
        });
}
