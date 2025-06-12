// (C) 2021 GoodData Corporation

import { ListCmdActionConfig } from "./actionConfig.js";
import { ActionOptions } from "../_base/types.js";
import { ListEntry } from "./types.js";

export async function listDashboardPlugins(
    config: ListCmdActionConfig,
    _options: ActionOptions,
): Promise<ListEntry[]> {
    const { backendInstance, workspace } = config;

    const plugins = await backendInstance.workspace(workspace).dashboards().getDashboardPlugins();

    return plugins.map((plugin) => {
        return {
            identifier: plugin.identifier,
            title: plugin.name,
            description: plugin.description,
            tags: plugin.tags,
            updated: plugin.updated ?? "unknown",
            created: plugin.created ?? "unknown",
        };
    });
}
