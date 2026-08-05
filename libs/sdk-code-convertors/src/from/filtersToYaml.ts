// (C) 2023-2026 GoodData Corporation

import { Pair, YAMLMap, YAMLSeq } from "yaml";

import { type ITigerCompoundCondition } from "@gooddata/api-client-tiger";
import {
    type IAbsoluteDateFilter,
    type IArbitraryAttributeFilterBody,
    type IAttributeElements,
    type IFilter,
    type IMatchAttributeFilterBody,
    type IMeasureValueFilterBody,
    type INegativeAttributeFilterBody,
    type IPositiveAttributeFilterBody,
    type IRankingFilterBody,
    type IRelativeDateFilter,
    type IRelativeDateFilterAllTimeBody,
    type MeasureValueFilterCondition,
    filterAttributeElements,
    filterObjRef,
    getAttributeElementsItems,
    isAbsoluteDateFilter,
    isArbitraryAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isComparisonCondition,
    isDateFilter,
    isFilter,
    isLocalIdRef,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRangeCondition,
    isRankingFilter,
    isRelativeDateFilter,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type FromEntities } from "../types.js";
import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "../utils/errors.js";
import { matchConditionToYaml, parseDateValues } from "../utils/filterUtils.js";
import { parseGranularity } from "../utils/granularityUtils.js";
import { createFilterItemKeyName, getIdentifier } from "../utils/yamlUtils.js";

/** @internal */
export type YamlFilterMapEntry = {
    yaml: YAMLMap;
    filter: IFilter;
};

/** @internal */
export type YamlFilters = {
    filtersMap: Record<string, YamlFilterMapEntry>;
    filtersArray: YAMLMap;
};

function detectEmptyValuesFilterType(filter: IFilter): "only" | "exclude" | undefined {
    const attributeElements = filterAttributeElements(filter);
    const items = attributeElements ? getAttributeElementsItems(attributeElements) : [];

    if (items.length !== 1 || items[0] !== "") {
        return undefined;
    }

    return isPositiveAttributeFilter(filter) ? "only" : "exclude";
}

function getObjRefGroupingKey(objRef: unknown): string | undefined {
    if (!objRef || typeof objRef !== "object") {
        return undefined;
    }

    if ("identifier" in objRef) {
        const identifier = (objRef as { identifier?: unknown }).identifier;
        if (typeof identifier === "string") {
            return identifier;
        }
        if (identifier && typeof identifier === "object" && "id" in identifier) {
            const id = (identifier as { id?: unknown }).id;
            if (typeof id === "string") {
                return id;
            }
        }
    }

    if ("uri" in objRef) {
        const uri = (objRef as { uri?: unknown }).uri;
        if (typeof uri === "string") {
            return uri;
        }
    }

    if ("localIdentifier" in objRef) {
        const localIdentifier = (objRef as { localIdentifier?: unknown }).localIdentifier;
        if (typeof localIdentifier === "string") {
            return localIdentifier;
        }
    }

    return serializeObjRef(objRef as any);
}

/**
 * Groups date filters with their associated attribute filters. Leaves the rest alone.
 */
function groupFiltersByDateFilter(filters: IFilter[]): {
    grouped: {
        [datasetId: string]: { dateFilter: [IFilter, number]; attributeFilters: [IFilter, number][] };
    };
    rest: [IFilter, number][];
} {
    const dateFilters = [...filters].filter(isDateFilter);
    const nonDateFilters = [...filters].filter((f) => !isDateFilter(f));

    const result: ReturnType<typeof groupFiltersByDateFilter> = { grouped: {}, rest: [] };

    const getFilterRefDetails = (filter: IFilter) => {
        const objRef = filterObjRef(filter);
        if (!objRef) {
            return {
                objRef: undefined,
                filterRef: undefined,
            };
        }

        return {
            objRef,
            filterRef: getObjRefGroupingKey(objRef),
        };
    };

    dateFilters.forEach((dateFilter) => {
        const { filterRef: datasetId } = getFilterRefDetails(dateFilter);
        const fi = filters.indexOf(dateFilter);

        if (datasetId === undefined) {
            result.rest.push([dateFilter, fi]);
            return;
        }

        if (result.grouped[datasetId]) {
            result.rest.push([dateFilter, fi]);
        } else {
            result.grouped[datasetId] = { dateFilter: [dateFilter, fi], attributeFilters: [] };
        }
    });

    nonDateFilters.forEach((filter) => {
        const { filterRef: filterId } = getFilterRefDetails(filter);
        const fi = filters.indexOf(filter);

        if (filterId === undefined) {
            result.rest.push([filter, fi]);
            return;
        }

        const datasetId = filterId.split(".")[0];

        const group = result.grouped[datasetId];
        if (group) {
            group.attributeFilters.push([filter, fi]);
        } else {
            result.rest.push([filter, fi]);
        }
    });

    return result;
}

