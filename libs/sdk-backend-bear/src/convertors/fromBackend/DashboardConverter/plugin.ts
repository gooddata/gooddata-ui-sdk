// (C) 2021-2022 GoodData Corporation

import { IWrappedDashboardPlugin } from "@gooddata/api-model-bear";
import { uriRef, IDashboardPlugin, IUser } from "@gooddata/sdk-model";

export function convertDashboardPlugin(
    plugin: IWrappedDashboardPlugin,
    userMap?: Map<string, IUser>,
): IDashboardPlugin {
    const {
        dashboardPlugin: {
            content: { url },
            meta: { title, summary, uri, identifier, updated, created, tags, author, contributor },
        },
    } = plugin;

    return {
        type: "IDashboardPlugin",
        name: title,
        description: summary ?? "",
        uri: uri!,
        identifier: identifier!,
        updated: updated,
        created: created,
        createdBy: author ? userMap?.get(author) : undefined,
        updatedBy: contributor ? userMap?.get(contributor) : undefined,
        tags: tags?.split(" ").filter((t) => t) ?? [],
        ref: uriRef(uri!),
        url: url,
    };
}
