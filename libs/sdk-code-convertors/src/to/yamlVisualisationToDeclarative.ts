// (C) 2023-2026 GoodData Corporation

import {
    type DeclarativeVisualizationObject,
    type JsonApiVisualizationObjectOut,
} from "@gooddata/api-client-tiger";
import type {
    All,
    AttributeFilter,
    Bucket,
    Comparison,
    ComparisonCondition,
    DateDataset,
    DateFilter,
    EmptyBucket,
    Field,
    Filter,
    MetricSort,
    MetricValueFilter,
    MetricValueFilterCondition,
    MultipleConditions,
    Query,
    QueryFilters,
    Range,
    RangeCondition,
    RankingFilter,
    Sorts,
    Total,
    Visualisation,
    VisualizationDataLayer,
} from "@gooddata/sdk-code-schemas/v1";
import {
    type ArithmeticMeasureOperator,
    type IAttributeFilterConfigs,
    type IBucket,
    type IFilter,
    type IInsight,
    type IInsightLayerDefinition,
    type IMeasureValueFilterBody,
    type IRelativeDateFilterAllTimeBody,
    type ISortItem,
    type ITotal,
    type MeasureAggregation,
    type MeasureValueFilterCondition,
    type TotalType,
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
import { repeaterChart } from "../configs/repeaterChart.js";
import { sankeyChart } from "../configs/sankeyChart.js";
import { scatterChart } from "../configs/scatterChart.js";
import { table } from "../configs/table.js";
import { treemapChart } from "../configs/treemapChart.js";
import { waterfallChart } from "../configs/waterfallChart.js";
import { BucketsType, type ExportEntities } from "../types.js";
import { convertBucketToTitle } from "../utils/convertBucketToTitle.js";
import { mapDateAttribute, mapDateDataset } from "../utils/dateUtils.js";
import { CoreErrorCode, newError } from "../utils/errors.js";
import { parseDateValues } from "../utils/filterUtils.js";
import { convertGranularity, convertGranularityToId } from "../utils/granularityUtils.js";
import { mapLocationLabel } from "../utils/locationUtils.js";
import { assertUnreachable, convertIdToTitle, getFullBucket, getFullField } from "../utils/sharedUtils.js";
import {
    isAbsoluteDateFilter,
    isArithmeticMetricField,
    isAttributeField,
    isAttributeSort,
    isCalculatedMetricField,
    isInlineMetricField,
    isMetricAllValueFilter,
    isMetricComparisonValueFilter,
    isMetricField,
    isMetricRangeValueFilter,
    isMetricSort,
    isMetricValueFilterWithConditions,
    isNegativeAttributeFilter,
    isPoPMetricField,
    isPositiveAttributeFilter,
    isPreviousPeriodField,
    isRankingFilter,
    isRelativeDateFilter,
    parseReferenceObject,
} from "../utils/typeGuards.js";
import { createIdentifier, createLocalIdentifier } from "../utils/yamlUtils.js";

type VisualisationDefinition = Pick<
    IInsight["insight"],
    "visualizationUrl" | "properties" | "filters" | "buckets" | "sorts" | "attributeFilterConfigs"
> & {
    version: string;
};
type VisBucket = Omit<IBucket, "items" | "totals"> & { items: Array<Bucket> };
type YamlVisualizationLayer = VisualizationDataLayer & {
    query?: Query;
};

/** @public */
export function yamlVisualisationToDeclarative(
    entities: ExportEntities,
    input: Visualisation,
): DeclarativeVisualizationObject {
    const { buckets, sorts, filters, positions, attributeFilterConfigs } = yamlReportToDeclarative(
        entities,
        input,
    );
    const properties = yamlConfigToDeclarative(input, positions);

    const layers = yamlLayersToDeclarative(entities, input, positions);

    const content: VisualisationDefinition = {
        version: "2",
        visualizationUrl: yamlVisTypeToDeclarative(input),
        buckets,
        sorts,
        filters,
        properties,
        ...(attributeFilterConfigs ? { attributeFilterConfigs: attributeFilterConfigs } : {}),
        ...(layers.length ? { layers } : {}),
    };

    const output: DeclarativeVisualizationObject = {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        tags: input.tags ?? [],
        description: input.description ?? "",
        content,
    };

    if (input.is_hidden !== undefined) {
        output.isHidden = input.is_hidden;
    }
    if (input.show_in_ai_results !== undefined) {
        output.isHidden = input.show_in_ai_results === false;
    }

    return output;
}

/** @public */
export function yamlVisualisationToMetadataObject(
    entities: ExportEntities,
    input: Visualisation,
): JsonApiVisualizationObjectOut {
    const declarative = yamlVisualisationToDeclarative(entities, input);

    return {
        type: "visualizationObject",
        id: declarative.id,
        attributes: declarative as JsonApiVisualizationObjectOut["attributes"],
    };
}

function yamlVisTypeToDeclarative(def: Visualisation): string {
    switch (def.type) {
        case "table":
            return "local:table";
        case "bar_chart":
            return "local:bar";
        case "column_chart":
            return "local:column";
        case "line_chart":
            return "local:line";
        case "area_chart":
            return "local:area";
        case "scatter_chart":
            return "local:scatter";
        case "bubble_chart":
            return "local:bubble";
        case "pie_chart":
            return "local:pie";
        case "donut_chart":
            return "local:donut";
        case "treemap_chart":
            return "local:treemap";
        case "pyramid_chart":
            return "local:pyramid";
        case "funnel_chart":
            return "local:funnel";
        case "heatmap_chart":
            return "local:heatmap";
        case "bullet_chart":
            return "local:bullet";
        case "waterfall_chart":
            return "local:waterfall";
        case "dependency_wheel_chart":
            return "local:dependencywheel";
        case "sankey_chart":
            return "local:sankey";
        case "headline_chart":
            return "local:headline";
        case "combo_chart":
            return "local:combo2";
        case "geo_chart":
            return "local:pushpin";
        case "geo_area_chart":
            return "local:choropleth";
        case "repeater_chart":
            return "local:repeater";
    }
}

function yamlConfigToDeclarative(
    def: Visualisation,
    positions: Array<{ longitude: string; latitude: string }>,
): VisualisationDefinition["properties"] {
    let controls;
    let inlineVisualizations;

    switch (def.type) {
        case "table":
            controls = table.save(def.query?.fields, def.config);
            break;
        case "bar_chart":
            controls = barChart.save(def.query?.fields, def.config);
            break;
        case "column_chart":
            controls = columnChart.save(def.query?.fields, def.config);
            break;
        case "line_chart":
            controls = lineChart.save(def.query?.fields, def.config);
            break;
        case "area_chart":
            controls = areaChart.save(def.query?.fields, def.config);
            break;
        case "scatter_chart":
            controls = scatterChart.save(def.query?.fields, def.config);
            break;
        case "bubble_chart":
            controls = bubbleChart.save(def.query?.fields, def.config);
            break;
        case "pie_chart":
            controls = pieChart.save(def.query?.fields, def.config);
            break;
        case "donut_chart":
            controls = donutChart.save(def.query?.fields, def.config);
            break;
        case "treemap_chart":
            controls = treemapChart.save(def.query?.fields, def.config);
            break;
        case "pyramid_chart":
            controls = pyramidChart.save(def.query?.fields, def.config);
            break;
        case "funnel_chart":
            controls = funnelChart.save(def.query?.fields, def.config);
            break;
        case "heatmap_chart":
            controls = heatmapChart.save(def.query?.fields, def.config);
            break;
        case "bullet_chart":
            controls = bulletChart.save(def.query?.fields, def.config);
            break;
        case "waterfall_chart":
            controls = waterfallChart.save(def.query?.fields, def.config);
            break;
        case "dependency_wheel_chart":
            controls = dependencyWheelChart.save(def.query?.fields, def.config);
            break;
        case "sankey_chart":
            controls = sankeyChart.save(def.query?.fields, def.config);
            break;
        case "headline_chart":
            controls = headlineChart.save(def.query?.fields, def.config);
            break;
        case "combo_chart":
            controls = comboChart.save(def.query?.fields, def.config, def.metrics);
            break;
        case "geo_chart":
            controls = geoChart.save(def.query?.fields, def.config, positions);
            break;
        case "geo_area_chart":
            controls = geoAreaChart.save(def.query?.fields, def.config, positions);
            break;
        case "repeater_chart":
            controls = repeaterChart.save(def.query?.fields, def.config);
            inlineVisualizations = repeaterChart.saveInlineVisualizations([
                ...(def.metrics ?? []),
                ...(def.columns ?? []),
            ]);
            break;
    }

    return {
        ...(controls ? { controls } : {}),
        ...(inlineVisualizations ? { inlineVisualizations } : {}),
    };
}

//REPORT

export function yamlReportToDeclarative(
    entities: ExportEntities,
    input: Visualisation,
): {
    buckets: VisualisationDefinition["buckets"];
    sorts: VisualisationDefinition["sorts"];
    filters: VisualisationDefinition["filters"];
    positions: Array<{ longitude: string; latitude: string }>;
    attributeFilterConfigs?: IAttributeFilterConfigs;
} {
    const { buckets, positions, attrFilterConfig } = yamlBucketsToDeclarative(entities, input);

    const query = input.query;
    const sorts = yamlSortsToDeclarative(query.sort_by, query.fields || {});
    const { filters, attributeFilterConfigs } = yamlFiltersToDeclarative(
        entities,
        query.filter_by,
        attrFilterConfig,
    );

    return {
        buckets,
        sorts,
        filters,
        positions,
        attributeFilterConfigs,
    };
}

function yamlBucketItemToDeclarative(
    entities: ExportEntities,
    query: Query,
    item: Bucket,
    fields: Visualisation["query"]["fields"],
    bucketType: string | undefined,
) {
    const location = bucketType === BucketsType.Location;

    if (typeof item === "string") {
        const { bucketItem, longitude, latitude, filterConfig } = yamlReportFieldToDeclarative(
            entities,
            query,
            item,
            fields[item],
            {
                location,
            },
        );
        return {
            bucketTotals: [],
            bucketItem,
            longitude,
            latitude,
            filterConfig,
        };
    }

    if (item.field) {
        const { bucketItem, longitude, latitude, filterConfig } = yamlReportFieldToDeclarative(
            entities,
            query,
            item.field,
            fields[item.field],
            {
                format: item.format,
                location,
            },
        );
        const bucketTotals = yamlReportTotalToDeclarative(item.totals, item.field);

        return {
            bucketTotals,
            bucketItem,
            longitude,
            latitude,
            filterConfig,
        };
    }
    return {
        bucketTotals: [],
    };
}

function yamlReportFieldToDeclarative(
    entities: ExportEntities,
    query: Query,
    localName: string,
    f: Field | undefined,
    opts: { format?: string; location?: boolean },
): { bucketItem?: any; latitude?: string; longitude?: string; filterConfig?: IAttributeFilterConfigs } {
    const field = resolveField(localName, f);

    if (!field) {
        return {};
    }

    if (isAttributeField(field) && opts.location) {
        const { displayForm, latitude, longitude } = mapLocationLabel(entities, field);
        if (displayForm) {
            return {
                bucketItem: {
                    attribute: {
                        showAllValues: field.show_all_values,
                        alias: field.title,
                        localIdentifier: localName,
                        displayForm: displayForm,
                    },
                },
                latitude,
                longitude,
            };
        }
        return {};
    }
    if (isAttributeField(field)) {
        const displayForm = createIdentifier(field.using) as any;
        if (displayForm) {
            return {
                bucketItem: {
                    attribute: {
                        showAllValues: field.show_all_values,
                        alias: field.title,
                        localIdentifier: localName,
                        displayForm: displayForm,
                    },
                },
            };
        }
        return {};
    }
    if (isInlineMetricField(field)) {
        return {
            bucketItem: {
                measure: {
                    alias: field.title,
                    title: convertBucketToTitle(entities, query, field),
                    localIdentifier: localName,
                    format: opts.format,
                    definition: {
                        inlineDefinition: {
                            maql: field.maql,
                        },
                    },
                },
            },
        };
    }
    if (isCalculatedMetricField(field)) {
        const item = createIdentifier(field.using, { forceMetric: true }) as any;
        if (item) {
            const aggregation = (field.aggregation ?? "SUM").toLowerCase() as MeasureAggregation;
            const { filters, attributeFilterConfigs } = yamlFiltersToDeclarative(entities, field.filter_by);
            return {
                bucketItem: {
                    measure: {
                        alias: field.title,
                        title: convertBucketToTitle(entities, query, field),
                        localIdentifier: localName,
                        format: opts.format,
                        definition: {
                            measureDefinition: {
                                item,
                                aggregation,
                                filters,
                                computeRatio: field.compute_ratio,
                            },
                        },
                    },
                },
                filterConfig: attributeFilterConfigs,
            };
        }
        return {};
    }
    if (isMetricField(field)) {
        const item = createIdentifier(field.using, { forceMetric: true }) as any;
        const { filters, attributeFilterConfigs } = yamlFiltersToDeclarative(entities, field.filter_by);
        if (item) {
            return {
                bucketItem: {
                    measure: {
                        alias: field.title,
                        title: convertBucketToTitle(entities, query, field),
                        localIdentifier: localName,
                        format: opts.format,
                        definition: {
                            measureDefinition: {
                                item,
                                filters,
                                computeRatio: field.compute_ratio,
                            },
                        },
                    },
                },
                filterConfig: attributeFilterConfigs,
            };
        }
        return {};
    }
    if (isArithmeticMetricField(field)) {
        const measureIdentifiers = field.using;
        if (measureIdentifiers.length >= 2) {
            return {
                bucketItem: {
                    measure: {
                        alias: field.title,
                        title: convertBucketToTitle(entities, query, field),
                        localIdentifier: localName,
                        format: opts.format,
                        definition: {
                            arithmeticMeasure: {
                                measureIdentifiers,
                                operator: (
                                    field.operator ?? "SUM"
                                ).toLowerCase() as ArithmeticMeasureOperator,
                            },
                        },
                    },
                },
            };
        }
        return {};
    }
    if (isPoPMetricField(field)) {
        const popAttribute = mapDateAttribute(query, field);
        if (popAttribute) {
            return {
                bucketItem: {
                    measure: {
                        alias: field.title,
                        title: convertBucketToTitle(entities, query, field),
                        localIdentifier: localName,
                        format: opts.format,
                        definition: {
                            popMeasureDefinition: {
                                measureIdentifier: field.using,
                                popAttribute,
                            },
                        },
                    },
                },
            };
        }
        return {};
    }
    if (isPreviousPeriodField(field)) {
        const dataset = mapDateDataset(query, field);
        if (dataset) {
            return {
                bucketItem: {
                    measure: {
                        alias: field.title,
                        title: convertBucketToTitle(entities, query, field),
                        localIdentifier: localName,
                        format: opts.format,
                        definition: {
                            previousPeriodMeasure: {
                                measureIdentifier: field.using,
                                dateDataSets: [
                                    {
                                        dataSet: dataset,
                                        periodsAgo: field.period ?? 1,
                                    },
                                ],
                            },
                        },
                    },
                },
            };
        }
        return {};
    }

    return {};
}

function resolveField(localName: string, field?: Field) {
    if (field) {
        return getFullField(field);
    }

    if (parseReferenceObject(localName)) {
        return getFullField(localName as unknown as Field);
    }

    return undefined;
}

//SORTS

export function yamlSortsToDeclarative(
    sort_by: Sorts | undefined,
    fields: Visualisation["query"]["fields"],
): ISortItem[] {
    if (!sort_by) {
        return [];
    }
    return sort_by
        .map((sort) => {
            if (isAttributeSort(sort)) {
                return {
                    attributeSortItem: {
                        attributeIdentifier: sort.by,
                        aggregation: sort.aggregation?.toLowerCase() as "sum" | undefined,
                        direction: sort.direction?.toLowerCase(),
                    },
                };
            }
            if (isMetricSort(sort)) {
                return {
                    measureSortItem: {
                        locators: sort.metrics
                            .map((loc) => yamlLocatorToDeclarative(loc, fields))
                            .filter(Boolean),
                        direction: sort.direction?.toLowerCase(),
                    },
                };
            }
            return null;
        })
        .filter(Boolean) as ISortItem[];
}

function yamlLocatorToDeclarative(
    loc: MetricSort["metrics"][number],
    fields: Visualisation["query"]["fields"],
) {
    const locator = typeof loc === "string" ? { by: loc } : loc;
    const field = getFullField(fields[locator.by]);

    if (!field) {
        return null;
    }

    if (isAttributeField(field) && !locator.function) {
        return {
            attributeLocatorItem: {
                attributeIdentifier: locator.by,
                element: locator.element ?? null,
            },
        };
    }

    if (isAttributeField(field) && locator.function) {
        return {
            totalLocatorItem: {
                attributeIdentifier: locator.by,
                totalFunction: locator.function.toLowerCase(),
            },
        };
    }

    return {
        measureLocatorItem: {
            measureIdentifier: locator.by,
        },
    };
}

//FILTERS
type YamlFilterToDeclarativeResult = {
    filters: IFilter[];
    attributeFilterConfig?: IAttributeFilterConfigs;
};

function buildMeasureValueFilterDimensionality(
    filter: MetricValueFilter,
): IMeasureValueFilterBody["dimensionality"] {
    if (filter.dimensionality && Array.isArray(filter.dimensionality) && filter.dimensionality.length > 0) {
        return filter.dimensionality.map(
            (item: string) => createIdentifier(item) || createLocalIdentifier(item),
        );
    }

    return undefined;
}

function createBaseMeasureValueFilter(filter: MetricValueFilter): IMeasureValueFilterBody {
    const measureValueFilter: IMeasureValueFilterBody = {
        // When MVF references a metric by ref (e.g. "metric/amount"), preserve "metric" type.
        measure: createIdentifier(filter.using, { forceMetric: true }) || createLocalIdentifier(filter.using),
    };

    const dimensionality = buildMeasureValueFilterDimensionality(filter);
    if (dimensionality) {
        measureValueFilter.dimensionality = dimensionality;
    }

    return measureValueFilter;
}

function convertYamlConditionsToSdk(
    yamlConditions: MetricValueFilterCondition[],
    nullValuesAsZero?: boolean,
): MeasureValueFilterCondition[] {
    const sdkConditions: MeasureValueFilterCondition[] = [];

    yamlConditions.forEach((c) => {
        if ("condition" in c && c.condition) {
            if (c.condition === "BETWEEN" || c.condition === "NOT_BETWEEN") {
                const rangeCondition = c as RangeCondition;
                sdkConditions.push({
                    range: {
                        operator: rangeCondition.condition,
                        from: rangeCondition.from,
                        to: rangeCondition.to,
                        treatNullValuesAs: nullValuesAsZero ? 0 : undefined,
                    },
                });
            } else {
                const comparisonCondition = c as ComparisonCondition;
                sdkConditions.push({
                    comparison: {
                        operator: comparisonCondition.condition,
                        value: comparisonCondition.value,
                        treatNullValuesAs: nullValuesAsZero ? 0 : undefined,
                    },
                });
            }
        }
    });

    return sdkConditions;
}

function yamlAbsoluteDateFilterToDeclarative(
    entities: ExportEntities,
    filter: DateFilter,
): YamlFilterToDeclarativeResult {
    let result: YamlFilterToDeclarativeResult = {
        filters: [
            {
                absoluteDateFilter: {
                    dataSet: createIdentifier<any>(filter.using, { forceType: "dataset" }),
                    from: filter.from as string,
                    to: filter.to as string,
                },
            },
        ],
    };

    result = mergeDeclarativeResults(result, dateFilterEmptyValuesToDeclarative(filter));
    result = mergeDeclarativeResults(result, dateFilterWithFieldToDeclarative(entities, filter));

    return result;
}

function dateFilterEmptyValuesToDeclarative(filter: DateFilter): YamlFilterToDeclarativeResult {
    if (!filter.empty_values) {
        return { filters: [] };
    }

    const identifier = createIdentifier<any>(
        `${filter.using}.${convertGranularityToId(
            (filter.granularity as Required<DateDataset>["granularities"][number]) ?? "YEAR",
        )}`,
        { forceType: "label" },
    );

    switch (filter.empty_values) {
        case "exclude": {
            return {
                filters: [
                    {
                        negativeAttributeFilter: {
                            displayForm: identifier,
                            notIn: {
                                values: [""],
                            },
                        },
                    },
                ],
            };
        }
        case "only": {
            return {
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: identifier,
                            in: {
                                values: [""],
                            },
                        },
                    },
                ],
            };
        }
    }

    return { filters: [] };
}