/** @internal Claims a document-unique key, given the name a filter's content suggests. */
export type ClaimFilterKey = (baseKey: string) => string;

/** @internal */
export type WrittenFilter = { key: string; yaml: YAMLMap; filter: IFilter };

/** `carried` are the filters a date filter wrote inside itself rather than beside it. */
type WrittenDateFilter = WrittenFilter & { carried?: WrittenFilter[] };

/** @internal */
export function declarativeFiltersToYaml(
    entities: FromEntities,
    filters: IFilter[],
    errorContext?: IErrorContext,
): YamlFilters {
    const filtersArray: Array<Pair> = [];
    const filtersMap: Record<string, YamlFilterMapEntry> = {};
    const usedKeys = new Set<string>();

    const claimKey: ClaimFilterKey = (baseKey) => {
        let key = baseKey;
        let suffix = 2;

        while (usedKeys.has(key)) {
            key = `${baseKey}_${suffix}`;
            suffix += 1;
        }

        usedKeys.add(key);

        return key;
    };

    // A carried filter is reachable by name for its config, but is not a filter of the query's own.
    const fold = ({ carried = [], ...written }: WrittenDateFilter) => {
        filtersArray.push(new Pair(written.key, written.yaml));
        [written, ...carried].forEach(({ key, yaml, filter }) => {
            filtersMap[key] = { yaml, filter };
        });
    };

    const filtersGroupedByDateFilter = groupFiltersByDateFilter(filters);

    filtersGroupedByDateFilter.rest.forEach(([filter, fi]) => {
        const result = declarativeFilterToYaml(
            entities,
            filter,
            claimKey,
            undefined,
            updateErrorContext(errorContext, {
                path: [fi.toString()],
            }),
        );
        if (!result) {
            return;
        }

        fold(result);
    });

    Object.values(filtersGroupedByDateFilter.grouped).forEach(({ dateFilter, attributeFilters }) => {
        const result = declarativeFilterToYaml(
            entities,
            dateFilter[0],
            claimKey,
            attributeFilters.map(([f]) => f),
            updateErrorContext(errorContext, {
                path: [dateFilter[1].toString()],
            }),
        );
        if (!result) {
            return;
        }

        fold(result);
    });

    return {
        filtersMap,
        filtersArray: filtersArray.reduce((map, filter) => {
            map.add(filter);
            return map;
        }, new YAMLMap()),
    };
}

