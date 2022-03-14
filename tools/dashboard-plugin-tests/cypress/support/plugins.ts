// (C) 2019-2022 GoodData Corporation
import { idRef } from "@gooddata/sdk-model";
import { IDashboardPlugin, IDashboardPluginLink } from "@gooddata/sdk-backend-spi";
import snakeCase from "lodash/snakeCase";

function convertToPluginIdentifier(name: string): string {
    return `dp_${snakeCase(name)}`;
}

/**
 * @internal
 */
export function newTestPlugin(id: string): IDashboardPlugin {
    return {
        identifier: id,
        name: id,
        ref: idRef(id),
        tags: [],
        type: "IDashboardPlugin",
        uri: `/${id}`,
        url: `${location.origin}/dashboard-plugin-tests/plugins/${id}/${convertToPluginIdentifier(id)}.js`,
    };
}

/**
 * @internal
 */
export function newTestPluginLink(plugin: IDashboardPlugin, parameters?: string): IDashboardPluginLink {
    return {
        type: "IDashboardPluginLink",
        plugin: plugin.ref,
        parameters,
    };
}
