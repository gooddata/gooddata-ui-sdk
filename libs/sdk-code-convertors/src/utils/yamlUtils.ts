// (C) 2023-2026 GoodData Corporation

import * as yaml from "yaml";

import {
    type AfmLocalIdentifier,
    type AfmObjectIdentifier,
    type AfmObjectIdentifierIdentifierTypeEnum,
    type DeclarativeDataset,
    type DeclarativeTable,
    isAfmObjectIdentifier,
} from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    type IFilter,
    type ObjRef,
    type ObjRefInScope,
    isAbsoluteDateFilter,
    isArbitraryAttributeFilter,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isIdentifierRef,
    isLocalIdRef,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRankingFilter,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";

import { type Profile } from "../types.js";

import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "./errors.js";
import { parseGranularity } from "./granularityUtils.js";
import { TABLE_PATH_DELIMITER, getTableRootId } from "./sharedUtils.js";

// rely on structural typing..
type MetaFieldHolder = {
    id: string;
    title?: string;
    description?: string;
    tags?: string[];
};

export function fillOptionalMetaFields(
    doc: yaml.Document | yaml.YAMLMap,
    obj: MetaFieldHolder,
    withSpace = true,
) {
    const titleKey = new yaml.Scalar("title");
    if (withSpace) {
        titleKey.spaceBefore = true;
    }
    doc.add(new yaml.Pair(titleKey, obj.title ?? ""));

    // Description is shown when not empty or we force-render optional props
    if (obj.description) {
        doc.add(new yaml.Pair("description", obj.description ?? ""));
    }

    // Tags are shown when not empty or we force-render optional props
    if (Boolean(obj.tags) && obj.tags!.length > 0) {
        doc.add(new yaml.Pair("tags", obj.tags ?? []));
    }
}

export function entryWithSpace(key: string, value: any) {
    const keyScalar = new yaml.Scalar(key);
    keyScalar.spaceBefore = true;

    return new yaml.Pair(keyScalar, value);
}

export function findSourceColumnDataType(
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
    dataset: DeclarativeDataset | undefined,
    column?: string | null,
) {
    const { table, path } = findTable(tablesMap, profile, dataset);

    if (!path || !column || !table) {
        return null;
    }

    const foundColumn = table.columns.find((c) => c.name === column);
    return foundColumn ? foundColumn.dataType : null;
}

export function findTable(
    tablesMap: Record<string, DeclarativeTable[]>,
    profile: Profile | null,
    dataset: DeclarativeDataset | undefined,
): { table?: DeclarativeTable; path?: string } {
    if (dataset?.dataSourceTableId) {
        const { id, path } = dataset.dataSourceTableId;
        const tables =
            tablesMap[getTableRootId(profile, { data_source: dataset.dataSourceTableId.dataSourceId })] || [];

        //path exists in definition
        if (path) {
            const pathString = path.join(TABLE_PATH_DELIMITER);
            const table = tables.find((table) => table.path.join(TABLE_PATH_DELIMITER) === pathString);
            return {
                table,
                path: pathString,
            };
        }

        //path from table
        const table = tables.find((table) => table.id === id);
        if (table?.path) {
            return {
                table,
                path: table.path.join(TABLE_PATH_DELIMITER),
            };
        }
    }
    return {};
}

export function createFilterContextItemKeyName(
    item: FilterContextItem,
    type: string = "date",
    errorContext?: IErrorContext,
) {
    if (isDashboardDateFilter(item)) {
        // Use localIdentifier if present, otherwise generate from dataSet/granularity
        if (item.dateFilter.localIdentifier) {
            return item.dateFilter.localIdentifier;
        }
        const localIdentifier = item.dateFilter.dataSet
            ? getIdentifier(
                  item.dateFilter.dataSet,
                  true,
                  updateErrorContext(errorContext, { path: ["dateFilter", "dataSet"] }),
              )
            : type;
        return `${localIdentifier}_${parseGranularity(
            item.dateFilter.granularity ?? "unknown",
        )?.toLocaleLowerCase()}`;
    }
    if (isDashboardAttributeFilter(item)) {
        return (
            item.attributeFilter.localIdentifier ??
            `${getIdentifier(item.attributeFilter.displayForm, true, updateErrorContext(errorContext, { path: ["attributeFilter", "displayForm"] }))}_filter`
        );
    }
    if (isDashboardArbitraryAttributeFilter(item)) {
        return (
            item.arbitraryAttributeFilter.localIdentifier ??
            `${getIdentifier(item.arbitraryAttributeFilter.displayForm, true, updateErrorContext(errorContext, { path: ["arbitraryAttributeFilter", "displayForm"] }))}_text_filter`
        );
    }
    if (isDashboardMatchAttributeFilter(item)) {
        return (
            item.matchAttributeFilter.localIdentifier ??
            `${getIdentifier(item.matchAttributeFilter.displayForm, true, updateErrorContext(errorContext, { path: ["matchAttributeFilter", "displayForm"] }))}_text_filter`
        );
    }
    if (isDashboardMeasureValueFilter(item)) {
        // Dashboard MVF has a mandatory localIdentifier
        return item.dashboardMeasureValueFilter.localIdentifier;
    }
    throw newError(CoreErrorCode.ItemNotSupported, [JSON.stringify(item)], errorContext);
}