function declarativeFilterToYaml(
    entities: FromEntities,
    filter: IFilter,
    claimKey: ClaimFilterKey,
    connectedAttributeFilters?: IFilter[],
    errorContext?: IErrorContext,
): WrittenDateFilter | null {
    if (!isFilter(filter)) {
        return null;
    }

    const key = claimKey(
        createFilterItemKeyName(
            filter,
            "date",
            updateErrorContext(errorContext, {
                path: ["date"],
            }),
        ),
    );

    if (isAbsoluteDateFilter(filter)) {
        const { yaml, carried } = declarativeAbsoluteDateFilterToYaml(filter.absoluteDateFilter, {
            entities,
            claimKey,
            connectedAttributeFilters,
            errorContext: updateErrorContext(errorContext, { path: ["absoluteDateFilter"] }),
        });
        return { key, yaml, filter, carried };
    }
    if (isRelativeDateFilter(filter)) {
        const { yaml, carried } = declarativeRelativeDateFilterToYaml(filter.relativeDateFilter, {
            entities,
            claimKey,
            connectedAttributeFilters,
            errorContext: updateErrorContext(errorContext, { path: ["relativeDateFilter"] }),
        });
        return { key, yaml, filter, carried };
    }
    if (isPositiveAttributeFilter(filter)) {
        return {
            key,
            yaml: declarativePositiveAttributeFilterToYaml(
                entities,
                filter.positiveAttributeFilter,
                updateErrorContext(errorContext, {
                    path: ["positiveAttributeFilter"],
                }),
            ),
            filter,
        };
    }
    if (isNegativeAttributeFilter(filter)) {
        return {
            key,
            yaml: declarativeNegativeAttributeFilterToYaml(
                entities,
                filter.negativeAttributeFilter,
                updateErrorContext(errorContext, {
                    path: ["negativeAttributeFilter"],
                }),
            ),
            filter,
        };
    }
    if (isArbitraryAttributeFilter(filter)) {
        return {
            key,
            yaml: declarativeArbitraryAttributeFilterToYaml(
                filter.arbitraryAttributeFilter,
                updateErrorContext(errorContext, {
                    path: ["arbitraryAttributeFilter"],
                }),
            ),
            filter,
        };
    }
    if (isMatchAttributeFilter(filter)) {
        return {
            key,
            yaml: declarativeMatchAttributeFilterToYaml(
                filter.matchAttributeFilter,
                updateErrorContext(errorContext, {
                    path: ["matchAttributeFilter"],
                }),
            ),
            filter,
        };
    }
    if (isMeasureValueFilter(filter)) {
        return {
            key,
            yaml: declarativeMeasureValueFilterToYaml(
                filter.measureValueFilter,
                updateErrorContext(errorContext, {
                    path: ["measureValueFilter"],
                }),
            ),
            filter,
        };
    }
    if (isRankingFilter(filter)) {
        return {
            key,
            yaml: declarativeRankingFilterToYaml(
                filter.rankingFilter,
                updateErrorContext(errorContext, {
                    path: ["rankingFilter"],
                }),
            ),
            filter,
        };
    }

    throw newError(CoreErrorCode.FilterItemTypeNotSupported, [JSON.stringify(filter)], errorContext);
}

/** Adds `empty_values` and `with` to `map`, returning the filters written under the latter. */
function processConnectedAttributeFilters(
    map: YAMLMap,
    connectedAttributeFilters: IFilter[],
    entities: FromEntities,
    claimKey: ClaimFilterKey,
    errorContext?: IErrorContext,
): WrittenFilter[] {
    // empty values filter

    const emptyValuesFilter = connectedAttributeFilters.find((filter) => detectEmptyValuesFilterType(filter));

    if (emptyValuesFilter) {
        map.add(new Pair("empty_values", detectEmptyValuesFilterType(emptyValuesFilter)));
    }

    // additional attribute filters

    const additionalAttributeFilters = connectedAttributeFilters.filter(
        (filter) => filter !== emptyValuesFilter,
    );

    if (additionalAttributeFilters.length === 0) {
        return [];
    }

    const withMap = new YAMLMap();
    map.add(new Pair("with", withMap));

    return additionalAttributeFilters.flatMap((filter) => {
        const written = declarativeFilterToYaml(entities, filter, claimKey, undefined, errorContext);
        if (!written) {
            return [];
        }

        withMap.add(new Pair(written.key, written.yaml));
        return [written, ...(written.carried ?? [])];
    });
}

/** @internal */
export type DateFilterEmitOptions = {
    entities: FromEntities;
    claimKey: ClaimFilterKey;
    connectedAttributeFilters?: IFilter[];
    errorContext?: IErrorContext;
};

/** @internal */
export function declarativeAbsoluteDateFilterToYaml(
    absoluteDateFilter: IAbsoluteDateFilter["absoluteDateFilter"],
    { entities, claimKey, connectedAttributeFilters = [], errorContext }: DateFilterEmitOptions,
): { yaml: YAMLMap; carried: WrittenFilter[] } {
    const map = new YAMLMap();

    // base date filter attributes

    map.add(new Pair("type", "date_filter"));

    map.add(new Pair("from", absoluteDateFilter.from));
    map.add(new Pair("to", absoluteDateFilter.to));

    const id = getIdentifier(
        absoluteDateFilter.dataSet,
        true,
        updateErrorContext(errorContext, {
            path: ["dateSet"],
        }),
    );
    map.add(new Pair("using", id));

    // connected attribute filters

    const carried = processConnectedAttributeFilters(
        map,
        connectedAttributeFilters,
        entities,
        claimKey,
        errorContext,
    );

    return { yaml: map, carried };
}

