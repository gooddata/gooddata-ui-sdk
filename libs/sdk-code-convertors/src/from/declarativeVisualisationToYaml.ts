// (C) 2023-2026 GoodData Corporation

import { Document, Pair, type Scalar, YAMLMap, YAMLSeq, type Node as YamlNode } from "yaml";

import { type DeclarativeVisualizationObject } from "@gooddata/api-client-tiger";
import {
    type IAbsoluteDateFilter,
    type IArithmeticMeasureDefinition,
    type IAttributeBody,
    type IAttributeSortItem,
    type IBucket,
    type IFilter,
    type IInlineMeasureDefinition,
    type IInsightDefinition,
    type IInsightLayerDefinition,
    type IMeasureBody,
    type IMeasureDefinition,
    type IMeasureSortItem,
    type IMeasureValueFilterBody,
    type INegativeAttributeFilterBody,
    type IPoPMeasureDefinition,
    type IPositiveAttributeFilterBody,
    type IPreviousPeriodMeasureDefinition,
    type IRankingFilterBody,
    type IRelativeDateFilter,
    type IRelativeDateFilterAllTimeBody,
    type ISortItem,
    type ITotal,
    type MeasureValueFilterCondition,
    type VisualizationProperties,
    filterAttributeElements,
    filterObjRef,
    getAttributeElementsItems,
    isAbsoluteDateFilter,
    isArithmeticMeasureDefinition,
    isAttribute,
    isAttributeElementsByValue,
    isAttributeLocator,
    isAttributeSort,
    isBucket,
    isComparisonCondition,
    isDateFilter,
    isFilter,
    isInlineMeasureDefinition,
    isInsight,
    isLocalIdRef,
    isMeasure,
    isMeasureDefinition,
    isMeasureLocator,
    isMeasureSort,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPoPMeasureDefinition,
    isPositiveAttributeFilter,
    isPreviousPeriodMeasureDefinition,
    isRangeCondition,
    isRankingFilter,
    isRelativeDateFilter,
    isTotalLocator,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { areaChart } from "../configs/areaChart.js";
import { barChart } from "../configs/barChart.js";
import { bubbleChart } from "../configs/bubbleChart.js";
import { bulletChart } from "../configs/bulletChart.js";
import { columnChart } from "../configs/columnChart.js";
import { comboChart } from "../configs/comboChart.js";
import { dependencyWheelChart } from "../configs/dependencyWheelChart.js";
import { donutChart } from "../configs/donutChart.js";
import { funnelChart } from "../configs/funnelChart.js";
import { geoAreaChart } from "../configs/geoAreaChart.js";
import { geoChart } from "../configs/geoChart.js";
import { headlineChart } from "../configs/headlineChart.js";
import { heatmapChart } from "../configs/heatmapChart.js";
import { lineChart } from "../configs/lineChart.js";
import { pieChart } from "../configs/pieChart.js";
import { pyramidChart } from "../configs/pyramidChart.js";
import { type InlineVisualizations, repeaterChart } from "../configs/repeaterChart.js";
import { sankeyChart } from "../configs/sankeyChart.js";
import { scatterChart } from "../configs/scatterChart.js";
import { table } from "../configs/table.js";
import { treemapChart } from "../configs/treemapChart.js";
import { waterfallChart } from "../configs/waterfallChart.js";
import type { Visualisation } from "../schemas/v1/metadata.js";
import { BucketsType, type FromEntities } from "../types.js";
import { CoreErrorCode, newError } from "../utils/errors.js";
import { parseDateValues } from "../utils/filterUtils.js";
import { parseGranularity } from "../utils/granularityUtils.js";
import { remapLocationAttribute } from "../utils/locationUtils.js";
import { VISUALISATION_COMMENT } from "../utils/texts.js";
import {
    cleanUpItems,
    createFilterItemKeyName,
    entryWithSpace,
    fillOptionalMetaFields,
    getIdentifier,
} from "../utils/yamlUtils.js";

/** @public */
export function declarativeVisualisationToYaml(
    entities: FromEntities,
    visualisation: DeclarativeVisualizationObject,
): {
    content: string;
    json?: Visualisation;
} {
    // Build visualisation object
    const insight = { insight: visualisation.content };
    if (!isInsight(insight)) {
        throw newError(CoreErrorCode.VisualizationNotSupported, [JSON.stringify(insight)]);
    }

    // Load type
    const type = declarativeVisTypeToYaml(insight.insight);

    if (!type) {
        return {
            content: "",
        };
    }

    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type,
        id: visualisation.id,
    });

    // Add intro comment to the document
    doc.commentBefore = VISUALISATION_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, visualisation);

    // Add visibility flag only when hidden
    if (visualisation.isHidden === true) {
        doc.add(doc.createPair("show_in_ai_results", false));
    }

    const report = declarativeReportToYaml(entities, insight.insight);
    doc.add(entryWithSpace("query", report.report));

    declarativeVisToYaml(doc, insight.insight, report, entities);

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as Visualisation,
    };
}

type Report = {
    report: YAMLMap;
    derivedBuckets: BucketGroup[];
};

function declarativeReportToYaml(entities: FromEntities, def: IInsightDefinition["insight"]): Report {
    const report = new YAMLMap();

    const {
        fieldsMap,
        postProcessors,
        groups: derivedBuckets,
    } = declarativeBucketsToYaml(entities, def.buckets);
    appendLayerFieldsToReport(fieldsMap, postProcessors, entities, def.layers);
    if (fieldsMap.items.length > 0) {
        report.add(new Pair("fields", fieldsMap));
    }
    const { filtersArray, filtersMap } = declarativeFiltersToYaml(entities, def.filters ?? []);
    declarativeFiltersConfigToYaml(def, filtersMap);
    if (filtersArray.items.length > 0) {
        report.add(entryWithSpace("filter_by", filtersArray));
    }

    const { sortsArray } = declarativeSortsToYaml(def.sorts ?? []);
    if (sortsArray.length > 0) {
        report.add(entryWithSpace("sort_by", sortsArray));
    }

    postProcessors.filters?.forEach(({ filters, item }) => {
        const { filtersArray, filtersMap } = declarativeFiltersToYaml(entities, filters);
        declarativeFiltersConfigToYaml(def, filtersMap);
        if (filtersArray.items.length > 0) {
            item.add(new Pair("filter_by", filtersArray));
        }
    });

    return {
        report,
        derivedBuckets,
    };
}

