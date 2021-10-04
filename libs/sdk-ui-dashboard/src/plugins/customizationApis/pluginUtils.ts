// (C) 2021 GoodData Corporation

import { IDashboardPlugin } from "../plugin";

/**
 * Returns string that identifies a concrete plugin and can be used in log messages.
 *
 * @internal
 */
export function pluginDebugStr(plugin: IDashboardPlugin): string {
    return `${plugin.debugName ?? plugin.displayName}/${plugin.version}`;
}