function dateFilterWithFieldToDeclarative(
    entities: ExportEntities,
    filter: DateFilter,
): YamlFilterToDeclarativeResult {
    if (!filter.with) {
        return { filters: [] };
    }

    return mergeDeclarativeResults(
        ...Object.entries(filter.with).map(([key, withFilter]) =>
            yamlFilterToDeclarative(entities, key, withFilter),
        ),
    );
}

function yamlRelativeDateFilterToDeclarative(
    entities: ExportEntities,
    filter: DateFilter,
): YamlFilterToDeclarativeResult {
    const identifier = createIdentifier<any>(filter.using, { forceType: "dataset" });
    if (!identifier) {
        throw new Error(`Could not find dataset ${filter.using} to use in relative date filter`);
    }

    let result: YamlFilterToDeclarativeResult = { filters: [], attributeFilterConfig: {} };

    if (!!filter.granularity && typeof filter.from === "number" && typeof filter.to === "number") {
        result = mergeDeclarativeResults(result, {
            filters: [
                {
                    relativeDateFilter: {
                        dataSet: identifier,
                        granularity: convertGranularity(filter.granularity)!,
                        from: filter.from,
                        to: filter.to,
                    },
                },
            ],
        });
    } else {
        result = mergeDeclarativeResults(result, {
            filters: [
                {
                    relativeDateFilter: {
                        dataSet: identifier,
                        // This is not compliant with the types from gdc-model, but this is what AD emits for an all time filter.
                        // AD actually cannot understand an ALL_TIME_GRANULARITY granularity.
                        granularity: convertGranularity("YEAR")!,
                    } as unknown as IRelativeDateFilterAllTimeBody,
                },
            ],
        });
    }

    result = mergeDeclarativeResults(result, dateFilterEmptyValuesToDeclarative(filter));
    result = mergeDeclarativeResults(result, dateFilterWithFieldToDeclarative(entities, filter));

    return result;
}

