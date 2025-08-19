// (C) 2021-2025 GoodData Corporation

import { ListCmdActionConfig } from "./actionConfig.js";
import { ListEntry } from "./types.js";
import { ActionOptions } from "../_base/types.js";

export async function listDashboards(
    config: ListCmdActionConfig,
    _options: ActionOptions,
): Promise<ListEntry[]> {
    const { backendInstance, workspace } = config;

    const dashboards = await backendInstance.workspace(workspace).dashboards().getDashboards();

    return dashboards.map((dashboard) => {
        return {
            identifier: dashboard.identifier,
            title: dashboard.title,
            description: dashboard.description,
            tags: dashboard.tags ?? [],
            created: dashboard.created ?? "unknown",
            updated: dashboard.updated ?? "unknown",
        };
    });
}