function appendLayerFieldsToReport(
    fieldsMap: YAMLMap,
    postProcessors: PostProcessors,
    entities: FromEntities,
    layers?: IInsightLayerDefinition[],
) {
    if (!layers || layers.length === 0) {
        return;
    }

    const knownKeys = new Set(
        fieldsMap.items
            .map((pair) => getPairKeyValue(pair))
            .filter((key): key is string => typeof key === "string" && key.length > 0),
    );

    layers.forEach((layer) => {
        const { fieldsMap: layerFieldsMap, postProcessors: layerPostProcessors } = declarativeBucketsToYaml(
            entities,
            layer.buckets ?? [],
        );
        const valueMapping = new Map<YAMLMap, YAMLMap>();

        layerFieldsMap.items.forEach((pair) => {
            const keyValue = getPairKeyValue(pair);
            if (!keyValue) {
                return;
            }

            let targetValue: YamlNode | undefined;
            if (knownKeys.has(keyValue)) {
                targetValue = fieldsMap.get(keyValue, true) as YamlNode | undefined;
            } else {
                knownKeys.add(keyValue);
                const clonedPair = pair.clone(fieldsMap.schema);
                fieldsMap.add(clonedPair);
                targetValue = clonedPair.value as YamlNode | undefined;
            }

            if (pair.value instanceof YAMLMap && targetValue instanceof YAMLMap) {
                valueMapping.set(pair.value, targetValue);
            }
        });

        layerPostProcessors.filters.forEach((filterEntry) => {
            const mappedItem = valueMapping.get(filterEntry.item);
            if (mappedItem) {
                postProcessors.filters.push({
                    item: mappedItem,
                    filters: filterEntry.filters,
                });
            }
        });
    });
}

function getPairKeyValue(pair: Pair): string | undefined {
    if (!pair) {
        return undefined;
    }
    if (typeof pair.key === "string") {
        return pair.key;
    }
    const key = pair.key as Scalar;
    if (key && typeof key.value === "string") {
        return key.value as string;
    }
    return undefined;
}

export function declarativeFiltersConfigToYaml(insight: IInsightDefinition["insight"], filtersMap: YAMLMap) {
    Object.keys(insight.attributeFilterConfigs ?? {}).forEach((key) => {
        const filter = filtersMap[key];
        if (filter) {
            let localIdentifier: string | undefined = undefined;
            if (isPositiveAttributeFilter(filter.filter) || isNegativeAttributeFilter(filter.filter)) {
                localIdentifier = isPositiveAttributeFilter(filter.filter)
                    ? filter.filter.positiveAttributeFilter.localIdentifier
                    : filter.filter.negativeAttributeFilter.localIdentifier;
            }
            if (localIdentifier) {
                if (insight.attributeFilterConfigs![localIdentifier].displayAsLabel) {
                    filter.yaml.add(
                        new Pair(
                            "display_as",
                            getIdentifier(insight.attributeFilterConfigs![localIdentifier].displayAsLabel),
                        ),
                    );
                }
            }
        }
    });
}

export function declarativeVisTypeToYaml(def: IInsightDefinition["insight"]): string | null {
    switch (def.visualizationUrl) {
        case "local:table":
            return "table";
        case "local:bar":
            return "bar_chart";
        case "local:column":
            return "column_chart";
        case "local:line":
            return "line_chart";
        case "local:area":
            return "area_chart";
        case "local:scatter":
            return "scatter_chart";
        case "local:bubble":
            return "bubble_chart";
        case "local:pie":
            return "pie_chart";
        case "local:donut":
            return "donut_chart";
        case "local:treemap":
            return "treemap_chart";
        case "local:pyramid":
            return "pyramid_chart";
        case "local:funnel":
            return "funnel_chart";
        case "local:heatmap":
            return "heatmap_chart";
        case "local:bullet":
            return "bullet_chart";
        case "local:waterfall":
            return "waterfall_chart";
        case "local:dependencywheel":
            return "dependency_wheel_chart";
        case "local:sankey":
            return "sankey_chart";
        case "local:headline":
            return "headline_chart";
        case "local:combo2":
            return "combo_chart";
        case "local:pushpin":
            return "geo_chart";
        case "local:choropleth":
            return "geo_area_chart";
        case "local:repeater":
            return "repeater_chart";
        default:
            return null;
    }
}

function declarativeVisToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    entities: FromEntities,
) {
    switch (def.visualizationUrl) {
        case "local:table":
            declarativeVisTableToYaml(doc, def, report);
            break;
        case "local:bar":
            declarativeVisBarToYaml(doc, def, report);
            break;
        case "local:column":
            declarativeVisColumnToYaml(doc, def, report);
            break;
        case "local:line":
            declarativeVisLineToYaml(doc, def, report);
            break;
        case "local:area":
            declarativeVisAreaToYaml(doc, def, report);
            break;
        case "local:scatter":
            declarativeVisScatterToYaml(doc, def, report);
            break;
        case "local:bubble":
            declarativeVisBubbleToYaml(doc, def, report);
            break;
        case "local:pie":
            declarativeVisPieToYaml(doc, def, report);
            break;
        case "local:donut":
            declarativeVisDonutToYaml(doc, def, report);
            break;
        case "local:treemap":
            declarativeVisTreemapToYaml(doc, def, report);
            break;
        case "local:pyramid":
            declarativeVisPyramidToYaml(doc, def, report);
            break;
        case "local:funnel":
            declarativeVisFunnelToYaml(doc, def, report);
            break;
        case "local:heatmap":
            declarativeVisHeatmapToYaml(doc, def, report);
            break;
        case "local:bullet":
            declarativeVisBulletToYaml(doc, def, report);
            break;
        case "local:waterfall":
            declarativeVisWaterfallToYaml(doc, def, report);
            break;
        case "local:dependencywheel":
            declarativeVisDependencyWheelToYaml(doc, def, report);
            break;
        case "local:sankey":
            declarativeVisSankeyToYaml(doc, def, report);
            break;
        case "local:headline":
            declarativeVisHeadlineToYaml(doc, def, report);
            break;
        case "local:combo2":
            declarativeVisComboToYaml(doc, def, report);
            break;
        case "local:pushpin":
            declarativeVisGeoToYaml(doc, def, report, entities);
            break;
        case "local:choropleth":
            declarativeVisGeoAreaToYaml(doc, def, report, entities);
            break;
        case "local:repeater":
            declarativeVisRepeaterToYaml(doc, def, report);
            break;
        default:
            break;
    }
}