function yamlPositiveAttributeFilterToDeclarative(
    entities: ExportEntities,
    key: string,
    filter: AttributeFilter,
): YamlFilterToDeclarativeResult {
    return {
        filters: [
            {
                positiveAttributeFilter: {
                    displayForm: createIdentifier<any>(filter.using),
                    in: {
                        values: parseDateValues(entities, filter.using, filter.state?.include ?? []),
                    },
                },
            },
        ],
        ...(filter.display_as
            ? {
                  attributeFilterConfig: {
                      [key]: {
                          displayAsLabel: createIdentifier<any>(filter.display_as, {
                              forceType: "label",
                          }),
                      },
                  },
              }
            : {}),
    };
}

function yamlNegativeAttributeFilterToDeclarative(
    entities: ExportEntities,
    key: string,
    filter: AttributeFilter,
): YamlFilterToDeclarativeResult {
    return {
        filters: [
            {
                negativeAttributeFilter: {
                    displayForm: createIdentifier<any>(filter.using),
                    notIn: {
                        values: parseDateValues(entities, filter.using, filter.state?.exclude ?? []),
                    },
                },
            },
        ],
        ...(filter.display_as
            ? {
                  attributeFilterConfig: {
                      [key]: {
                          displayAsLabel: createIdentifier<any>(filter.display_as, {
                              forceType: "label",
                          }),
                      },
                  },
              }
            : {}),
    };
}

