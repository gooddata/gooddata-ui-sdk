// (C) 2023-2026 GoodData Corporation

import * as yaml from "yaml";

import {
    type AfmLocalIdentifier,
    type AfmObjectIdentifier,
    type AfmObjectIdentifierIdentifierTypeEnum,
    type DashboardParameterizedDateFilter,
    type DeclarativeDataset,
    type DeclarativeTable,
    type IdentifierRef as StoredIdentifierRef,
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
    isParameterizedDateFilter,
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

/** The id of a reference, as the model holds it or as the declarative API sends it. */
export function storedReferenceId(ref: ObjRef | StoredIdentifierRef, errorContext?: IErrorContext): string {
    return isStoredIdentifierRef(ref) ? ref.identifier.id : getIdentifier(ref, true, errorContext);
}

// The declarative API nests the id with its type; the model's identifier reference names the id itself.
function isStoredIdentifierRef(ref: ObjRef | StoredIdentifierRef): ref is StoredIdentifierRef {
    return "identifier" in ref && typeof ref.identifier === "object";
}

// A key is an identifier of at most 255 characters, and a visualization adds "_<n>" to a repeated one. A period's
// key joins two ids, so one longer than 240 characters keeps its first 240 and ends with a hash of the whole,
// which leaves room for that suffix.
const LONG_KEY_START = 240;

// FNV-1a, 32 bits.
function hashOf(text: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
    }
    return (hash >>> 0).toString(36);
}

/**
 * A period date filter is keyed by its local identifier. One stored without it is named after its date
 * data set, or `fallback` for a dashboard's common date filter, and its parameter.
 */
function periodFilterKeyName(
    body: {
        localIdentifier?: string;
        dataSet?: ObjRef | StoredIdentifierRef;
        parameter: ObjRef | StoredIdentifierRef;
    },
    fallback: string,
    errorContext?: IErrorContext,
): string {
    if (body.localIdentifier) {
        return body.localIdentifier;
    }
    const dataSet = body.dataSet
        ? storedReferenceId(body.dataSet, updateErrorContext(errorContext, { path: ["dataSet"] }))
        : fallback;
    const parameter = storedReferenceId(
        body.parameter,
        updateErrorContext(errorContext, { path: ["parameter"] }),
    );
    const key = `${dataSet}_${parameter}`;
    return key.length <= LONG_KEY_START ? key : `${key.slice(0, LONG_KEY_START)}_${hashOf(key)}`;
}

export function createFilterContextItemKeyName(
    item: FilterContextItem | DashboardParameterizedDateFilter,
    type: string = "date",
    errorContext?: IErrorContext,
) {
    if ("dashboardParameterizedDateFilter" in item) {
        return periodFilterKeyName(
            item.dashboardParameterizedDateFilter,
            type,
            updateErrorContext(errorContext, { path: ["dashboardParameterizedDateFilter"] }),
        );
    }
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
    if (isParameterizedDateFilter(item)) {
        return periodFilterKeyName(
            item.parameterizedDateFilter,
            type,
            updateErrorContext(errorContext, { path: ["parameterizedDateFilter"] }),
        );
    }
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
        const type = declarativeTypeToReferencePrefix(idRef.type);
        return `${type}/${idRef.identifier}`;
    }
    if (isIdentifierRef(idRef) && untype) {
        return idRef.identifier;
    }
    throw newError(CoreErrorCode.ReferenceTypeNotSupported, [JSON.stringify(obj)], errorContext);
}

/**
 * Maps the yaml reference prefix (`metric/`, `computed_attribute/`, ...) to the object type the
 * declarative API uses for the same object.
 */
function referencePrefixToDeclarativeType(prefix: string, forceMetric?: boolean) {
    if (prefix === "metric" && !forceMetric) {
        return "measure";
    }
    if (prefix === "computed_attribute") {
        return "computedAttribute";
    }
    return prefix;
}

/**
 * Inverse of {@link referencePrefixToDeclarativeType}.
 */
function declarativeTypeToReferencePrefix(type: string | undefined) {
    if (type === "measure") {
        return "metric";
    }
    if (type === "computedAttribute") {
        return "computed_attribute";
    }
    return type;
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
            | "filterContext"
            | "parameter";
    } = {},
): T | null {
    const [type, objId] = data.split("/");

    if (type && objId) {
        return {
            identifier: {
                type:
                    forceType ||
                    (referencePrefixToDeclarativeType(
                        type,
                        forceMetric,
                    ) as AfmObjectIdentifierIdentifierTypeEnum),
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
