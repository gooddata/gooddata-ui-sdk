// (C) 2022 GoodData Corporation
import { GdcProjectDashboard } from "@gooddata/api-model-bear";
import { ILegacyDashboard, uriRef, ILegacyDashboardTab } from "@gooddata/sdk-model";

export function projectDashboardToLegacyDashboard(
    data: GdcProjectDashboard.IWrappedProjectDashboard[],
): ILegacyDashboard[] {
    return data.map((item) => {
        const { content, meta } = item.projectDashboard;
        return {
            identifier: meta.identifier!,
            uri: meta.uri!,
            ref: uriRef(meta.uri!),
            title: meta.title,
            tabs: content.tabs.map((tab): ILegacyDashboardTab => {
                return {
                    identifier: tab.identifier,
                    title: tab.title,
                };
            }),
        };
    });
}