function yamlMetricValueFilterWithConditionsToDeclarative(
    filter: MultipleConditions,
): YamlFilterToDeclarativeResult {
    // TypeScript narrows to MultipleConditions via type guard
    const measureValueFilter = createBaseMeasureValueFilter(filter);
    const sdkConditions = convertYamlConditionsToSdk(filter.conditions, filter.null_values_as_zero);

    if (sdkConditions.length === 0) {
        return { filters: [] };
    }

    if (sdkConditions.length === 1) {
        measureValueFilter.condition = sdkConditions[0];
    } else if (sdkConditions.length > 1) {
        measureValueFilter.conditions = sdkConditions;
    }

    return { filters: [{ measureValueFilter }] };
}

function yamlMetricRangeValueFilterToDeclarative(filter: Range): YamlFilterToDeclarativeResult {
    const measureValueFilter = createBaseMeasureValueFilter(filter);
    measureValueFilter.condition = {
        range: {
            operator: filter.condition,
            from: filter.from,
            to: filter.to,
            treatNullValuesAs: filter.null_values_as_zero ? 0 : undefined,
        },
    };

    return { filters: [{ measureValueFilter }] };
}

function yamlMetricComparisonValueFilterToDeclarative(filter: Comparison): YamlFilterToDeclarativeResult {
    const measureValueFilter = createBaseMeasureValueFilter(filter);
    measureValueFilter.condition = {
        comparison: {
            operator: filter.condition,
            value: filter.value,
            treatNullValuesAs: filter.null_values_as_zero ? 0 : undefined,
        },
    };

    return { filters: [{ measureValueFilter }] };
}

