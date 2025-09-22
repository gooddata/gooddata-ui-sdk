// (C) 2020-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    AnalyticalDashboardModelV1,
    AnalyticalDashboardModelV2,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiAnalyticalDashboardOutIncludes,
    JsonApiAnalyticalDashboardOutList,
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiDashboardPluginOutDocument,
    JsonApiDashboardPluginOutWithLinks,
    JsonApiFilterContextOutDocument,
    JsonApiFilterContextOutWithLinks,
    isFilterContextData,
} from "@gooddata/api-client-tiger";
import {
    FilterContextItem,
    IDashboard,
    IDashboardPlugin,
    IFilterContext,
    IListedDashboard,
    ObjectType,
    idRef,
} from "@gooddata/sdk-model";

import { isInheritedObject } from "../ObjectInheritance.js";
import { convertUserIdentifier } from "../UsersConverter.js";
import { getShareStatus } from "../utils.js";
import {
    convertDashboard as convertDashboardV1,
    convertFilterContextFilters as convertFilterContextFiltersV1,
    convertFilterContextFromBackend as convertFilterContextFromBackendV1,
} from "./v1/AnalyticalDashboardConverter.js";
import {
    convertDashboardPlugin as convertDashboardPluginV2,
    convertDashboardPluginWithLinks as convertDashboardPluginWithLinksV2,
    convertDashboard as convertDashboardV2,
    convertFilterContextFilters as convertFilterContextFiltersV2,
    convertFilterContextFromBackend as convertFilterContextFromBackendV2,
} from "./v2/AnalyticalDashboardConverter.js";

export const convertAnalyticalDashboard = (
    analyticalDashboard: JsonApiAnalyticalDashboardOutWithLinks,
    included?: JsonApiAnalyticalDashboardOutIncludes[],
): IListedDashboard => {
    const { id, links, attributes, meta, relationships = {} } = analyticalDashboard;
    const { createdBy, modifiedBy } = relationships;
    const { createdAt, modifiedAt } = attributes;
    const isPrivate = meta?.accessInfo?.private ?? false;

    return {
        ref: idRef(id, "analyticalDashboard"),
        uri: links!.self,
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
        isUnderStrictControl: true,
        availability: "full",
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

function convertFilterContextFilters(
    content: AnalyticalDashboardModelV1.IFilterContext | AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    if (AnalyticalDashboardModelV1.isFilterContext(content)) {
        return convertFilterContextFiltersV1(content);
    }

    if (AnalyticalDashboardModelV2.isFilterContext(content)) {
        return convertFilterContextFiltersV2(content);
    }

    invariant(false, "Unknown filter context version");
}

export function getFilterContextFromIncluded(
    included: JsonApiAnalyticalDashboardOutDocument["included"],
): IFilterContext | undefined {
    const filterContext = included?.find(isFilterContextData) as JsonApiFilterContextOutWithLinks;
    if (!filterContext) {
        return;
    }

    const { id, type, attributes } = filterContext;
    const { title = "", description = "", content } = attributes!;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: filterContext.links!.self,
        title,
        description,
        filters: convertFilterContextFilters(
            content as AnalyticalDashboardModelV1.IFilterContext | AnalyticalDashboardModelV2.IFilterContext,
        ),
    };
}
