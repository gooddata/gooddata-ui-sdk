// (C) 2026 GoodData Corporation

import { type YAMLMap } from "yaml";

import { type DeclarativeFilterContext } from "@gooddata/api-client-tiger";
import type { DashboardFilters } from "@gooddata/sdk-code-schemas/v1";
import {
    type FilterContextItem,
    type IDashboardAttributeFilterConfig,
    type IFilterContextDefinition,
    dashboardFilterLocalIdentifier,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isNoopAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    declarativeFilterContextToYaml,
    declarativeFiltersConfigToYaml,
} from "../from/declarativeDashboardToYaml.js";
import { yamlFilterContextToDeclarative } from "../to/yamlDashboardToDeclarative.js";

import { CoreErrorCode, type IErrorContext, newError } from "./errors.js";
import { referencesAsStored, referencesAsWritten } from "./publisherFilterRefs.js";
import { createFilterContextItemKeyName } from "./yamlUtils.js";

/**
 * A document holds its filters the way a dashboard's filter context does, so the same convertor writes
 * them; only the envelope it expects is put around them here.
 *
 * @internal
 */
export function filtersToYaml(filters: FilterContextItem[] | undefined): YAMLMap | undefined {
    if (!filters?.length) {
        return undefined;
    }
    const { filters: written } = declarativeFilterContextToYaml(undefined, {
        content: { filters: referencesAsWritten(filters), version: "2" },
    } as DeclarativeFilterContext);
    return written.items.length === 0 ? undefined : written;
}

/**
 * A document holds its filters the way a dashboard's filter context does, so they are written and read
 * back by the same convertor; only the envelope it expects is put around them here.
 *
 * @internal
 */
export function filtersToDeclarative(filters: DashboardFilters | undefined): FilterContextItem[] | undefined {
    if (filters === undefined) {
        return undefined;
    }
    // The filter context the shared convertor builds around them is thrown away, so what it is
    // named does not matter; only the filters inside it are what a document stores.
    const { filterContext } = yamlFilterContextToDeclarative("report", filters);
    const content = filterContext.content as IFilterContextDefinition | undefined;
    return content?.filters?.length ? referencesAsStored(content.filters) : undefined;
}

/**
 * What holds a v2 filter list. Only a document keeps attribute filter settings (`mode`, `display_as`,
 * `selection_type`), in its `attributeFilterConfigs`.
 *
 * @internal
 */
export type PublisherFilterHolderV2 = "document" | "page" | "widget";

/** @internal */
export interface IPublisherFiltersV2 {
    filters: FilterContextItem[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

function setting(filter: object, key: string): unknown {
    return (filter as Record<string, unknown>)[key];
}

function changedSetting(filter: object, key: string): boolean {
    const value = setting(filter, key);
    return key === "mode" ? value !== undefined && value !== "active" : value !== undefined;
}

function lostSettings(filter: object, holder: PublisherFilterHolderV2): string[] {
    switch (setting(filter, "type")) {
        case "filter_group":
            return ["filter_group"];
        case "date_filter":
            return ["title", "mode"].filter((key) => changedSetting(filter, key));
        case "metric_value_filter":
            return ["mode"].filter((key) => changedSetting(filter, key));
        default:
            return holder === "document"
                ? []
                : ["mode", "display_as", "selection_type"].filter((key) => changedSetting(filter, key));
    }
}

/**
 * Reads a v2 filter list. A setting the v2 shape has nowhere to keep throws instead of being dropped.
 *
 * @internal
 */
export function filtersToDeclarativeV2(
    filters: DashboardFilters,
    holder: PublisherFilterHolderV2,
    errorContext?: IErrorContext,
): IPublisherFiltersV2 {
    const entries = Object.entries(filters);
    for (const [key, filter] of entries) {
        const [lost] = lostSettings(filter, holder);
        if (lost !== undefined) {
            throw newError(CoreErrorCode.FilterSettingNotStorable, [key, lost, holder], errorContext);
        }
    }
    const { filterContext, attributeFilterConfigs } = yamlFilterContextToDeclarative("document", filters);
    const read = (filterContext.content as IFilterContextDefinition | undefined)?.filters ?? [];
    const missing = entries.find(
        ([key]) => !read.some((filter) => dashboardFilterLocalIdentifier(filter) === key),
    );
    if (missing !== undefined) {
        throw newError(CoreErrorCode.ItemNotSupported, [missing[0]], errorContext);
    }
    const unwritable = read.find(
        (filter) => isDashboardCommonDateFilter(filter) && isNoopAllTimeDashboardDateFilter(filter),
    );
    if (unwritable !== undefined) {
        throw newError(
            CoreErrorCode.ItemNotSupported,
            [dashboardFilterLocalIdentifier(unwritable) ?? JSON.stringify(unwritable)],
            errorContext,
        );
    }
    return {
        filters: referencesAsStored(read),
        ...(attributeFilterConfigs?.length
            ? { attributeFilterConfigs: referencesAsStored(attributeFilterConfigs) }
            : {}),
    };
}

/**
 * Writes a v2 filter list. An empty list is written as an empty map, so it reads back as an empty list.
 *
 * @internal
 */
export function filtersToYamlV2(
    { filters, attributeFilterConfigs }: IPublisherFiltersV2,
    errorContext?: IErrorContext,
): DashboardFilters {
    const writtenFilters = referencesAsWritten(filters);
    const { filters: written, filtersMap } = declarativeFilterContextToYaml(
        undefined,
        { content: { filters: writtenFilters, version: "2" } } as DeclarativeFilterContext,
        errorContext,
    );
    const keys = writtenFilters.map((filter) => createFilterContextItemKeyName(filter, "date", errorContext));
    // Two kept filters sharing a key make the writer throw, so a shared key means one of them was skipped.
    const lostFilter = keys.find(
        (key, index) => !Object.hasOwn(filtersMap, key) || keys.indexOf(key) !== index,
    );
    if (lostFilter !== undefined) {
        throw newError(CoreErrorCode.ItemNotSupported, [lostFilter], errorContext);
    }
    const lostConfig = attributeFilterConfigs?.find(
        ({ localIdentifier }) => !Object.hasOwn(filtersMap, localIdentifier),
    );
    if (lostConfig !== undefined) {
        throw newError(CoreErrorCode.ItemNotSupported, [lostConfig.localIdentifier], errorContext);
    }
    declarativeFiltersConfigToYaml(
        filtersMap,
        undefined,
        undefined,
        referencesAsWritten(attributeFilterConfigs),
        undefined,
        errorContext,
    );
    return written.toJSON() as DashboardFilters;
}

/**
 * A document's own date filters each name the date dataset they apply to; the period plays the role
 * of a dashboard's common date filter.
 *
 * @internal
 */
export function assertDocumentDateFiltersNameDataSet(
    filters: FilterContextItem[],
    errorContext?: IErrorContext,
): void {
    const index = filters.findIndex((filter) => isDashboardDateFilter(filter) && !filter.dateFilter.dataSet);
    if (index !== -1) {
        throw newError(
            CoreErrorCode.DateFilterWithoutDataSet,
            [dashboardFilterLocalIdentifier(filters[index]) ?? `#${index}`],
            errorContext,
        );
    }
}