function yamlMetricAllValueFilterToDeclarative(filter: All): YamlFilterToDeclarativeResult {
    const measureValueFilter = createBaseMeasureValueFilter(filter);

    return { filters: [{ measureValueFilter }] };
}

function yamlRankingFilterToDeclarative(filter: RankingFilter): YamlFilterToDeclarativeResult {
    return {
        filters: [
            {
                rankingFilter: {
                    // Ranking filter can reference a metric by ref (e.g. "metric/amount"), preserve "metric" type.
                    measure:
                        createIdentifier(filter.using, { forceMetric: true }) ||
                        createLocalIdentifier(filter.using),
                    ...(filter.attribute
                        ? {
                              attributes: [
                                  createIdentifier(filter.attribute) ||
                                      createLocalIdentifier(filter.attribute),
                              ],
                          }
                        : {}),
                    operator: filter.top === undefined ? "BOTTOM" : "TOP",
                    value: filter.top === undefined ? filter.bottom! : filter.top,
                },
            },
        ],
    };
}

function yamlFilterToDeclarative(
    entities: ExportEntities,
    key: string,
    filter: QueryFilters[string],
): YamlFilterToDeclarativeResult {
    if (isAbsoluteDateFilter(filter)) {
        return yamlAbsoluteDateFilterToDeclarative(entities, filter);
    }
    if (isRelativeDateFilter(filter)) {
        return yamlRelativeDateFilterToDeclarative(entities, filter);
    }
    if (isPositiveAttributeFilter(filter)) {
        return yamlPositiveAttributeFilterToDeclarative(entities, key, filter);
    }
    if (isNegativeAttributeFilter(filter)) {
        return yamlNegativeAttributeFilterToDeclarative(entities, key, filter);
    }
    if (isMetricValueFilterWithConditions(filter)) {
        return yamlMetricValueFilterWithConditionsToDeclarative(filter);
    }
    if (isMetricRangeValueFilter(filter)) {
        return yamlMetricRangeValueFilterToDeclarative(filter);
    }
    if (isMetricComparisonValueFilter(filter)) {
        return yamlMetricComparisonValueFilterToDeclarative(filter);
    }
    if (isMetricAllValueFilter(filter)) {
        return yamlMetricAllValueFilterToDeclarative(filter);
    }
    if (isRankingFilter(filter)) {
        return yamlRankingFilterToDeclarative(filter);
    }

    assertUnreachable(filter as never);
}