function isRelativeDateFilterAllTime(
    relativeDateFilter: IRelativeDateFilter["relativeDateFilter"],
): relativeDateFilter is IRelativeDateFilterAllTimeBody {
    const { granularity, from, to } = relativeDateFilter;

    // This should be enough to tell the type is IRelativeDateFilterAllTimeBody
    if (granularity === "ALL_TIME_GRANULARITY") {
        return true;
    }

    // But unfortunately AD emits granularity as GDC.time.year for an all time date filter, so we need this check as well
    return granularity === "GDC.time.year" && from === undefined && to === undefined;
}

/** @internal */
export function declarativeRelativeDateFilterToYaml(
    relativeDateFilter: IRelativeDateFilter["relativeDateFilter"],
    { entities, claimKey, connectedAttributeFilters = [], errorContext }: DateFilterEmitOptions,
): { yaml: YAMLMap; carried: WrittenFilter[] } {
    const map = new YAMLMap();

    map.add(new Pair("type", "date_filter"));

    if (isRelativeDateFilterAllTime(relativeDateFilter)) {
        // Do not add anything
    } else {
        // Add granularity
        if (relativeDateFilter.granularity) {
            map.add(new Pair("granularity", parseGranularity(relativeDateFilter.granularity)));
        }

        // Add from/to only if both are defined
        if (relativeDateFilter.from !== undefined && relativeDateFilter.to !== undefined) {
            map.add(new Pair("from", relativeDateFilter.from));
            map.add(new Pair("to", relativeDateFilter.to));
        }
    }

    const id = getIdentifier(
        relativeDateFilter.dataSet,
        true,
        updateErrorContext(errorContext, {
            path: ["dataSet"],
        }),
    );
    map.add(new Pair("using", id));

    const carried = processConnectedAttributeFilters(
        map,
        connectedAttributeFilters,
        entities,
        claimKey,
        errorContext,
    );

    return { yaml: map, carried };
}

/**
 * A selection given by uri has no form here: written without any `state` it reads back as listing none,
 * which an attribute filter takes to mean every element.
 */
function attributeElementValues(
    elements: IAttributeElements | undefined,
    field: "in" | "notIn",
    errorContext?: IErrorContext,
): string[] {
    if (!isAttributeElementsByValue(elements)) {
        throw newError(
            CoreErrorCode.ItemNotSupported,
            ["attribute elements not given by value"],
            updateErrorContext(errorContext, { path: [field] }),
        );
    }
    // An empty string is a valid attribute element value.
    return elements.values.filter((v): v is string => v !== null && v !== undefined);
}

/** @internal */
export function declarativePositiveAttributeFilterToYaml(
    entities: FromEntities,
    attributeFilter: IPositiveAttributeFilterBody,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "attribute_filter"));

    const id = getIdentifier(
        attributeFilter.displayForm,
        undefined,
        updateErrorContext(errorContext, {
            path: ["displayForm"],
        }),
    );
    map.add(new Pair("using", id));

    const values = attributeElementValues(attributeFilter.in, "in", errorContext);
    map.add(new Pair("state", new Pair("include", parseDateValues(entities, id, values))));

    return map;
}

/** @internal */
export function declarativeNegativeAttributeFilterToYaml(
    entities: FromEntities,
    attributeFilter: INegativeAttributeFilterBody,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "attribute_filter"));

    const id = getIdentifier(
        attributeFilter.displayForm,
        undefined,
        updateErrorContext(errorContext, {
            path: ["displayForm"],
        }),
    );
    map.add(new Pair("using", id));

    // An exclusion of nothing is what a filter with no `state` reads back as, so its form is immaterial.
    const excludesNothingByRef =
        isAttributeElementsByRef(attributeFilter.notIn) && attributeFilter.notIn.uris.length === 0;
    const values = excludesNothingByRef
        ? []
        : attributeElementValues(attributeFilter.notIn, "notIn", errorContext);
    if (values.length > 0) {
        map.add(new Pair("state", new Pair("exclude", parseDateValues(entities, id, values))));
    }

    return map;
}