export function createFilterItemKeyName(item: IFilter, type: string = "date", errorContext?: IErrorContext) {
    if (isAbsoluteDateFilter(item)) {
        return item.absoluteDateFilter.dataSet
            ? getIdentifier(
                  item.absoluteDateFilter.dataSet,
                  true,
                  updateErrorContext(errorContext, { path: ["absoluteDateFilter", "dataSet"] }),
              )
            : type;
    }
    if (isRelativeDateFilter(item)) {
        const localIdentifier = item.relativeDateFilter.dataSet
            ? getIdentifier(
                  item.relativeDateFilter.dataSet,
                  true,
                  updateErrorContext(errorContext, { path: ["relativeDateFilter", "dataSet"] }),
              )
            : type;
        if (
            item.relativeDateFilter.granularity !== "ALL_TIME_GRANULARITY" &&
            item.relativeDateFilter.granularity
        ) {
            return `${localIdentifier}_${parseGranularity(
                item.relativeDateFilter.granularity,
            )?.toLocaleLowerCase()}`;
        } else {
            return localIdentifier;
        }
    }
    if (isPositiveAttributeFilter(item)) {
        return (
            item.positiveAttributeFilter.localIdentifier ??
            `${getIdentifier(item.positiveAttributeFilter.displayForm, true, updateErrorContext(errorContext, { path: ["positiveAttributeFilter", "displayForm"] }))}_filter`
        );
    }
    if (isNegativeAttributeFilter(item)) {
        return (
            item.negativeAttributeFilter.localIdentifier ??
            `${getIdentifier(item.negativeAttributeFilter.displayForm, true, updateErrorContext(errorContext, { path: ["negativeAttributeFilter", "displayForm"] }))}_filter`
        );
    }
    if (isArbitraryAttributeFilter(item)) {
        return (
            item.arbitraryAttributeFilter.localIdentifier ??
            `${getIdentifier(item.arbitraryAttributeFilter.label, true, updateErrorContext(errorContext, { path: ["arbitraryAttributeFilter", "label"] }))}_text_filter`
        );
    }
    if (isMatchAttributeFilter(item)) {
        return (
            item.matchAttributeFilter.localIdentifier ??
            `${getIdentifier(item.matchAttributeFilter.label, true, updateErrorContext(errorContext, { path: ["matchAttributeFilter", "label"] }))}_text_filter`
        );
    }
    if (isMeasureValueFilter(item)) {
        return `maf_${getIdentifier(item.measureValueFilter.measure, true, updateErrorContext(errorContext, { path: ["measureValueFilter", "measure"] }))}_filter`;
    }
    if (isRankingFilter(item)) {
        return `${getIdentifier(item.rankingFilter.measure, true, updateErrorContext(errorContext, { path: ["rankingFilter", "measure"] }))}_filter`;
    }

    throw newError(CoreErrorCode.ItemNotSupported, [JSON.stringify(item)], errorContext);
}

/** @public */
export function getIdentifier(
    obj: ObjRef | ObjRefInScope | AfmObjectIdentifier,
    untype?: boolean,
    errorContext?: IErrorContext,
): string {
    const idRef = isAfmObjectIdentifier(obj)
        ? { type: obj.identifier.type, identifier: obj.identifier.id }
        : obj;

    if (isLocalIdRef(idRef)) {
        return idRef.localIdentifier;
    }
    if (isIdentifierRef(idRef) && !untype) {
        const type = idRef.type === "measure" ? "metric" : idRef.type;
        return `${type}/${idRef.identifier}`;
    }
    if (isIdentifierRef(idRef) && untype) {
        return idRef.identifier;
    }
    throw newError(CoreErrorCode.ReferenceTypeNotSupported, [JSON.stringify(obj)], errorContext);
}

/** @public */
export function createIdentifier<T = AfmObjectIdentifier>(
    data: string,
    {
        forceMetric,
        forceType,
    }: {
        forceMetric?: boolean;
        forceType?:
            | "user"
            | "userGroup"
            | "dataset"
            | "date"
            | "attribute"
            | "label"
            | "measure"
            | "workspaceDataFilter"
            | "visualizationObject"
            | "analyticalDashboard"
            | "dashboardPlugin"
            | "filterContext";
    } = {},
): T | null {
    const [type, objId] = data.split("/");

    if (type && objId) {
        return {
            identifier: {
                type:
                    forceType ||
                    ((type === "metric" && !forceMetric
                        ? "measure"
                        : type) as AfmObjectIdentifierIdentifierTypeEnum),
                id: objId,
            },
        } as T;
    }

    if (forceType) {
        return {
            identifier: {
                type: forceType,
                id: data,
            },
        } as T;
    }

    return null;
}

export function createLocalIdentifier(data: string): AfmLocalIdentifier {
    return {
        localIdentifier: data,
    };
}

export function cleanUpItems<T>(items: Array<T | null>): Array<T | null> {
    const arr = [...items];
    let last = arr[arr.length - 1];

    while (last === null) {
        arr.pop();
        last = arr[arr.length - 1];
    }

    return arr;
}