//buckets

type PostProcessors = {
    filters: Array<{ item: YAMLMap; filters: IFilter[] }>;
};

type Buckets = {
    fieldsMap: YAMLMap;
    groups: BucketGroup[];
    postProcessors: PostProcessors;
};

type BucketGroupItems = Array<{
    field: string;
    format?: string;
    totals?: YAMLMap[];
    axis?: "primary" | "secondary";
    display_as?: "metric" | "line" | "column";
} | null>;

type BucketGroup = {
    type: BucketsType;
    items: BucketGroupItems;
};

type FieldData = {
    format?: string;
    axis?: "primary" | "secondary";
};

export function declarativeBucketsToYaml(entities: FromEntities, buckets: IBucket[]): Buckets {
    const fullFieldsMap = new YAMLMap();
    const groups: BucketGroup[] = [];
    const postProcessors: PostProcessors = {
        filters: [],
    };

    const addField = (local: string, def: YAMLMap, group: BucketGroup, { format, axis }: FieldData = {}) => {
        fullFieldsMap.add(new Pair(local, def));
        group.items.push(createBucketGroupItem(local, format, axis));
    };

    //create buckets
    buckets.forEach((bucket) => {
        if (isBucket(bucket)) {
            const group: BucketGroup = { items: [], type: bucket.localIdentifier as BucketsType };
            const attributesMap: Record<string, YAMLMap> = {};
            const isLocation = bucket.localIdentifier === BucketsType.Location;

            //items
            bucket.items.forEach((item) => {
                if (isAttribute(item) && isLocation) {
                    const remapped = remapLocationAttribute(entities, item);
                    const def = declarativeAttributeToYaml(remapped.attribute);
                    addField(item.attribute.localIdentifier, def, group);
                    attributesMap[item.attribute.localIdentifier] = def;
                    return;
                }
                if (isAttribute(item)) {
                    const def = declarativeAttributeToYaml(item.attribute);
                    addField(item.attribute.localIdentifier, def, group);
                    attributesMap[item.attribute.localIdentifier] = def;
                    return;
                }
                if (isMeasure(item) && isInlineMeasureDefinition(item.measure.definition)) {
                    const def = declarativeInlineMetricToYaml(item.measure, item.measure.definition);
                    addField(item.measure.localIdentifier, def, group, { format: item.measure.format });
                    attributesMap[item.measure.localIdentifier] = def;
                    return;
                }
                if (isMeasure(item) && isMeasureDefinition(item.measure.definition)) {
                    const def = declarativeNormalMetricToYaml(
                        item.measure,
                        item.measure.definition,
                        postProcessors,
                    );
                    addField(item.measure.localIdentifier, def, group, { format: item.measure.format });
                    attributesMap[item.measure.localIdentifier] = def;
                    return;
                }
                if (isMeasure(item) && isArithmeticMeasureDefinition(item.measure.definition)) {
                    const def = declarativeArithmeticMetricToYaml(item.measure, item.measure.definition);
                    addField(item.measure.localIdentifier, def, group, { format: item.measure.format });
                    attributesMap[item.measure.localIdentifier] = def;
                    return;
                }
                if (isMeasure(item) && isPoPMeasureDefinition(item.measure.definition)) {
                    const def = declarativePoPMetricToYaml(item.measure, item.measure.definition);
                    addField(item.measure.localIdentifier, def, group, { format: item.measure.format });
                    attributesMap[item.measure.localIdentifier] = def;
                    return;
                }
                if (isMeasure(item) && isPreviousPeriodMeasureDefinition(item.measure.definition)) {
                    const def = declarativePreviousPeriodMetricToYaml(item.measure, item.measure.definition);
                    addField(item.measure.localIdentifier, def, group, { format: item.measure.format });
                    attributesMap[item.measure.localIdentifier] = def;
                    return;
                }
                throw newError(CoreErrorCode.BucketItemTypeNotSupported, [JSON.stringify(item)]);
            });

            //totals
            bucket.totals?.forEach((total) => {
                const { totalMap, attribute } = declarativeTotalToYaml(total);
                const item = group.items.find((item) => item?.field === attribute);
                if (item) {
                    item.totals = [...(item.totals ?? []), totalMap];
                }
            });

            groups.push(group);
        }
    });

    //try shortened fields
    const fieldsMap = new YAMLMap();
    fullFieldsMap.items.forEach((item) => {
        const shortened = getShortenedBucket(item.value as YAMLMap);
        const hasFilters = postProcessors.filters.find((fi) => fi.item === item.value);

        //NOTE: If shortened form is available and item has no filters to post process
        // use shortened version of the item
        if (shortened && !hasFilters) {
            fieldsMap.add(new Pair(item.key, shortened));
        } else {
            fieldsMap.add(item);
        }
    });

    return {
        fieldsMap,
        groups,
        postProcessors,
    };
}

