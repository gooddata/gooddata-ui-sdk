// (C) 2021-2026 GoodData Corporation

import { type ActionOptions } from "../_base/types.js";
import { type ListCmdActionConfig } from "./actionConfig.js";
import { type ListEntry } from "./types.js";

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
