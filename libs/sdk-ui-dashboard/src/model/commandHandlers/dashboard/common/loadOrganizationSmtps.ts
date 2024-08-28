// (C) 2021-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { DashboardContext, Smtps } from "../../../types/commonTypes.js";

export function loadOrganizationSmtps(ctx: DashboardContext, settings: ISettings): Promise<Smtps> {
    const { backend } = ctx;

    if (!settings?.enableScheduling || !settings?.enableSmtp) {
        return Promise.resolve([]);
    }

    return backend
        .organizations()
        .getCurrentOrganization()
        .then((organization) => {
            return organization.notificationChannels().getEmails();
        });
}