export function declarativeAttributeToYaml(def: IAttributeBody): YAMLMap {
    const map = new YAMLMap();

    if (def.alias) {
        map.add(new Pair("title", def.alias));
    }
    const id = getIdentifier(def.displayForm);
    map.add(new Pair("using", id));

    if (def.showAllValues) {
        map.add(new Pair("show_all_values", true));
    }

    return map;
}

export function declarativeInlineMetricToYaml(
    def: IMeasureBody,
    inlineDef: IInlineMeasureDefinition,
): YAMLMap {
    const map = new YAMLMap();

    fillDefaultMetricProperties(map, def);

    const id = inlineDef.inlineDefinition;
    map.add(new Pair("maql", id.maql));

    return map;
}

export function declarativeNormalMetricToYaml(
    def: IMeasureBody,
    metricDefinition: IMeasureDefinition,
    postProcessors: PostProcessors,
): YAMLMap {
    const map = new YAMLMap();

    fillDefaultMetricProperties(map, def);

    const md = metricDefinition.measureDefinition;
    if (md.aggregation) {
        map.add(new Pair("aggregation", md.aggregation.toUpperCase()));
    }
    if (md.computeRatio) {
        map.add(new Pair("compute_ratio", md.computeRatio));
    }
    if (md.filters && md.filters.length > 0) {
        postProcessors.filters.push({ item: map, filters: md.filters });
    }

    const id = getIdentifier(md.item);
    map.add(new Pair("using", id));

    return map;
}

export function declarativeArithmeticMetricToYaml(
    def: IMeasureBody,
    arithmeticDefinition: IArithmeticMeasureDefinition,
): YAMLMap {
    const map = new YAMLMap();

    fillDefaultMetricProperties(map, def);

    const ad = arithmeticDefinition.arithmeticMeasure;
    map.add(new Pair("operator", ad.operator.toUpperCase()));
    map.add(new Pair("using", ad.measureIdentifiers));

    return map;
}

export function declarativePoPMetricToYaml(def: IMeasureBody, popDefinition: IPoPMeasureDefinition): YAMLMap {
    const map = new YAMLMap();

    fillDefaultMetricProperties(map, def);

    const pop = popDefinition.popMeasureDefinition;
    const id = getIdentifier(pop.popAttribute, true);
    const [date] = id.split(".");

    map.add(new Pair("type", "PREVIOUS_YEAR"));
    map.add(new Pair("date_filter", date));
    map.add(new Pair("using", pop.measureIdentifier));

    return map;
}

export function declarativePreviousPeriodMetricToYaml(
    def: IMeasureBody,
    previousDefinition: IPreviousPeriodMeasureDefinition,
): YAMLMap {
    const map = new YAMLMap();

    fillDefaultMetricProperties(map, def);

    const previous = previousDefinition.previousPeriodMeasure;

    if (previous.dateDataSets.length > 1) {
        throw newError(CoreErrorCode.MultipleDateDataSets, [JSON.stringify(previous)]);
    }

    const prev = previous.dateDataSets[0];
    const id = getIdentifier(prev.dataSet, true);
    const [date] = id.split(".");

    map.add(new Pair("type", "PREVIOUS_PERIOD"));
    if (prev.periodsAgo > 1) {
        map.add(new Pair("period", prev.periodsAgo));
    }
    map.add(new Pair("date_filter", date));
    map.add(new Pair("using", previous.measureIdentifier));

    return map;
}

function fillDefaultMetricProperties(map: YAMLMap, def: IMeasureBody) {
    if (def.alias) {
        map.add(new Pair("title", def.alias));
    }
    //NOTE: Title is skipped because is generated by client automatically, do not use it in code
}

function createBucketGroupItem(
    field: string,
    format?: string,
    axis?: "primary" | "secondary",
): BucketGroupItems[number] {
    return {
        field,
        ...(format ? { format } : {}),
        ...(axis ? { axis } : {}),
    };
}

function getShortenedBucket(def: YAMLMap): string | false {
    if (def.items.length === 1) {
        const item = def.items[0];
        if (["using"].includes(item.key as string)) {
            return item.value as string;
        }
    }
    return false;
}

//filters

type Filters = {
    filtersMap: YAMLMap;
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
 * @param filters
 */
function groupFiltersByDateFilter(filters: IFilter[]): {
    grouped: { [datasetId: string]: { dateFilter: IFilter; attributeFilters: IFilter[] } };
    rest: IFilter[];
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

        if (datasetId === undefined) {
            result.rest.push(dateFilter);
            return;
        }

        if (result.grouped[datasetId]) {
            result.rest.push(dateFilter);
        } else {
            result.grouped[datasetId] = { dateFilter, attributeFilters: [] };
        }
    });

    nonDateFilters.forEach((filter) => {
        const { filterRef: filterId } = getFilterRefDetails(filter);

        if (filterId === undefined) {
            result.rest.push(filter);
            return;
        }

        const datasetId = filterId.split(".")[0];

        const group = result.grouped[datasetId];
        if (group) {
            group.attributeFilters.push(filter);
        } else {
            result.rest.push(filter);
        }
    });

    return result;
}

