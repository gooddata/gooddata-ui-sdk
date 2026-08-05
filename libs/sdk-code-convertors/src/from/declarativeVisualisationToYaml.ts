// (C) 2023-2026 GoodData Corporation

import { Document, Pair, type Scalar, YAMLMap, YAMLSeq, type Node as YamlNode } from "yaml";

import { type DeclarativeVisualizationObject } from "@gooddata/api-client-tiger";
import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";
import {
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
    type IPoPMeasureDefinition,
    type IPreviousPeriodMeasureDefinition,
    type ISortItem,
    type ITotal,
    type VisualizationProperties,
    filterLocalIdentifier,
    isArithmeticMeasureDefinition,
    isAttribute,
    isAttributeLocator,
    isAttributeSort,
    isBucket,
    isFilter,
    isInlineMeasureDefinition,
    isInsight,
    isMeasure,
    isMeasureDefinition,
    isMeasureLocator,
    isMeasureSort,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    isTotalLocator,
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
import { radarChart } from "../configs/radarChart.js";
import { type InlineVisualizations, repeaterChart } from "../configs/repeaterChart.js";
import { sankeyChart } from "../configs/sankeyChart.js";
import { scatterChart } from "../configs/scatterChart.js";
import { table } from "../configs/table.js";
import { treemapChart } from "../configs/treemapChart.js";
import { waterfallChart } from "../configs/waterfallChart.js";
import { BucketsType, type FromEntities } from "../types.js";
import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "../utils/errors.js";
import { remapLocationAttribute } from "../utils/locationUtils.js";
import { VISUALISATION_COMMENT } from "../utils/texts.js";
import { visualizationUrlToYamlVisType } from "../utils/visualisationTypeMap.js";
import { cleanUpItems, entryWithSpace, fillOptionalMetaFields, getIdentifier } from "../utils/yamlUtils.js";

import { type YamlFilterMapEntry, declarativeFiltersToYaml } from "./filtersToYaml.js";

/** @public */
export function declarativeVisualisationToYaml(
    entities: FromEntities,
    visualisation: DeclarativeVisualizationObject,
    context?: IErrorContext,
): {
    content: string;
    json?: Visualisation;
} {
    const errorContext = updateErrorContext(context, {
        type: "visualisation",
        path: ["visualisation", visualisation.id],
        data: {},
    });
    // Build visualisation object
    const insight = { insight: visualisation.content };
    if (!isInsight(insight)) {
        throw newError(CoreErrorCode.VisualizationNotSupported, [JSON.stringify(insight)], errorContext);
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

    const report = declarativeReportToYaml(
        entities,
        insight.insight,
        updateErrorContext(errorContext, {
            path: ["insight"],
        }),
    );
    doc.add(entryWithSpace("query", report.report));

    declarativeVisToYaml(
        doc,
        insight.insight,
        report,
        entities,
        updateErrorContext(errorContext, {
            path: ["insight"],
        }),
    );

    report.buckets.assertAllConsumed(errorContext);
    // Only a type whose grammar has `layers:` writes them; any other drops the list whole, and its fields
    // are already merged into `query.fields` by then, left declared and unreferenced.
    if ((insight.insight.layers ?? []).length > 0 && doc.get("layers") === undefined) {
        throw newError(
            CoreErrorCode.ItemNotSupported,
            ["layers"],
            updateErrorContext(errorContext, { path: ["layers"] }),
        );
    }

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as Visualisation,
    };
}

type BucketRegistry = {
    consume(type: BucketsType): YamlBucketGroup | undefined;
    assertAllConsumed(errorContext?: IErrorContext): void;
};

/**
 * Every type reads the buckets it writes by looking them up, so one it never looks up is dropped whole,
 * taking its items with it.
 */
function bucketRegistry(groups: YamlBucketGroup[]): BucketRegistry {
    // Recorded per group, since two groups may share a type and one lookup reaches only the first.
    const consumed = new Set<YamlBucketGroup>();
    return {
        consume(type) {
            const found = groups.find((group) => group.type === type);
            if (found) {
                consumed.add(found);
            }
            return found;
        },
        // An empty bucket carries nothing to lose, so only one holding items is refused.
        assertAllConsumed(errorContext) {
            const dropped = groups.find((group) => group.items.length > 0 && !consumed.has(group));
            if (dropped) {
                throw newError(
                    CoreErrorCode.ItemNotSupported,
                    [`bucket "${dropped.type}"`],
                    updateErrorContext(errorContext, { path: ["buckets", dropped.type] }),
                );
            }
        },
    };
}

type Report = {
    report: YAMLMap;
    buckets: BucketRegistry;
};

function declarativeReportToYaml(
    entities: FromEntities,
    def: IInsightDefinition["insight"],
    errorContext?: IErrorContext,
): Report {
    const report = new YAMLMap();

    const {
        fieldsMap,
        postProcessors,
        groups: derivedBuckets,
    } = declarativeBucketsToYaml(
        entities,
        def.buckets,
        updateErrorContext(errorContext, {
            path: ["buckets"],
        }),
    );
    appendLayerFieldsToReport(
        fieldsMap,
        postProcessors,
        entities,
        def.layers,
        updateErrorContext(errorContext, {
            path: ["layers"],
        }),
    );
    if (fieldsMap.items.length > 0) {
        report.add(new Pair("fields", fieldsMap));
    }
    const { filtersArray, filtersMap } = declarativeFiltersToYaml(
        entities,
        def.filters ?? [],
        updateErrorContext(errorContext, {
            path: ["filters"],
        }),
    );
    declarativeFiltersConfigToYaml(
        def,
        filtersMap,
        updateErrorContext(errorContext, {
            path: ["filters"],
        }),
    );
    if (filtersArray.items.length > 0) {
        report.add(entryWithSpace("filter_by", filtersArray));
    }

    const { sortsArray } = declarativeSortsToYaml(
        def.sorts ?? [],
        updateErrorContext(errorContext, {
            path: ["sorts"],
        }),
    );
    if (sortsArray.length > 0) {
        report.add(entryWithSpace("sort_by", sortsArray));
    }

    postProcessors.filters?.forEach(({ filters, item }, i) => {
        const { filtersArray, filtersMap } = declarativeFiltersToYaml(
            entities,
            filters,
            updateErrorContext(errorContext, {
                path: ["filters", i.toString()],
            }),
        );
        declarativeFiltersConfigToYaml(
            def,
            filtersMap,
            updateErrorContext(errorContext, {
                path: ["filters", i.toString()],
            }),
        );
        if (filtersArray.items.length > 0) {
            item.add(new Pair("filter_by", filtersArray));
        }
    });

    return {
        report,
        buckets: bucketRegistry(derivedBuckets),
    };
}

function appendLayerFieldsToReport(
    fieldsMap: YAMLMap,
    postProcessors: YamlPostProcessors,
    entities: FromEntities,
    layers?: IInsightLayerDefinition[],
    errorContext?: IErrorContext,
) {
    if (!layers || layers.length === 0) {
        return;
    }

    const knownKeys = new Set(
        fieldsMap.items
            .map((pair) => getPairKeyValue(pair))
            .filter((key): key is string => typeof key === "string" && key.length > 0),
    );

    layers.forEach((layer, li) => {
        const { fieldsMap: layerFieldsMap, postProcessors: layerPostProcessors } = declarativeBucketsToYaml(
            entities,
            layer.buckets ?? [],
            updateErrorContext(errorContext, {
                path: [li.toString(), "buckets"],
            }),
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

export function declarativeFiltersConfigToYaml(
    insight: IInsightDefinition["insight"],
    filtersMap: Record<string, YamlFilterMapEntry>,
    errorContext?: IErrorContext,
) {
    Object.keys(insight.attributeFilterConfigs ?? {}).forEach((key) => {
        const filter = filtersMap[key];
        if (filter) {
            const localIdentifier = filterLocalIdentifier(filter.filter);
            if (localIdentifier) {
                if (insight.attributeFilterConfigs![localIdentifier].displayAsLabel) {
                    filter.yaml.add(
                        new Pair(
                            "display_as",
                            getIdentifier(
                                insight.attributeFilterConfigs![localIdentifier].displayAsLabel,
                                undefined,
                                updateErrorContext(errorContext, {
                                    path: ["attributeFilterConfigs", key, "displayAsLabel"],
                                }),
                            ),
                        ),
                    );
                }
            }
        }
    });
}

/** @internal */
export function declarativeVisTypeToYaml(def: IInsightDefinition["insight"]): string | null {
    return visualizationUrlToYamlVisType.get(def.visualizationUrl) ?? null;
}

function declarativeVisToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    entities: FromEntities,
    errorContext?: IErrorContext,
) {
    const context = updateErrorContext(errorContext, {
        data: {
            ...(errorContext?.data ?? {}),
            type: def.visualizationUrl,
        },
    });

    switch (def.visualizationUrl) {
        case "local:table":
            declarativeVisTableToYaml(doc, def, report, context);
            break;
        case "local:bar":
            declarativeVisBarToYaml(doc, def, report, context);
            break;
        case "local:column":
            declarativeVisColumnToYaml(doc, def, report, context);
            break;
        case "local:line":
            declarativeVisLineToYaml(doc, def, report, context);
            break;
        case "local:area":
            declarativeVisAreaToYaml(doc, def, report, context);
            break;
        case "local:scatter":
            declarativeVisScatterToYaml(doc, def, report, context);
            break;
        case "local:bubble":
            declarativeVisBubbleToYaml(doc, def, report, context);
            break;
        case "local:pie":
            declarativeVisPieToYaml(doc, def, report, context);
            break;
        case "local:donut":
            declarativeVisDonutToYaml(doc, def, report, context);
            break;
        case "local:treemap":
            declarativeVisTreemapToYaml(doc, def, report, context);
            break;
        case "local:pyramid":
            declarativeVisPyramidToYaml(doc, def, report, context);
            break;
        case "local:funnel":
            declarativeVisFunnelToYaml(doc, def, report, context);
            break;
        case "local:heatmap":
            declarativeVisHeatmapToYaml(doc, def, report, context);
            break;
        case "local:bullet":
            declarativeVisBulletToYaml(doc, def, report, context);
            break;
        case "local:waterfall":
            declarativeVisWaterfallToYaml(doc, def, report, context);
            break;
        case "local:dependencywheel":
            declarativeVisDependencyWheelToYaml(doc, def, report, context);
            break;
        case "local:sankey":
            declarativeVisSankeyToYaml(doc, def, report, context);
            break;
        case "local:headline":
            declarativeVisHeadlineToYaml(doc, def, report, context);
            break;
        case "local:combo2":
            declarativeVisComboToYaml(doc, def, report, context);
            break;
        case "local:pushpin":
            declarativeVisGeoToYaml(doc, def, report, entities, context);
            break;
        case "local:choropleth":
            declarativeVisGeoAreaToYaml(doc, def, report, entities, context);
            break;
        case "local:repeater":
            declarativeVisRepeaterToYaml(doc, def, report, context);
            break;
        case "local:radar":
            declarativeVisRadarToYaml(doc, def, report, context);
            break;
        default:
            break;
    }
}

//buckets

/** @internal */
export type YamlPostProcessors = {
    filters: Array<{ item: YAMLMap; filters: IFilter[] }>;
};

/** @internal */
export type YamlBuckets = {
    fieldsMap: YAMLMap;
    groups: YamlBucketGroup[];
    postProcessors: YamlPostProcessors;
};

/** @internal */
export type YamlBucketGroupItems = Array<{
    field: string;
    format?: string;
    totals?: YAMLMap[];
    axis?: "primary" | "secondary";
    display_as?: "metric" | "line" | "column";
} | null>;

/** @internal */
export type YamlBucketGroup = {
    type: BucketsType;
    items: YamlBucketGroupItems;
};

/** @internal */
export type YamlFieldData = {
    format?: string;
    axis?: "primary" | "secondary";
};

/** @internal */
export function declarativeBucketsToYaml(
    entities: FromEntities,
    buckets: IBucket[],
    errorContext?: IErrorContext,
): YamlBuckets {
    const fullFieldsMap = new YAMLMap();
    const groups: YamlBucketGroup[] = [];
    const postProcessors: YamlPostProcessors = {
        filters: [],
    };

    const addField = (
        local: string,
        def: YAMLMap,
        group: YamlBucketGroup,
        { format, axis }: YamlFieldData = {},
    ) => {
        if (fullFieldsMap.has(local)) {
            throw newError(CoreErrorCode.DuplicateFieldName, [local], errorContext);
        }
        fullFieldsMap.add(new Pair(local, def));
        group.items.push(createBucketGroupItem(local, format, axis));
    };

    //create buckets
    buckets.forEach((bucket, bi) => {
        if (isBucket(bucket)) {
            const group: YamlBucketGroup = { items: [], type: bucket.localIdentifier as BucketsType };
            const attributesMap: Record<string, YAMLMap> = {};
            const isLocation = bucket.localIdentifier === BucketsType.Location;

            //items
            bucket.items.forEach((item, ii) => {
                const bucketItemErrorContext = updateErrorContext(errorContext, {
                    path: [bi.toString(), "items", ii.toString()],
                });
                if (isAttribute(item) && isLocation) {
                    const remapped = remapLocationAttribute(entities, item);
                    const def = declarativeAttributeToYaml(
                        remapped.attribute,
                        updateErrorContext(bucketItemErrorContext, {
                            path: ["attribute"],
                        }),
                    );
                    addField(item.attribute.localIdentifier, def, group);
                    attributesMap[item.attribute.localIdentifier] = def;
                    return;
                }
                if (isAttribute(item)) {
                    const def = declarativeAttributeToYaml(
                        item.attribute,
                        updateErrorContext(bucketItemErrorContext, {
                            path: ["attribute"],
                        }),
                    );
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
                        updateErrorContext(bucketItemErrorContext, {
                            path: ["measure"],
                        }),
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
                    const def = declarativePoPMetricToYaml(
                        item.measure,
                        item.measure.definition,
                        updateErrorContext(bucketItemErrorContext, {
                            path: ["measure"],
                        }),
                    );
                    addField(item.measure.localIdentifier, def, group, { format: item.measure.format });
                    attributesMap[item.measure.localIdentifier] = def;
                    return;
                }
                if (isMeasure(item) && isPreviousPeriodMeasureDefinition(item.measure.definition)) {
                    const def = declarativePreviousPeriodMetricToYaml(
                        item.measure,
                        item.measure.definition,
                        updateErrorContext(bucketItemErrorContext, {
                            path: ["measure"],
                        }),
                    );
                    addField(item.measure.localIdentifier, def, group, { format: item.measure.format });
                    attributesMap[item.measure.localIdentifier] = def;
                    return;
                }
                throw newError(
                    CoreErrorCode.BucketItemTypeNotSupported,
                    [JSON.stringify(item)],
                    bucketItemErrorContext,
                );
            });

            //totals
            bucket.totals?.forEach((total, ti) => {
                const totalItemErrorContext = updateErrorContext(errorContext, {
                    path: [bi.toString(), "totals", ti.toString()],
                });
                const { totalMap, attribute } = declarativeTotalToYaml(total, totalItemErrorContext);
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

/** @internal */
export function declarativeAttributeToYaml(def: IAttributeBody, errorContext?: IErrorContext): YAMLMap {
    const map = new YAMLMap();

    if (def.alias) {
        map.add(new Pair("title", def.alias));
    }
    const id = getIdentifier(
        def.displayForm,
        undefined,
        updateErrorContext(errorContext, {
            path: ["displayForm"],
        }),
    );
    map.add(new Pair("using", id));

    if (def.showAllValues) {
        map.add(new Pair("show_all_values", true));
    }

    return map;
}

/** @internal */
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

/** @internal */
export function declarativeNormalMetricToYaml(
    def: IMeasureBody,
    metricDefinition: IMeasureDefinition,
    postProcessors: YamlPostProcessors,
    errorContext?: IErrorContext,
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

    const id = getIdentifier(
        md.item,
        undefined,
        updateErrorContext(errorContext, {
            path: ["item"],
        }),
    );
    map.add(new Pair("using", id));

    return map;
}

/** @internal */
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

/** @internal */
export function declarativePoPMetricToYaml(
    def: IMeasureBody,
    popDefinition: IPoPMeasureDefinition,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    fillDefaultMetricProperties(map, def);

    const pop = popDefinition.popMeasureDefinition;
    const id = getIdentifier(
        pop.popAttribute,
        true,
        updateErrorContext(errorContext, {
            path: ["popAttribute"],
        }),
    );
    const [date] = id.split(".");

    map.add(new Pair("type", "PREVIOUS_YEAR"));
    map.add(new Pair("date_filter", date));
    map.add(new Pair("using", pop.measureIdentifier));

    return map;
}

/** @internal */
export function declarativePreviousPeriodMetricToYaml(
    def: IMeasureBody,
    previousDefinition: IPreviousPeriodMeasureDefinition,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();

    fillDefaultMetricProperties(map, def);

    const previous = previousDefinition.previousPeriodMeasure;

    if (previous.dateDataSets.length > 1) {
        throw newError(
            CoreErrorCode.MultipleDateDataSets,
            [JSON.stringify(previous)],
            updateErrorContext(errorContext, {
                path: ["previousPeriodMeasure", "dateDataSets"],
            }),
        );
    }

    const prev = previous.dateDataSets[0];
    const id = getIdentifier(
        prev.dataSet,
        true,
        updateErrorContext(errorContext, {
            path: ["dateSet"],
        }),
    );
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
): YamlBucketGroupItems[number] {
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

//sorts

/** @internal */
export type YamlSorts = {
    sortsArray: YAMLMap[];
};

/** @internal */
export function declarativeSortsToYaml(sorts: ISortItem[], _errorContext?: IErrorContext): YamlSorts {
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

/** @internal */
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

/** @internal */
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

function declarativeVisTableToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _context?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const attribute = report.buckets.consume(BucketsType.Attribute);
    if (attribute && attribute.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(attribute)));
    }

    const columns = report.buckets.consume(BucketsType.Columns);
    if (columns && columns.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(columns)));
    }

    const config = table.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisBarToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.buckets.consume(BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = barChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisColumnToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.buckets.consume(BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = columnChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisLineToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const trend = report.buckets.consume(BucketsType.Trend);
    if (trend && trend.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(trend)));
    }

    const segment = report.buckets.consume(BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }

    const config = lineChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisRadarToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const trend = report.buckets.consume(BucketsType.Trend);
    if (trend && trend.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(trend)));
    }

    const segment = report.buckets.consume(BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }

    const config = radarChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisAreaToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.buckets.consume(BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = areaChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisScatterToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics1 = report.buckets.consume(BucketsType.Measures);
    const metrics2 = report.buckets.consume(BucketsType.SecondaryMeasures);
    const metrics: YamlBucketGroup = {
        items: cleanUpItems([
            ...(metrics1?.items.length ? metrics1.items : [null]),
            ...(metrics2?.items.length ? metrics2.items : [null]),
        ]),
        type: BucketsType.Measures,
    };
    if (metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const attributes = report.buckets.consume(BucketsType.Attribute);
    if (attributes && attributes.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(attributes)));
    }

    const segments = report.buckets.consume(BucketsType.Segment);
    if (segments && segments.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(segments)));
    }

    const config = scatterChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisBubbleToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics1 = report.buckets.consume(BucketsType.Measures);
    const metrics2 = report.buckets.consume(BucketsType.SecondaryMeasures);
    const metrics: YamlBucketGroup = {
        items: cleanUpItems([
            ...(metrics1?.items.length ? metrics1.items : [null]),
            ...(metrics2?.items.length ? metrics2.items : [null]),
        ]),
        type: BucketsType.Measures,
    };
    if (metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const tertiaryMetrics = report.buckets.consume(BucketsType.TertiaryMeasures);
    if (tertiaryMetrics && tertiaryMetrics.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(tertiaryMetrics)));
    }

    const config = bubbleChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisPieToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = pieChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisDonutToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = donutChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisTreemapToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const segment = report.buckets.consume(BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }

    const config = treemapChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisPyramidToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = pyramidChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisFunnelToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = funnelChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisHeatmapToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const stack = report.buckets.consume(BucketsType.Stack);
    if (stack && stack.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(stack)));
    }

    const config = heatmapChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisBulletToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics1 = report.buckets.consume(BucketsType.Measures);
    const metrics2 = report.buckets.consume(BucketsType.SecondaryMeasures);
    const metrics3 = report.buckets.consume(BucketsType.TertiaryMeasures);
    const metrics: YamlBucketGroup = {
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

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = bulletChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function declarativeVisWaterfallToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
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
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const from = report.buckets.consume(BucketsType.AttributeFrom);
    const to = report.buckets.consume(BucketsType.AttributeTo);
    const view: YamlBucketGroup = {
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

function declarativeVisSankeyToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics = report.buckets.consume(BucketsType.Measures);
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const from = report.buckets.consume(BucketsType.AttributeFrom);
    const to = report.buckets.consume(BucketsType.AttributeTo);
    const view: YamlBucketGroup = {
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

function declarativeVisHeadlineToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics1 = report.buckets.consume(BucketsType.Measures);
    const metrics2 = report.buckets.consume(BucketsType.SecondaryMeasures);
    const metrics: YamlBucketGroup = {
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

function declarativeVisComboToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    //buckets
    const metrics1 = addAxisTypeToGroup(report.buckets.consume(BucketsType.Measures), "primary");
    const metrics2 = addAxisTypeToGroup(report.buckets.consume(BucketsType.SecondaryMeasures), "secondary");

    const metrics: YamlBucketGroup = {
        items: [...(metrics1?.items ?? []), ...(metrics2?.items ?? [])],
        type: BucketsType.Measures,
    };
    if (metrics && metrics.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const config = comboChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

function addPushpinBucketsToYaml(target: Document | YAMLMap, buckets: BucketRegistry) {
    const sizeBucket = buckets.consume(BucketsType.Size);
    const colorBucket = buckets.consume(BucketsType.Color);

    const metrics: YamlBucketGroup = {
        items: cleanUpItems([
            ...(sizeBucket?.items.length ? sizeBucket.items : [null]),
            ...(colorBucket?.items ? colorBucket.items : [null]),
        ]),
        type: BucketsType.Measures,
    };

    if (metrics.items.length > 0) {
        target.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const location = buckets.consume(BucketsType.Location);
    if (location && location.items.length > 0) {
        target.add(entryWithSpace("view_by", groupToYaml(location)));
    }

    const segment = buckets.consume(BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        target.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }
}

function addGeoAreaBucketsToYaml(target: Document | YAMLMap, buckets: BucketRegistry) {
    const colorBucket = buckets.consume(BucketsType.Color);

    const metrics: YamlBucketGroup = {
        items: cleanUpItems([...(colorBucket?.items.length ? colorBucket.items : [null])]),
        type: BucketsType.Measures,
    };

    if (metrics.items.length > 0) {
        target.add(entryWithSpace("metrics", groupToYaml(metrics)));
    }

    const area = buckets.consume(BucketsType.Area);
    if (area && area.items.length > 0) {
        target.add(entryWithSpace("view_by", groupToYaml(area)));
    }

    const segment = buckets.consume(BucketsType.Segment);
    if (segment && segment.items.length > 0) {
        target.add(entryWithSpace("segment_by", groupToYaml(segment)));
    }
}

function declarativeVisGeoToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    entities: FromEntities,
    errorContext?: IErrorContext,
) {
    //buckets
    addPushpinBucketsToYaml(doc, report.buckets);

    const config = geoChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
    appendLayers(doc, def, entities, errorContext);
}
function declarativeVisGeoAreaToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    entities: FromEntities,
    errorContext?: IErrorContext,
) {
    //buckets
    addGeoAreaBucketsToYaml(doc, report.buckets);

    const config = geoAreaChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
    appendLayers(doc, def, entities, errorContext);
}

function appendLayers(
    doc: Document,
    def: IInsightDefinition["insight"],
    entities: FromEntities,
    errorContext?: IErrorContext,
) {
    const layersDefinition = def.layers ?? [];
    if (layersDefinition.length === 0) {
        return;
    }

    const layers = declarativeLayersToYaml(
        entities,
        layersDefinition,
        updateErrorContext(errorContext, { path: ["layers"] }),
    );

    if (layers.items.length > 0) {
        doc.add(entryWithSpace("layers", layers));
    }
}

function declarativeVisRepeaterToYaml(
    doc: Document,
    def: IInsightDefinition["insight"],
    report: Report,
    _errorContext?: IErrorContext,
) {
    const columns = report.buckets.consume(BucketsType.Columns);
    const columnsMapped = addChartTypeToGroup(columns, def.properties);
    if (columnsMapped && columnsMapped.items.length > 0) {
        doc.add(entryWithSpace("metrics", groupToYaml(columnsMapped)));
    }

    const view = report.buckets.consume(BucketsType.View);
    if (view && view.items.length > 0) {
        doc.add(entryWithSpace("view_by", groupToYaml(view)));
    }

    const attribute = report.buckets.consume(BucketsType.Attribute);
    if (attribute && attribute.items.length > 0) {
        doc.add(entryWithSpace("segment_by", groupToYaml(attribute)));
    }

    const config = repeaterChart.load(def.properties);
    if (config) {
        doc.add(config);
    }
}

//TOTALS

/** @internal */
export function declarativeTotalToYaml(total: ITotal, _errorContext?: IErrorContext) {
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

function groupToYaml(group: YamlBucketGroup) {
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

function addAxisTypeToGroup(group: YamlBucketGroup | undefined, axis: "primary" | "secondary") {
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
    group: YamlBucketGroup | undefined,
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

type UnrepresentableLayerField = "filters" | "sorts" | "attributeFilterConfigs";

// Each check matches what the emitter would have written, so a value it would have ignored anyway (an
// unrecognized filter, a config carrying no label) is not refused.
function unrepresentableLayerField(layer: IInsightLayerDefinition): UnrepresentableLayerField | null {
    if (layer.filters?.some(isFilter)) {
        return "filters";
    }
    if (layer.sorts?.length) {
        return "sorts";
    }
    const configs = Object.values(layer.attributeFilterConfigs ?? {});
    return configs.some((config) => config?.displayAsLabel) ? "attributeFilterConfigs" : null;
}

function declarativeLayersToYaml(
    entities: FromEntities,
    layersDefinition: IInsightLayerDefinition[],
    errorContext?: IErrorContext,
): YAMLSeq {
    const layers = new YAMLSeq();

    layersDefinition.forEach((layer, li) => {
        // A layer's own filters and sorts would read back as the insight's, so they are refused.
        const unrepresentable = unrepresentableLayerField(layer);
        if (unrepresentable !== null) {
            throw newError(
                CoreErrorCode.ItemNotSupported,
                [`layer "${layer.id}" own ${unrepresentable}`],
                updateErrorContext(errorContext, { path: [li.toString(), unrepresentable] }),
            );
        }
        const { groups: layerGroups } = declarativeBucketsToYaml(
            entities,
            layer.buckets ?? [],
            updateErrorContext(errorContext, { path: [li.toString(), "buckets"] }),
        );
        const buckets = bucketRegistry(layerGroups);
        const layerKind = resolveLayerExportKind(
            layer.type,
            updateErrorContext(errorContext, { path: [li.toString(), "type"] }),
        );
        const layerMap = new YAMLMap();

        layerMap.add(new Pair("id", layer.id));

        if (layer.name) {
            layerMap.add(new Pair("title", layer.name));
        }

        if (layer.type) {
            layerMap.add(new Pair("type", layer.type));
        }

        appendLayerBucketsForKind(
            layerMap,
            buckets,
            layerKind,
            updateErrorContext(errorContext, { path: [li.toString()] }),
        );
        buckets.assertAllConsumed(updateErrorContext(errorContext, { path: [li.toString()] }));

        addLayerConfig(layerMap, layerKind, layer.properties);

        layers.add(layerMap);
    });

    return layers;
}

type LayerExportKind = "pushpin" | "area";

function resolveLayerExportKind(rawLayerType?: string, errorContext?: IErrorContext): LayerExportKind {
    if (rawLayerType === "pushpin") {
        return "pushpin";
    }
    if (rawLayerType === "area") {
        return "area";
    }

    throw newError(CoreErrorCode.LayerTypeNotSupported, [rawLayerType ?? "<missing>"], errorContext);
}

function appendLayerBucketsForKind(
    layerMap: YAMLMap,
    buckets: BucketRegistry,
    kind: LayerExportKind,
    errorContext?: IErrorContext,
) {
    if (kind === "pushpin") {
        addPushpinBucketsToYaml(layerMap, buckets);
        return;
    }

    if (kind === "area") {
        addGeoAreaBucketsToYaml(layerMap, buckets);
        return;
    }

    throw newError(CoreErrorCode.LayerTypeNotSupported, [kind], errorContext);
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
