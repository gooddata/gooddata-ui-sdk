// (C) 2021-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { DashboardContext, Webhooks } from "../../../types/commonTypes.js";

export function loadOrganizationWebhooks(ctx: DashboardContext, settings: ISettings): Promise<Webhooks> {
    const { backend } = ctx;

    if (!settings?.enableScheduling) {
        return Promise.resolve([]);
    }

    return backend
        .organizations()
        .getCurrentOrganization()
        .then((organization) => {
            return organization.notificationChannels().getWebhooks();
        });
}