function declarativeArbitraryAttributeFilterToYaml(
    attributeFilter: IArbitraryAttributeFilterBody,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "text_filter"));
    map.add(
        new Pair(
            "using",
            getIdentifier(
                attributeFilter.label,
                undefined,
                updateErrorContext(errorContext, {
                    path: ["label"],
                }),
            ),
        ),
    );
    map.add(new Pair("condition", attributeFilter.negativeSelection ? "isNot" : "is"));
    map.add(new Pair("values", attributeFilter.values));

    return map;
}

function declarativeMatchAttributeFilterToYaml(
    attributeFilter: IMatchAttributeFilterBody,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "text_filter"));
    map.add(
        new Pair(
            "using",
            getIdentifier(
                attributeFilter.label,
                undefined,
                updateErrorContext(errorContext, {
                    path: ["label"],
                }),
            ),
        ),
    );
    map.add(
        new Pair(
            "condition",
            matchConditionToYaml(attributeFilter.operator, attributeFilter.negativeSelection),
        ),
    );
    map.add(new Pair("value", attributeFilter.literal));
    if (attributeFilter.caseSensitive !== undefined) {
        map.add(new Pair("case_sensitive", attributeFilter.caseSensitive));
    }

    return map;
}

function asCompoundCondition(
    condition: MeasureValueFilterCondition,
): ITigerCompoundCondition["compound"] | null {
    const { compound } = condition as Partial<ITigerCompoundCondition>;
    return Array.isArray(compound?.conditions) ? compound : null;
}

function addConditionsToYaml(
    map: YAMLMap,
    conditions: MeasureValueFilterCondition[],
    options: { nullsCountAsZero: boolean; errorContext?: IErrorContext },
): void {
    const { nullsCountAsZero, errorContext } = options;
    const conditionsSeq = new YAMLSeq();
    let treatNullValuesAsZero = nullsCountAsZero;

    conditions.forEach((condition) => {
        const conditionMap = new YAMLMap();
        if (addConditionToYamlMap(conditionMap, condition, errorContext)) {
            treatNullValuesAsZero = true;
        }
        conditionsSeq.add(conditionMap);
    });

    map.add(new Pair("conditions", conditionsSeq));

    if (treatNullValuesAsZero) {
        map.add(new Pair("null_values_as_zero", true));
    }
}

/** Nulls are recorded only as counting for zero or not, so any other stand-in has no form here. */
function assertNullsCountAsZero(treatNullValuesAs: number | undefined, errorContext?: IErrorContext): void {
    if (treatNullValuesAs !== undefined && treatNullValuesAs !== 0) {
        throw newError(
            CoreErrorCode.ItemNotSupported,
            [`null values treated as ${treatNullValuesAs}`],
            updateErrorContext(errorContext, { path: ["treatNullValuesAs"] }),
        );
    }
}

function addSingleConditionToYaml(
    map: YAMLMap,
    condition: MeasureValueFilterCondition,
    errorContext?: IErrorContext,
): void {
    // A lone condition carries the flag itself, where a list lifts it out over all of them.
    const nullsCountAsZero = addConditionToYamlMap(map, condition, errorContext);
    map.add(new Pair("null_values_as_zero", nullsCountAsZero));
}

function addConditionToYamlMap(
    conditionMap: YAMLMap,
    condition: MeasureValueFilterCondition,
    errorContext?: IErrorContext,
): boolean {
    let hasTreatNullValues = false;

    if (isComparisonCondition(condition)) {
        const comp = condition.comparison;
        assertNullsCountAsZero(comp.treatNullValuesAs, errorContext);
        conditionMap.add(new Pair("condition", comp.operator.toUpperCase()));
        conditionMap.add(new Pair("value", comp.value));
        if (comp.treatNullValuesAs !== undefined) {
            hasTreatNullValues = true;
        }
    } else if (isRangeCondition(condition)) {
        const range = condition.range;
        assertNullsCountAsZero(range.treatNullValuesAs, errorContext);
        conditionMap.add(new Pair("condition", range.operator.toUpperCase()));
        conditionMap.add(new Pair("from", range.from));
        conditionMap.add(new Pair("to", range.to));
        if (range.treatNullValuesAs !== undefined) {
            hasTreatNullValues = true;
        }
    } else {
        throw newError(
            CoreErrorCode.ItemNotSupported,
            [`condition ${JSON.stringify(condition)}`],
            errorContext,
        );
    }

    return hasTreatNullValues;
}

