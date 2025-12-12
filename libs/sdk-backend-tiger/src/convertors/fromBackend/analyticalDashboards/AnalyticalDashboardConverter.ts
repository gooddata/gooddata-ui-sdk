// (C) 2020-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    AnalyticalDashboardModelV1,
    AnalyticalDashboardModelV2,
    type JsonApiAnalyticalDashboardOut,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiAnalyticalDashboardOutIncludes,
    type JsonApiAnalyticalDashboardOutList,
    type JsonApiAnalyticalDashboardOutWithLinks,
    type JsonApiDashboardPluginOutDocument,
    type JsonApiDashboardPluginOutWithLinks,
    type JsonApiFilterContextOutDocument,
} from "@gooddata/api-client-tiger";
import {
    type IDashboard,
    type IDashboardPlugin,
    type IFilterContext,
    type IListedDashboard,
    idRef,
} from "@gooddata/sdk-model";

import { isInheritedObject } from "../ObjectInheritance.js";
import { convertUserIdentifier } from "../UsersConverter.js";
import { getShareStatus } from "../utils.js";
import {
    convertDashboard as convertDashboardV1,
    convertFilterContextFromBackend as convertFilterContextFromBackendV1,
} from "./v1/AnalyticalDashboardConverter.js";
import {
    convertDashboardPlugin as convertDashboardPluginV2,
    convertDashboardPluginWithLinks as convertDashboardPluginWithLinksV2,
    convertDashboard as convertDashboardV2,
    convertFilterContextFromBackend as convertFilterContextFromBackendV2,
} from "./v2/AnalyticalDashboardConverter.js";

export const convertAnalyticalDashboard = (
    analyticalDashboard: JsonApiAnalyticalDashboardOut | JsonApiAnalyticalDashboardOutWithLinks,
    included?: JsonApiAnalyticalDashboardOutIncludes[],
): IListedDashboard => {
    const { id, attributes, meta, relationships = {} } = analyticalDashboard;
    const { createdBy, modifiedBy } = relationships;
    const { createdAt, modifiedAt } = attributes;
    const links = "links" in analyticalDashboard ? analyticalDashboard.links : undefined;
    const isPrivate = meta?.accessInfo?.private ?? false;

    // Use type guard for safer access to dashboard content
    const content = attributes?.content;
    const tabs = AnalyticalDashboardModelV2.isAnalyticalDashboard(content) ? (content.tabs ?? []) : [];

    return {
        ref: idRef(id, "analyticalDashboard"),
        uri: links?.self ?? "",
        identifier: id,
        title: attributes?.title ?? "",
        description: attributes?.description ?? "",
        created: createdAt ?? "",
        createdBy: convertUserIdentifier(createdBy, included),
        updated: modifiedAt ?? "",
        updatedBy: convertUserIdentifier(modifiedBy, included),
        tags: attributes?.tags ?? [],
        isLocked: isInheritedObject(analyticalDashboard),
        shareStatus: getShareStatus(isPrivate),
        sharePermissions: meta?.permissions,
        isUnderStrictControl: true,
        availability: "full",
        ...(tabs.length > 0 ? { tabs } : {}),
    };
};

export const convertAnalyticalDashboardToListItems = (
    analyticalDashboards: JsonApiAnalyticalDashboardOutList,
): IListedDashboard[] => {
    return analyticalDashboards.data.map((dashboard) =>
        convertAnalyticalDashboard(dashboard, analyticalDashboards.included),
    );
};

export function convertDashboard(
    analyticalDashboard: JsonApiAnalyticalDashboardOutDocument,
    filterContext?: IFilterContext,
): IDashboard {
    const content = analyticalDashboard.data.attributes!.content;

    if (AnalyticalDashboardModelV1.isAnalyticalDashboard(content)) {
        return convertDashboardV1(analyticalDashboard, filterContext);
    }

    if (AnalyticalDashboardModelV2.isAnalyticalDashboard(content)) {
        return convertDashboardV2(analyticalDashboard, filterContext);
    }

    invariant(false, "Unknown analytical dashboard version");
}

export function convertFilterContextFromBackend(
    filterContext: JsonApiFilterContextOutDocument,
): IFilterContext {
    const content = filterContext.data.attributes!.content;

    if (AnalyticalDashboardModelV1.isFilterContext(content)) {
        return convertFilterContextFromBackendV1(filterContext);
    }

    if (AnalyticalDashboardModelV2.isFilterContext(content)) {
        return convertFilterContextFromBackendV2(filterContext);
    }

    invariant(false, "Unknown filter context version");
}

export function convertDashboardPluginFromBackend(
    plugin: JsonApiDashboardPluginOutDocument,
): IDashboardPlugin {
    const content = plugin.data.attributes!.content;

    // V1 does not support plugins

    if (AnalyticalDashboardModelV2.isDashboardPlugin(content)) {
        return convertDashboardPluginV2(plugin);
    }

    invariant(false, "Unknown dashboard plugin version");
}

export function convertDashboardPluginWithLinksFromBackend(
    plugin: JsonApiDashboardPluginOutWithLinks,
    included?: JsonApiAnalyticalDashboardOutIncludes[],
): IDashboardPlugin {
    const content = plugin.attributes!.content;

    // V1 does not support plugins

    if (AnalyticalDashboardModelV2.isDashboardPlugin(content)) {
        return convertDashboardPluginWithLinksV2(plugin, included);
    }

    invariant(false, "Unknown dashboard plugin version");
}

// Re-export common utilities for backward compatibility
export { getFilterContextFromIncluded, getFilterContextsFromIncluded } from "./common/filterContextUtils.js";