export function declarativeFiltersToYaml(entities: FromEntities, filters: IFilter[]): Filters {
    const filtersArray: Array<Pair> = [];
    const filtersMap = new YAMLMap();
    const usedKeys = new Set<string>();

    const getUniqueKey = (baseKey: string) => {
        let key = baseKey;
        let suffix = 2;

        while (usedKeys.has(key)) {
            key = `${baseKey}_${suffix}`;
            suffix += 1;
        }

        usedKeys.add(key);

        return key;
    };

    const filtersGroupedByDateFilter = groupFiltersByDateFilter(filters);

    filtersGroupedByDateFilter.rest.forEach((filter) => {
        const result = declarativeFilterToYaml(entities, filter, getUniqueKey);
        if (!result) {
            return;
        }

        const { key, yaml, filter: originalFilter } = result;
        filtersArray.push(new Pair(key, yaml));
        filtersMap[key] = {
            yaml,
            filter: originalFilter,
        };
    });

    Object.values(filtersGroupedByDateFilter.grouped).forEach(({ dateFilter, attributeFilters }) => {
        const result = declarativeFilterToYaml(entities, dateFilter, getUniqueKey, attributeFilters);
        if (!result) {
            return;
        }

        const { key, yaml, filter: originalFilter } = result;
        filtersArray.push(new Pair(key, yaml));
        filtersMap[key] = {
            yaml,
            filter: originalFilter,
        };
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
    getUniqueKey: (baseKey: string) => string,
    connectedAttributeFilters?: IFilter[],
): { key: string; yaml: YAMLMap; filter: IFilter } | null {
    if (!isFilter(filter)) {
        return null;
    }

    const key = getUniqueKey(createFilterItemKeyName(filter));

    if (isAbsoluteDateFilter(filter)) {
        return {
            key,
            yaml: declarativeAbsoluteDateFilterToYaml(
                filter.absoluteDateFilter,
                connectedAttributeFilters,
                entities,
                getUniqueKey,
            ),
            filter,
        };
    }
    if (isRelativeDateFilter(filter)) {
        return {
            key,
            yaml: declarativeRelativeDateFilterToYaml(
                filter.relativeDateFilter,
                connectedAttributeFilters,
                entities,
                getUniqueKey,
            ),
            filter,
        };
    }
    if (isPositiveAttributeFilter(filter)) {
        return {
            key,
            yaml: declarativePositiveAttributeFilterToYaml(entities, filter.positiveAttributeFilter),
            filter,
        };
    }
    if (isNegativeAttributeFilter(filter)) {
        return {
            key,
            yaml: declarativeNegativeAttributeFilterToYaml(entities, filter.negativeAttributeFilter),
            filter,
        };
    }
    if (isMeasureValueFilter(filter)) {
        return {
            key,
            yaml: declarativeMeasureValueFilterToYaml(filter.measureValueFilter),
            filter,
        };
    }
    if (isRankingFilter(filter)) {
        return {
            key,
            yaml: declarativeRankingFilterToYaml(filter.rankingFilter),
            filter,
        };
    }

    throw newError(CoreErrorCode.FilterItemTypeNotSupported, [JSON.stringify(filter)]);
}

/**
 * Modifies `map`, adding `empty_filters` and `with` keys, populated from connectedAttributeFilters.
 */
function processConnectedAttributeFilters(
    map: YAMLMap,
    connectedAttributeFilters: IFilter[],
    entities: FromEntities,
    getUniqueKey: (baseKey: string) => string,
) {
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
        return;
    }

    const withMap = new YAMLMap();
    map.add(new Pair("with", withMap));

    additionalAttributeFilters?.forEach((filter) => {
        const converted = declarativeFilterToYaml(entities, filter, getUniqueKey);
        if (!converted) {
            return;
        }

        withMap.add(new Pair(converted.key, converted.yaml));
    });
}

export function declarativeAbsoluteDateFilterToYaml(
    absoluteDateFilter: IAbsoluteDateFilter["absoluteDateFilter"],
    connectedAttributeFilters: IFilter[] = [],
    entities: FromEntities,
    getUniqueKey: (baseKey: string) => string,
): YAMLMap {
    const map = new YAMLMap();

    // base date filter attributes

    map.add(new Pair("type", "date_filter"));

    map.add(new Pair("from", absoluteDateFilter.from));
    map.add(new Pair("to", absoluteDateFilter.to));

    const id = getIdentifier(absoluteDateFilter.dataSet, true);
    map.add(new Pair("using", id));

    // connected attribute filters

    processConnectedAttributeFilters(map, connectedAttributeFilters, entities, getUniqueKey);

    return map;
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

export function declarativeRelativeDateFilterToYaml(
    relativeDateFilter: IRelativeDateFilter["relativeDateFilter"],
    connectedAttributeFilters: IFilter[] = [],
    entities: FromEntities,
    getUniqueKey: (baseKey: string) => string,
): YAMLMap {
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

    const id = getIdentifier(relativeDateFilter.dataSet, true);
    map.add(new Pair("using", id));

    processConnectedAttributeFilters(map, connectedAttributeFilters, entities, getUniqueKey);

    return map;
}

export function declarativePositiveAttributeFilterToYaml(
    entities: FromEntities,
    attributeFilter: IPositiveAttributeFilterBody,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "attribute_filter"));

    const id = getIdentifier(attributeFilter.displayForm);
    map.add(new Pair("using", id));

    if (isAttributeElementsByValue(attributeFilter.in)) {
        const ind = attributeFilter.in;
        // Filter out null/undefined but preserve empty strings which are valid attribute values
        const values = ind.values.filter((v): v is string => v !== null && v !== undefined);
        map.add(new Pair("state", new Pair("include", parseDateValues(entities, id, values))));
    }

    return map;
}

export function declarativeNegativeAttributeFilterToYaml(
    entities: FromEntities,
    attributeFilter: INegativeAttributeFilterBody,
): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "attribute_filter"));

    const id = getIdentifier(attributeFilter.displayForm);
    map.add(new Pair("using", id));

    if (isAttributeElementsByValue(attributeFilter.notIn)) {
        const ind = attributeFilter.notIn;
        // Filter out null/undefined but preserve empty strings which are valid attribute values
        const values = ind.values.filter((v): v is string => v !== null && v !== undefined);
        if (values.length > 0) {
            map.add(new Pair("state", new Pair("exclude", parseDateValues(entities, id, values))));
        }
    }

    return map;
}

function addSingleConditionToYaml(map: YAMLMap, condition: MeasureValueFilterCondition): void {
    if (isComparisonCondition(condition)) {
        const comp = condition.comparison;
        map.add(new Pair("condition", comp.operator.toUpperCase()));
        map.add(new Pair("value", comp.value));
        map.add(new Pair("null_values_as_zero", comp.treatNullValuesAs !== undefined));
    } else if (isRangeCondition(condition)) {
        const range = condition.range;
        map.add(new Pair("condition", range.operator.toUpperCase()));
        map.add(new Pair("from", range.from));
        map.add(new Pair("to", range.to));
        map.add(new Pair("null_values_as_zero", range.treatNullValuesAs !== undefined));
    }
}