/** @internal */
export function declarativeMeasureValueFilterToYaml(
    measureValueFilter: IMeasureValueFilterBody,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "metric_value_filter"));

    if (isLocalIdRef(measureValueFilter.measure)) {
        map.add(new Pair("using", measureValueFilter.measure.localIdentifier));
    } else {
        map.add(
            new Pair(
                "using",
                getIdentifier(
                    measureValueFilter.measure,
                    undefined,
                    updateErrorContext(errorContext, {
                        path: ["measure"],
                    }),
                ),
            ),
        );
    }

    const conditionContext = updateErrorContext(errorContext, { path: ["condition"] });
    const compound = measureValueFilter.condition ? asCompoundCondition(measureValueFilter.condition) : null;

    if (compound) {
        // Nesting lifts the shared null handling out of the conditions, so it is read from the compound.
        assertNullsCountAsZero(compound.treatNullValuesAs, conditionContext);
        // A written condition list may not be empty, and the absent key already means no filtering.
        if (compound.conditions.length > 0) {
            addConditionsToYaml(map, compound.conditions, {
                nullsCountAsZero: compound.treatNullValuesAs !== undefined,
                errorContext: conditionContext,
            });
        }
    } else if (measureValueFilter.conditions && measureValueFilter.conditions.length > 1) {
        addConditionsToYaml(map, measureValueFilter.conditions, {
            nullsCountAsZero: false,
            errorContext: conditionContext,
        });
    } else if (measureValueFilter.conditions?.length === 1) {
        addSingleConditionToYaml(map, measureValueFilter.conditions[0], conditionContext);
    } else if (measureValueFilter.condition) {
        addSingleConditionToYaml(map, measureValueFilter.condition, conditionContext);
    }

    // Handle dimensionality field
    if (measureValueFilter.dimensionality && Array.isArray(measureValueFilter.dimensionality)) {
        const dimensionalitySeq = new YAMLSeq();
        measureValueFilter.dimensionality.forEach((item) => {
            if (isLocalIdRef(item)) {
                dimensionalitySeq.add(item.localIdentifier);
            } else {
                dimensionalitySeq.add(getIdentifier(item));
            }
        });
        map.add(new Pair("dimensionality", dimensionalitySeq));
    }

    return map;
}

/** @internal */
export function declarativeRankingFilterToYaml(
    rankingFilter: IRankingFilterBody,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "ranking_filter"));

    if (isLocalIdRef(rankingFilter.measure)) {
        map.add(new Pair("using", rankingFilter.measure.localIdentifier));
    } else {
        map.add(
            new Pair(
                "using",
                getIdentifier(
                    rankingFilter.measure,
                    undefined,
                    updateErrorContext(errorContext, {
                        path: ["measure"],
                    }),
                ),
            ),
        );
    }

    if (rankingFilter.operator === "TOP") {
        map.add(new Pair("top", rankingFilter.value));
    }
    if (rankingFilter.operator === "BOTTOM") {
        map.add(new Pair("bottom", rankingFilter.value));
    }

    const rankedBy = (rankingFilter.attributes ?? []).filter(Boolean);
    if (rankedBy.length > 1) {
        throw newError(
            CoreErrorCode.ItemNotSupported,
            [`ranking over ${rankedBy.length} attributes`],
            updateErrorContext(errorContext, { path: ["attributes"] }),
        );
    }
    if (rankedBy[0]) {
        const first = rankedBy[0];
        if (isLocalIdRef(first)) {
            map.add(new Pair("attribute", first.localIdentifier));
        } else {
            map.add(new Pair("attribute", getIdentifier(first)));
        }
    }

    if (rankingFilter.strictLimitOfRows !== undefined) {
        map.add(new Pair("strict_limit_of_rows", rankingFilter.strictLimitOfRows));
    }

    return map;
}