function mergeDeclarativeResults(...results: YamlFilterToDeclarativeResult[]): YamlFilterToDeclarativeResult {
    return {
        filters: results.flatMap((result) => result.filters),
        attributeFilterConfig: Object.assign(
            {},
            ...results.map((result) => result.attributeFilterConfig ?? {}),
        ),
    };
}

export function yamlFiltersToDeclarative(
    entities: ExportEntities,
    filters_by: QueryFilters | Filter[] | undefined,
    attributeFilterConfigs: IAttributeFilterConfigs = {},
): {
    filters: IFilter[];
    attributeFilterConfigs: IAttributeFilterConfigs | undefined;
} {
    const isArray = Array.isArray(filters_by);
    const { filters, attributeFilterConfig } = mergeDeclarativeResults(
        { filters: [], attributeFilterConfig: attributeFilterConfigs },
        ...(filters_by && !isArray
            ? Object.entries(filters_by).map(([key, filter]) =>
                  yamlFilterToDeclarative(entities, key, filter),
              )
            : []),
        ...(filters_by && isArray
            ? filters_by.map((filter, i) => yamlFilterToDeclarative(entities, i.toString(), filter))
            : []),
    );

    return {
        filters,
        attributeFilterConfigs:
            Object.keys(attributeFilterConfig ?? {}).length > 0 ? attributeFilterConfig : undefined,
    };
}

//TOTALS

export function yamlReportTotalToDeclarative(totals: Total[] = [], attributeIdentifier: string): ITotal[] {
    return totals.map((total) => {
        return {
            alias: total.title,
            type: (total.type ?? "sum").toLowerCase() as TotalType,
            measureIdentifier: total.using,
            attributeIdentifier,
        } as ITotal;
    });
}

//BUCKETS

export function yamlBucketsToDeclarative(
    entities: ExportEntities,
    input: Visualisation,
): {
    buckets: VisualisationDefinition["buckets"];
    positions: Array<{ longitude: string; latitude: string }>;
    attrFilterConfig: IAttributeFilterConfigs;
} {
    const visBuckets = mapBuckets(input);
    const query = input.query;

    const positions: Array<{ longitude: string; latitude: string }> = [];
    let attrFilterConfig: IAttributeFilterConfigs = {};

    const buckets = visBuckets
        .map((bucket) => {
            const { localIdentifier } = bucket;
            const totals: ITotal[] = [];

            //do not include empty buckets
            if (bucket.items.length === 0) {
                return null;
            }

            const items = bucket.items
                .map((item) => {
                    const { bucketItem, bucketTotals, longitude, latitude, filterConfig } =
                        yamlBucketItemToDeclarative(
                            entities,
                            query,
                            item,
                            query.fields || {},
                            localIdentifier,
                        );

                    attrFilterConfig = {
                        ...attrFilterConfig,
                        ...filterConfig,
                    };

                    totals.push(...bucketTotals);

                    if (latitude && longitude) {
                        positions.push({ latitude, longitude });
                    }
                    return bucketItem;
                })
                .filter(Boolean);

            return {
                localIdentifier,
                items,
                ...(totals.length ? { totals } : {}),
            } as VisualisationDefinition["buckets"][number];
        })
        .filter(Boolean) as VisualisationDefinition["buckets"];

    return {
        buckets,
        positions,
        attrFilterConfig,
    };
}