function addConditionToYamlMap(conditionMap: YAMLMap, condition: MeasureValueFilterCondition): boolean {
    let hasTreatNullValues = false;

    if (isComparisonCondition(condition)) {
        const comp = condition.comparison;
        conditionMap.add(new Pair("condition", comp.operator.toUpperCase()));
        conditionMap.add(new Pair("value", comp.value));
        if (comp.treatNullValuesAs !== undefined) {
            hasTreatNullValues = true;
        }
    } else if (isRangeCondition(condition)) {
        const range = condition.range;
        conditionMap.add(new Pair("condition", range.operator.toUpperCase()));
        conditionMap.add(new Pair("from", range.from));
        conditionMap.add(new Pair("to", range.to));
        if (range.treatNullValuesAs !== undefined) {
            hasTreatNullValues = true;
        }
    }

    return hasTreatNullValues;
}

export function declarativeMeasureValueFilterToYaml(measureValueFilter: IMeasureValueFilterBody): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "metric_value_filter"));

    if (isLocalIdRef(measureValueFilter.measure)) {
        map.add(new Pair("using", measureValueFilter.measure.localIdentifier));
    } else {
        map.add(new Pair("using", getIdentifier(measureValueFilter.measure)));
    }

    // Handle multiple conditions (new SDK model feature)
    if (measureValueFilter.conditions && measureValueFilter.conditions.length > 1) {
        // Multiple conditions: use conditions array
        const conditionsSeq = new YAMLSeq();
        let treatNullValuesAsZero = false;

        measureValueFilter.conditions.forEach((cond) => {
            const conditionMap = new YAMLMap();
            if (addConditionToYamlMap(conditionMap, cond)) {
                treatNullValuesAsZero = true;
            }
            conditionsSeq.add(conditionMap);
        });

        map.add(new Pair("conditions", conditionsSeq));

        if (treatNullValuesAsZero) {
            map.add(new Pair("null_values_as_zero", true));
        }
    } else if (measureValueFilter.conditions?.length === 1) {
        // Single condition in array: use old format for cleaner output
        addSingleConditionToYaml(map, measureValueFilter.conditions[0]);
    } else if (measureValueFilter.condition) {
        // Fallback to single condition field for backward compatibility
        addSingleConditionToYaml(map, measureValueFilter.condition);
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

export function declarativeRankingFilterToYaml(rankingFilter: IRankingFilterBody): YAMLMap {
    const map = new YAMLMap();

    map.add(new Pair("type", "ranking_filter"));

    if (isLocalIdRef(rankingFilter.measure)) {
        map.add(new Pair("using", rankingFilter.measure.localIdentifier));
    } else {
        map.add(new Pair("using", getIdentifier(rankingFilter.measure)));
    }

    if (rankingFilter.operator === "TOP") {
        map.add(new Pair("top", rankingFilter.value));
    }
    if (rankingFilter.operator === "BOTTOM") {
        map.add(new Pair("bottom", rankingFilter.value));
    }

    //NOTE: There can be array, but UI allows only 1 attr now
    if (rankingFilter.attributes?.[0]) {
        const first = rankingFilter.attributes[0];
        if (isLocalIdRef(first)) {
            map.add(new Pair("attribute", first.localIdentifier));
        } else {
            map.add(new Pair("attribute", getIdentifier(first)));
        }
    }

    return map;
}

//sorts

type Sorts = {
    sortsArray: YAMLMap[];
};

export function declarativeSortsToYaml(sorts: ISortItem[]): Sorts {
    const sortsArray: YAMLMap[] = [];

    sorts.forEach((sort) => {
        if (isAttributeSort(sort)) {
            sortsArray.push(declarativeAttributeSortToYaml(sort));
        }
        if (isMeasureSort(sort)) {
            sortsArray.push(declarativeMeasureSortToYaml(sort));
        }
    });

    return {
        sortsArray,
    };
}

export function declarativeAttributeSortToYaml(sort: IAttributeSortItem): YAMLMap {
    const { attributeIdentifier, aggregation, direction } = sort.attributeSortItem;
    const map = new YAMLMap();

    map.add(new Pair("type", "attribute_sort"));
    map.add(new Pair("by", attributeIdentifier));
    map.add(new Pair("direction", direction.toUpperCase()));
    if (aggregation) {
        map.add(new Pair("aggregation", aggregation.toUpperCase()));
    }

    return map;
}

export function declarativeMeasureSortToYaml(sort: IMeasureSortItem): YAMLMap {
    const { locators, direction } = sort.measureSortItem;
    const map = new YAMLMap();

    map.add(new Pair("type", "metric_sort"));
    map.add(new Pair("direction", direction.toUpperCase()));

    const items = locators.map((locator) => {
        const item = new YAMLMap();

        if (isAttributeLocator(locator)) {
            item.add(new Pair("by", locator.attributeLocatorItem.attributeIdentifier));
            if (locator.attributeLocatorItem.element) {
                item.add(new Pair("element", locator.attributeLocatorItem.element));
            }
            if (item.items.length === 1) {
                return item.items[0].value;
            }
            return item;
        }
        if (isMeasureLocator(locator)) {
            return locator.measureLocatorItem.measureIdentifier;
        }
        if (isTotalLocator(locator)) {
            item.add(new Pair("by", locator.totalLocatorItem.attributeIdentifier));
            item.add(new Pair("function", locator.totalLocatorItem.totalFunction.toUpperCase()));
            return item;
        }

        return undefined;
    });
    map.add(new Pair("metrics", items.filter(Boolean)));

    return map;
}

//visualisations

function declarativeVisTableToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const attribute = report.derivedBuckets.find((item) => item.type === BucketsType.Attribute);
    if (attribute && attribute.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(attribute)));
    }

    const columns = report.derivedBuckets.find((item) => item.type === BucketsType.Columns);
    if (columns && columns.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(columns)));
    }

    const config = table.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisBarToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.derivedBuckets.find((item) => item.type === BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = barChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisColumnToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.derivedBuckets.find((item) => item.type === BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = columnChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisLineToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const trend = report.derivedBuckets.find((item) => item.type === BucketsType.Trend);
    if (trend && trend.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(trend)));
    }

    const segment = report.derivedBuckets.find((item) => item.type === BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }

    const config = lineChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisAreaToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.derivedBuckets.find((item) => item.type === BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = areaChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisScatterToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics1 = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    const metrics2 = report.derivedBuckets.find((item) => item.type === BucketsType.SecondaryMeasures);
    const metrics: BucketGroup = {
        items: cleanUpItems([
            ...(metrics1?.items.length ? metrics1.items : [null]),
            ...(metrics2?.items.length ? metrics2.items : [null]),
        ]),
        type: BucketsType.Measures,
    };
    if (metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const attributes = report.derivedBuckets.find((item) => item.type === BucketsType.Attribute);
    if (attributes && attributes.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(attributes)));
    }

    const segments = report.derivedBuckets.find((item) => item.type === BucketsType.Segment);
    if (segments && segments.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(segments)));
    }

    const config = scatterChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisBubbleToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics1 = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    const metrics2 = report.derivedBuckets.find((item) => item.type === BucketsType.SecondaryMeasures);
    const metrics: BucketGroup = {
        items: cleanUpItems([
            ...(metrics1?.items.length ? metrics1.items : [null]),
            ...(metrics2?.items.length ? metrics2.items : [null]),
        ]),
        type: BucketsType.Measures,
    };
    if (metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const tertiaryMetrics = report.derivedBuckets.find((item) => item.type === BucketsType.TertiaryMeasures);
    if (tertiaryMetrics && tertiaryMetrics.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(tertiaryMetrics)));
    }

    const config = bubbleChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisPieToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = pieChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisDonutToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = donutChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisTreemapToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const segment = report.derivedBuckets.find((item) => item.type === BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }

    const config = treemapChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisPyramidToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = pyramidChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisFunnelToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = funnelChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisHeatmapToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.derivedBuckets.find((item) => item.type === BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = heatmapChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisBulletToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics1 = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    const metrics2 = report.derivedBuckets.find((item) => item.type === BucketsType.SecondaryMeasures);
    const metrics3 = report.derivedBuckets.find((item) => item.type === BucketsType.TertiaryMeasures);
    const metrics: BucketGroup = {
        items: cleanUpItems([
            ...(metrics1?.items.length ? metrics1.items : [null]),
            ...(metrics2?.items.length ? metrics2.items : [null]),
            ...(metrics3?.items.length ? metrics3.items : [null]),
        ]),
        type: BucketsType.Measures,
    };
    if (metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = bulletChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisWaterfallToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = waterfallChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisDependencyWheelToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const from = report.derivedBuckets.find((item) => item.type === BucketsType.AttributeFrom);
    const to = report.derivedBuckets.find((item) => item.type === BucketsType.AttributeTo);
    const view: BucketGroup = {
        items: cleanUpItems([
            ...(from?.items.length ? from.items : [null]),
            ...(to?.items.length ? to.items : [null]),
        ]),
        type: BucketsType.View,
    };

    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = dependencyWheelChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisSankeyToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const from = report.derivedBuckets.find((item) => item.type === BucketsType.AttributeFrom);
    const to = report.derivedBuckets.find((item) => item.type === BucketsType.AttributeTo);
    const view: BucketGroup = {
        items: cleanUpItems([
            ...(from?.items.length ? from.items : [null]),
            ...(to?.items.length ? to.items : [null]),
        ]),
        type: BucketsType.View,
    };

    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = sankeyChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisHeadlineToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics1 = report.derivedBuckets.find((item) => item.type === BucketsType.Measures);
    const metrics2 = report.derivedBuckets.find((item) => item.type === BucketsType.SecondaryMeasures);
    const metrics: BucketGroup = {
        items: [...(metrics1?.items ?? [null]), ...(metrics2?.items ?? [])],
        type: BucketsType.Measures,
    };
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const config = headlineChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisComboToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    //buckets
    const metrics1 = addAxisTypeToGroup(
        report.derivedBuckets.find((item) => item.type === BucketsType.Measures),
        "primary",
    );
    const metrics2 = addAxisTypeToGroup(
        report.derivedBuckets.find((item) => item.type === BucketsType.SecondaryMeasures),
        "secondary",
    );

    const metrics: BucketGroup = {
        items: [...(metrics1?.items ?? []), ...(metrics2?.items ?? [])],
        type: BucketsType.Measures,
    };
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = comboChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function addPushpinBucketsToYaml(target: Document | YAMLMap, groups: BucketGroup[]) {
    const sizeBucket = groups.find((item) => item.type === BucketsType.Size);
    const colorBucket = groups.find((item) => item.type === BucketsType.Color);

    const metrics: BucketGroup = {
        items: cleanUpItems([
            ...(sizeBucket?.items.length ? sizeBucket.items : [null]),
            ...(colorBucket?.items ? colorBucket.items : [null]),
        ]),
        type: BucketsType.Measures,
    };

    if (metrics.items.length > 0) {
        target.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const location = groups.find((item) => item.type === BucketsType.Location);
    if (location && location.items.length > 0) {
        target.add(entryWithSpace("view_by", groupToYaml(location)));
    }

    const segment = groups.find((item) => item.type === BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        target.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }
}

function addGeoAreaBucketsToYaml(target: Document | YAMLMap, groups: BucketGroup[]) {
    const colorBucket = groups.find((item) => item.type === BucketsType.Color);

    const metrics: BucketGroup = {
        items: cleanUpItems([...(colorBucket?.items.length ? colorBucket.items : [null])]),
        type: BucketsType.Measures,
    };

    if (metrics.items.length > 0) {
        target.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const area = groups.find((item) => item.type === BucketsType.Area);
    if (area && area.items.length > 0) {
        target.add(entryWithSpace("view_by", groupToYaml(area)));
    }

    const segment = groups.find((item) => item.type === BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        target.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }
}

function declarativeVisGeoToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    entities: FromEntities,
) {
    //buckets
    addPushpinBucketsToYaml(doc, report.derivedBuckets);

    const config = geoChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
    appendLayers(doc, def, entities);
}
function declarativeVisGeoAreaToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    entities: FromEntities,
) {
    //buckets
    addGeoAreaBucketsToYaml(doc, report.derivedBuckets);

    const config = geoAreaChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
    appendLayers(doc, def, entities);
}

function appendLayers(doc: Document, def: IInsightDefinition["insight"], entities: FromEntities) {
    const layersDefinition = def.layers ?? [];
    if (layersDefinition.length === 0) {
        return;
    }

    const layers = declarativeLayersToYaml(entities, layersDefinition);

    if (layers.items.length > 0) {
        doc.add(entryWithSpace("layers", layers));
    }
}

function declarativeVisRepeaterToYaml(doc: Document, def: IInsightDefinition["insight"], report: Report) {
    const columns = report.derivedBuckets.find((item) => item.type === BucketsType.Columns);
    const columnsMapped = addChartTypeToGroup(columns, def.properties);
    if (columnsMapped && columnsMapped.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(columnsMapped)));
    }

    const view = report.derivedBuckets.find((item) => item.type === BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const attribute = report.derivedBuckets.find((item) => item.type === BucketsType.Attribute);
    if (attribute && attribute.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(attribute)));
    }

    const config = repeaterChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

