// (C) 2021 GoodData Corporation

import { IDashboardPluginContract_V1 } from "../plugin.js";

/**
 * Returns string that identifies a concrete plugin and can be used in log messages.
 *
 * @internal
 */
export function pluginDebugStr(plugin: IDashboardPluginContract_V1): string {
    return `${plugin.debugName ?? plugin.displayName}/${plugin.version}`;
}