function mapBuckets(input: Visualisation): VisBucket[] {
    const buckets: VisBucket[] = [];

    switch (input.type) {
        case "table": {
            addBucket(buckets, BucketsType.Measures, input.metrics);
            addBucket(buckets, BucketsType.Attribute, input.view_by, input.rows);
            addBucket(buckets, BucketsType.Columns, input.segment_by, input.columns);
            return buckets;
        }
        case "bar_chart":
        case "column_chart":
        case "area_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics);
            addBucket(buckets, BucketsType.View, input.view_by);
            addBucket(buckets, BucketsType.Stack, input.segment_by, input.stack_by);
            return buckets;
        }
        case "line_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics);
            addBucket(buckets, BucketsType.Trend, input.view_by, input.trend_by);
            addBucket(buckets, BucketsType.Segment, input.segment_by);
            return buckets;
        }
        case "scatter_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics?.[0] ? [input.metrics[0]] : []);
            addBucket(buckets, BucketsType.SecondaryMeasures, input.metrics?.[1] ? [input.metrics[1]] : []);
            addBucket(buckets, BucketsType.Attribute, input.view_by, input.attributes);
            addBucket(buckets, BucketsType.Segment, input.segment_by);
            return buckets;
        }
        case "bubble_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics?.[0] ? [input.metrics[0]] : []);
            addBucket(buckets, BucketsType.SecondaryMeasures, input.metrics?.[1] ? [input.metrics[1]] : []);
            addBucket(buckets, BucketsType.TertiaryMeasures, input.segment_by, input.size_by);
            addBucket(buckets, BucketsType.View, input.view_by);
            return buckets;
        }
        case "pie_chart":
        case "donut_chart":
        case "pyramid_chart":
        case "funnel_chart":
        case "waterfall_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics);
            addBucket(buckets, BucketsType.View, input.view_by);
            return buckets;
        }
        case "treemap_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics);
            addBucket(buckets, BucketsType.View, input.view_by);
            addBucket(buckets, BucketsType.Segment, input.segment_by);
            return buckets;
        }
        case "heatmap_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics);
            addBucket(buckets, BucketsType.View, input.view_by, input.rows);
            addBucket(buckets, BucketsType.Stack, input.segment_by, input.columns);
            return buckets;
        }
        case "bullet_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics?.[0] ? [input.metrics[0]] : []);
            addBucket(buckets, BucketsType.SecondaryMeasures, input.metrics?.[1] ? [input.metrics[1]] : []);
            addBucket(buckets, BucketsType.TertiaryMeasures, input.metrics?.[2] ? [input.metrics[2]] : []);
            addBucket(buckets, BucketsType.View, input.view_by);
            return buckets;
        }
        case "headline_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics?.[0] ? [input.metrics[0]] : []);
            addBucket(buckets, BucketsType.SecondaryMeasures, input.metrics?.slice(1) || []);
            return buckets;
        }
        case "dependency_wheel_chart":
        case "sankey_chart": {
            addBucket(buckets, BucketsType.Measures, input.metrics);
            addBucket(
                buckets,
                BucketsType.AttributeFrom,
                input.view_by?.[0] ? [input.view_by[0]] : [],
                input.from ? [input.from] : [],
            );
            addBucket(
                buckets,
                BucketsType.AttributeTo,
                input.view_by?.[1] ? [input.view_by[1]] : [],
                input.to ? [input.to] : [],
            );
            return buckets;
        }
        case "combo_chart": {
            addBucket(
                buckets,
                BucketsType.Measures,
                input.metrics?.filter((b) => {
                    const bucket = getFullBucket(b);
                    return !bucket.axis || bucket.axis === "primary";
                }),
            );
            addBucket(
                buckets,
                BucketsType.SecondaryMeasures,
                input.metrics?.filter((b) => {
                    const bucket = getFullBucket(b);
                    return bucket.axis === "secondary";
                }),
            );
            addBucket(buckets, BucketsType.View, input.view_by);
            return buckets;
        }
        case "geo_chart": {
            return createPushpinBuckets({
                viewBy: input.view_by,
                metrics: input.metrics,
                segmentBy: input.segment_by,
            });
        }
        case "geo_area_chart": {
            return createGeoAreaBuckets({
                viewBy: input.view_by,
                metrics: input.metrics,
                segmentBy: input.segment_by,
            });
        }
        case "repeater_chart": {
            addBucket(buckets, BucketsType.Attribute, input.segment_by, input.rows);
            addBucket(buckets, BucketsType.Columns, input.metrics, input.columns);
            addBucket(buckets, BucketsType.View, input.view_by);
            return buckets;
        }
    }
}