//TOTALS

export function declarativeTotalToYaml(total: ITotal) {
    const map = new YAMLMap();

    if (total.alias) {
        map.add(new Pair("title", total.alias));
    }

    map.add(new Pair("type", total.type.toUpperCase()));
    map.add(new Pair("using", total.measureIdentifier));

    return {
        totalMap: map,
        attribute: total.attributeIdentifier,
    };
}

function groupToYaml(group: BucketGroup) {
    return group.items.map((item) => {
        if (!item) {
            return null;
        }

        const keys = Object.keys(item);

        if (keys.length === 1) {
            return item.field;
        }

        const map = new YAMLMap();
        map.add(new Pair("field", item.field));
        if (item.format) {
            map.add(new Pair("format", item.format));
        }
        if (item.totals && item.totals.length > 0) {
            map.add(new Pair("totals", item.totals));
        }
        if (item.axis) {
            map.add(new Pair("axis", item.axis));
        }
        if (item.display_as) {
            map.add(new Pair("display_as", item.display_as));
        }
        return map;
    });
}

function addAxisTypeToGroup(group: BucketGroup | undefined, axis: "primary" | "secondary") {
    if (!group) {
        return undefined;
    }
    return {
        ...group,
        items: group.items.map((item) => {
            if (item) {
                return {
                    ...item,
                    axis,
                };
            }
            return item;
        }),
    };
}

function addChartTypeToGroup(
    group: BucketGroup | undefined,
    config: IInsightDefinition["insight"]["properties"],
) {
    if (!group || !config) {
        return group;
    }
    if (!config["inlineVisualizations"]) {
        return group;
    }
    const props = config["inlineVisualizations"] as InlineVisualizations;
    return {
        ...group,
        items: group.items.map((item) => {
            if (item && props[item.field]) {
                return {
                    ...item,
                    display_as: props[item.field].type,
                };
            }
            return item;
        }),
    };
}

function declarativeLayersToYaml(
    entities: FromEntities,
    layersDefinition: IInsightLayerDefinition[],
): YAMLSeq {
    const layers = new YAMLSeq();

    layersDefinition.forEach((layer) => {
        const { groups } = declarativeBucketsToYaml(entities, layer.buckets ?? []);
        const layerKind = resolveLayerExportKind(layer.type);
        const layerMap = new YAMLMap();

        layerMap.add(new Pair("id", layer.id));

        if (layer.name) {
            layerMap.add(new Pair("title", layer.name));
        }

        if (layer.type) {
            layerMap.add(new Pair("type", layer.type));
        }

        appendLayerBucketsForKind(layerMap, groups, layerKind);

        addLayerConfig(layerMap, layerKind, layer.properties);

        layers.add(layerMap);
    });

    return layers;
}

type LayerExportKind = "pushpin" | "area";

function resolveLayerExportKind(rawLayerType?: string): LayerExportKind {
    if (rawLayerType === "pushpin") {
        return "pushpin";
    }
    if (rawLayerType === "area") {
        return "area";
    }

    throw newError(CoreErrorCode.LayerTypeNotSupported, [rawLayerType ?? "<missing>"]);
}

function appendLayerBucketsForKind(layerMap: YAMLMap, groups: BucketGroup[], kind: LayerExportKind) {
    if (kind === "pushpin") {
        addPushpinBucketsToYaml(layerMap, groups);
        return;
    }

    if (kind === "area") {
        addGeoAreaBucketsToYaml(layerMap, groups);
        return;
    }

    throw newError(CoreErrorCode.LayerTypeNotSupported, [kind]);
}

function addLayerConfig(
    layerMap: YAMLMap,
    layerKind: LayerExportKind,
    properties: VisualizationProperties | undefined,
) {
    if (!properties) {
        return;
    }

    const config =
        layerKind === "pushpin"
            ? geoChart.load(properties)
            : layerKind === "area"
              ? geoAreaChart.load(properties)
              : null;
    if (config) {
        layerMap.add(config);
    }
}