function addBucket(
    buckets: VisBucket[],
    localIdentifier: BucketsType,
    ...itms: Array<Bucket[] | undefined | null>
) {
    const items = itms.reduce((acc: Bucket[], itm) => [...acc, ...(itm || [])], []) as Bucket[];

    buckets.push({
        localIdentifier,
        items,
    });
}

type GeoBucketsInput = {
    viewBy?: Bucket[];
    metrics?: (Bucket | EmptyBucket)[];
    segmentBy?: Bucket[];
};

function createPushpinBuckets({ viewBy, metrics, segmentBy }: GeoBucketsInput): VisBucket[] {
    const buckets: VisBucket[] = [];
    addBucket(buckets, BucketsType.Location, viewBy?.[0] ? [viewBy[0]] : []);
    addBucket(buckets, BucketsType.Size, metrics?.[0] ? [metrics[0]] : []);
    addBucket(buckets, BucketsType.Color, metrics?.[1] ? [metrics[1]] : []);
    addBucket(buckets, BucketsType.Segment, segmentBy?.[0] ? [segmentBy[0]] : []);
    return buckets;
}

function createGeoAreaBuckets({ viewBy, metrics, segmentBy }: GeoBucketsInput): VisBucket[] {
    const buckets: VisBucket[] = [];
    addBucket(buckets, BucketsType.Area, viewBy?.[0] ? [viewBy[0]] : []);
    addBucket(buckets, BucketsType.Color, metrics?.[0] ? [metrics[0]] : []);
    addBucket(buckets, BucketsType.Segment, segmentBy?.[0] ? [segmentBy[0]] : []);
    return buckets;
}

function yamlLayersToDeclarative(
    entities: ExportEntities,
    input: Visualisation,
    _positions: Array<{ longitude: string; latitude: string }>,
): IInsightLayerDefinition[] {
    if (!("layers" in input) || !Array.isArray(input.layers) || input.layers.length === 0) {
        return [];
    }

    return (input.layers as YamlVisualizationLayer[]).map((layer) => {
        if (layer.type !== "pushpin" && layer.type !== "area") {
            throw newError(CoreErrorCode.LayerTypeNotSupported, [layer.type ?? "<missing>"]);
        }
        const layerVisualizationType = layer.type === "pushpin" ? "geo_chart" : "geo_area_chart";
        const baseQuery: Query | undefined = layer.query;
        const resolvedQuery: Query = {
            ...input.query,
            ...baseQuery,
            fields: {
                ...(input.query?.fields ?? {}),
                ...(baseQuery?.fields ?? {}),
            },
        };

        const positions: Array<{ longitude: string; latitude: string }> = [];
        let attrFilterConfig: IAttributeFilterConfigs = {};

        const visBuckets =
            layer.type === "pushpin"
                ? createPushpinBuckets({
                      viewBy: layer.view_by,
                      metrics: layer.metrics,
                      segmentBy: layer.segment_by,
                  })
                : createGeoAreaBuckets({
                      viewBy: layer.view_by,
                      metrics: layer.metrics,
                      segmentBy: layer.segment_by,
                  });
        const buckets = visBuckets
            .map((bucket) => {
                const { localIdentifier } = bucket;
                const totals: ITotal[] = [];

                //do not include empty buckets
                if (bucket.items.length === 0) {
                    return null;
                }

                const items = bucket.items
                    .map((item) => {
                        const { bucketItem, bucketTotals, longitude, latitude, filterConfig } =
                            yamlBucketItemToDeclarative(
                                entities,
                                resolvedQuery,
                                item,
                                resolvedQuery.fields || {},
                                localIdentifier,
                            );

                        if (longitude && latitude) {
                            positions.push({ longitude, latitude });
                        }

                        if (filterConfig) {
                            attrFilterConfig = { ...attrFilterConfig, ...filterConfig };
                        }

                        bucketTotals.forEach((total) => totals.push(total));

                        return bucketItem;
                    })
                    .filter(Boolean);

                return {
                    localIdentifier,
                    items,
                    totals,
                };
            })
            .filter(Boolean) as IBucket[];

        const { filters: layerFilters, attributeFilterConfigs } = yamlFiltersToDeclarative(
            entities,
            baseQuery?.filter_by,
            attrFilterConfig,
        );

        const layerProperties =
            layer.config || (layer.type === "pushpin" && positions.length > 0)
                ? yamlConfigToDeclarative(
                      {
                          ...input,
                          type: layerVisualizationType,
                          query: resolvedQuery,
                          metrics: layer.metrics,
                          view_by: layer.view_by,
                          segment_by: layer.segment_by,
                          config: layer.config,
                      } as Visualisation,
                      positions,
                  )
                : undefined;

        return {
            id: layer.id,
            name: layer.title,
            type: layer.type,
            buckets,
            filters: layerFilters,
            ...(attributeFilterConfigs ? { attributeFilterConfigs } : {}),
            sorts: yamlSortsToDeclarative(
                baseQuery?.sort_by,
                baseQuery?.fields ?? resolvedQuery.fields ?? {},
            ),
            properties:
                layerProperties && Object.keys(layerProperties).length > 0 ? layerProperties : undefined,
        };
    });
}
