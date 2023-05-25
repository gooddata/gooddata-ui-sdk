// (C) 2007-2022 GoodData Corporation
import SparkMD5 from "spark-md5";
import { invariant } from "ts-invariant";
import cloneDeep from "lodash/cloneDeep.js";
import compact from "lodash/compact.js";
import filter from "lodash/filter.js";
import first from "lodash/first.js";
import find from "lodash/find.js";
import map from "lodash/map.js";
import merge from "lodash/merge.js";
import every from "lodash/every.js";
import isEmpty from "lodash/isEmpty.js";
import negate from "lodash/negate.js";
import partial from "lodash/partial.js";
import flatten from "lodash/flatten.js";
import set from "lodash/set.js";
import { getAttributesDisplayForms, GdcVisualizationObject, GdcCatalog } from "@gooddata/api-model-bear";

import { Rules } from "../utils/rules.js";
import { sortDefinitions } from "../utils/definitions.js";
import { getMissingUrisInAttributesMap } from "../utils/attributesMapLoader.js";
import { XhrModule } from "../xhr.js";
import isAttribute = GdcVisualizationObject.isAttribute;
import isMeasure = GdcVisualizationObject.isMeasure;

const notEmpty = negate<Array<string | null>>(isEmpty);

function findHeaderForMappingFn(mapping: any, header: any) {
    return (
        (mapping.element === header.id || mapping.element === header.uri) && header.measureIndex === undefined
    );
}

function wrapMeasureIndexesFromMappings(metricMappings: any[], headers: any[]) {
    if (metricMappings) {
        metricMappings.forEach((mapping) => {
            const header = find(headers, partial(findHeaderForMappingFn, mapping));
            if (header) {
                header.measureIndex = mapping.measureIndex;
                header.isPoP = mapping.isPoP;
            }
        });
    }
    return headers;
}

const emptyResult = {
    extendedTabularDataResult: {
        values: [],
        warnings: [],
    },
};

const MAX_TITLE_LENGTH = 1000;

function getMetricTitle(suffix: string, title: string) {
    const maxLength = MAX_TITLE_LENGTH - suffix.length;
    if (title && title.length > maxLength) {
        if (title[title.length - 1] === ")") {
            return `${title.substring(0, maxLength - 2)}…)${suffix}`;
        }
        return `${title.substring(0, maxLength - 1)}…${suffix}`;
    }
    return `${title}${suffix}`;
}

const getBaseMetricTitle = partial(getMetricTitle, "");

const CONTRIBUTION_METRIC_FORMAT = "#,##0.00%";

function getPoPDefinition(measure: any) {
    return measure?.definition?.popMeasureDefinition ?? {};
}

function getAggregation(measure: any) {
    return (getDefinition(measure)?.aggregation ?? "").toLowerCase();
}

function isEmptyFilter(metricFilter: any) {
    if (metricFilter?.positiveAttributeFilter) {
        return isEmpty(metricFilter.positiveAttributeFilter?.in);
    }
    if (metricFilter?.negativeAttributeFilter) {
        return isEmpty(metricFilter.negativeAttributeFilter?.notIn);
    }
    if (metricFilter?.absoluteDateFilter) {
        return (
            metricFilter?.absoluteDateFilter?.from === undefined &&
            metricFilter?.absoluteDateFilter?.to === undefined
        );
    }
    return (
        metricFilter?.relativeDateFilter?.from === undefined &&
        metricFilter?.relativeDateFilter?.to === undefined
    );
}

function allFiltersEmpty(item: any) {
    return every(map(getMeasureFilters(item), (f) => isEmptyFilter(f)));
}

function isDerived(measure: any) {
    const aggregation = getAggregation(measure);
    return aggregation !== "" || !allFiltersEmpty(measure);
}

function getAttrTypeFromMap(dfUri: string, attributesMap: any) {
    return attributesMap?.[dfUri]?.attribute?.content?.type;
}

function getAttrUriFromMap(dfUri: string, attributesMap: any) {
    return attributesMap?.[dfUri]?.attribute?.meta?.uri;
}

function isAttrFilterNegative(attributeFilter: any) {
    return attributeFilter?.negativeAttributeFilter !== undefined;
}

function getAttrFilterElements(attributeFilter: any) {
    const isNegative = isAttrFilterNegative(attributeFilter);
    const elements = isNegative
        ? attributeFilter?.negativeAttributeFilter?.notIn
        : attributeFilter?.positiveAttributeFilter?.in;
    return elements ?? [];
}

function getAttrFilterExpression(measureFilter: any, attributesMap: any) {
    const isNegative = !!measureFilter?.negativeAttributeFilter;
    const detailPath = isNegative ? "negativeAttributeFilter" : "positiveAttributeFilter";
    const attributeUri = getAttrUriFromMap(measureFilter?.[detailPath]?.displayForm?.uri, attributesMap);
    const elements = getAttrFilterElements(measureFilter);
    if (isEmpty(elements)) {
        return null;
    }
    const elementsForQuery = map(elements, (e) => `[${e}]`);
    const negative = isNegative ? "NOT " : "";

    return `[${attributeUri}] ${negative}IN (${elementsForQuery.join(",")})`;
}

function getDateFilterExpression() {
    // measure date filter was never supported
    return "";
}

function getFilterExpression(attributesMap: any, measureFilter: any) {
    if (GdcVisualizationObject.isAttributeFilter(measureFilter)) {
        return getAttrFilterExpression(measureFilter, attributesMap);
    }
    return getDateFilterExpression();
}

function getGeneratedMetricExpression(item: any, attributesMap: any) {
    const aggregation = getAggregation(item).toUpperCase();
    const objectUri = getDefinition(item)?.item?.uri;
    const where = filter(
        map(getMeasureFilters(item), partial(getFilterExpression, attributesMap)),
        (e) => !!e,
    );

    return [
        "SELECT",
        aggregation ? `${aggregation}([${objectUri}])` : `[${objectUri}]`,
        notEmpty(...where) && `WHERE ${where.join(" AND ")}`,
    ]
        .filter(Boolean)
        .join(" ");
}

function getPercentMetricExpression(category: any, attributesMap: any, measure: any) {
    let metricExpressionWithoutFilters = `SELECT [${getDefinition(measure)?.item?.uri}]`;

    if (isDerived(measure)) {
        metricExpressionWithoutFilters = getGeneratedMetricExpression(
            set(cloneDeep(measure), ["definition", "measureDefinition", "filters"], []),
            attributesMap,
        );
    }

    const attributeUri = getAttrUriFromMap(category?.displayForm?.uri, attributesMap);
    const whereFilters = filter(
        map(getMeasureFilters(measure), partial(getFilterExpression, attributesMap)),
        (e) => !!e,
    );
    const byAllExpression = attributeUri ? ` BY ALL [${attributeUri}]` : "";
    const whereExpression = notEmpty(...whereFilters) ? ` WHERE ${whereFilters.join(" AND ")}` : "";

    return `SELECT (${metricExpressionWithoutFilters}${whereExpression}) / (${metricExpressionWithoutFilters}${byAllExpression}${whereExpression})`;
}

function getPoPExpression(attributeUri: string, metricExpression: string) {
    return `SELECT ${metricExpression} FOR PREVIOUS ([${attributeUri}])`;
}

function getGeneratedMetricHash(title: string, format: string, expression: string) {
    return SparkMD5.hash(`${expression}#${title}#${format}`);
}

function getMeasureType(measure: any) {
    const aggregation = getAggregation(measure);
    if (aggregation === "") {
        return "metric";
    } else if (aggregation === "count") {
        return "attribute";
    }
    return "fact";
}

function getGeneratedMetricIdentifier(
    item: any,
    aggregation: string,
    expressionCreator: (item: any, attributesMap: any) => string,
    hasher: any,
    attributesMap: any,
) {
    const [, , , prjId, , id] = (getDefinition(item)?.item?.uri ?? "").split("/");
    const identifier = `${prjId}_${id}`;
    const hash = hasher(expressionCreator(item, attributesMap));
    const hasNoFilters = isEmpty(getMeasureFilters(item));
    const type = getMeasureType(item);

    const prefix = hasNoFilters || allFiltersEmpty(item) ? "" : "_filtered";

    return `${type}_${identifier}.generated.${hash}${prefix}_${aggregation}`;
}

function isDateAttribute(attribute: any, attributesMap = {}) {
    return getAttrTypeFromMap(attribute?.displayForm?.uri, attributesMap) !== undefined;
}

function getMeasureSorting(measure?: any, mdObj?: any) {
    const sorting = mdObj?.properties?.sortItems ?? [];
    const matchedSorting = sorting.find((sortItem: any) => {
        const measureSortItem = sortItem?.measureSortItem;
        if (measureSortItem) {
            // only one item now, we support only 2D data
            const identifier = measureSortItem.locators?.[0]?.measureLocatorItem?.measureIdentifier;
            return identifier === measure?.localIdentifier;
        }
        return false;
    });
    return matchedSorting?.measureSortItem?.direction ?? null;
}

function getCategorySorting(category: any, mdObj: any) {
    const sorting = mdObj?.properties?.sortItems ?? [];
    const matchedSorting = sorting.find((sortItem: any) => {
        const attributeSortItem = sortItem?.attributeSortItem;
        if (attributeSortItem) {
            const identifier = attributeSortItem?.attributeIdentifier;
            return identifier === category?.localIdentifier;
        }
        return false;
    });
    return matchedSorting?.attributeSortItem?.direction ?? null;
}

const createPureMetric = (measure: any, mdObj: any, measureIndex: number) => ({
    element: measure?.definition?.measureDefinition?.item?.uri,
    sort: getMeasureSorting(measure, mdObj),
    meta: { measureIndex },
});

function createDerivedMetric(measure: any, mdObj: any, measureIndex: number, attributesMap: any) {
    const { format } = measure;
    const sort = getMeasureSorting(measure, mdObj);
    const title = getBaseMetricTitle(measure.title);

    const hasher = partial(getGeneratedMetricHash, title, format);
    const aggregation = getAggregation(measure);
    const element = getGeneratedMetricIdentifier(
        measure,
        aggregation.length ? aggregation : "base",
        getGeneratedMetricExpression,
        hasher,
        attributesMap,
    );
    const definition = {
        metricDefinition: {
            identifier: element,
            expression: getGeneratedMetricExpression(measure, attributesMap),
            title,
            format,
        },
    };

    return {
        element,
        definition,
        sort,
        meta: {
            measureIndex,
        },
    };
}

function createContributionMetric(measure: any, mdObj: any, measureIndex: number, attributesMap: any) {
    const attribute = first(getAttributes(mdObj));
    const getMetricExpression = partial(getPercentMetricExpression, attribute, attributesMap);
    const title = getBaseMetricTitle(measure?.title);
    const hasher = partial(getGeneratedMetricHash, title, CONTRIBUTION_METRIC_FORMAT);
    const identifier = getGeneratedMetricIdentifier(
        measure,
        "percent",
        getMetricExpression,
        hasher,
        attributesMap,
    );
    return {
        element: identifier,
        definition: {
            metricDefinition: {
                identifier,
                expression: getMetricExpression(measure),
                title,
                format: CONTRIBUTION_METRIC_FORMAT,
            },
        },
        sort: getMeasureSorting(measure, mdObj),
        meta: {
            measureIndex,
        },
    };
}

function getOriginalMeasureForPoP(popMeasure: any, mdObj: any) {
    return getMeasures(mdObj).find(
        (measure: any) => measure?.localIdentifier === getPoPDefinition(popMeasure)?.measureIdentifier,
    );
}

function createPoPMetric(popMeasure: any, mdObj: any, measureIndex: number, attributesMap: any) {
    const title = getBaseMetricTitle(popMeasure?.title);
    const format = popMeasure?.format;
    const hasher = partial(getGeneratedMetricHash, title, format);

    const attributeUri = popMeasure?.definition?.popMeasureDefinition?.popAttribute?.uri;
    const originalMeasure = getOriginalMeasureForPoP(popMeasure, mdObj);

    const originalMeasureExpression = `[${getDefinition(originalMeasure)?.item?.uri}]`;
    let metricExpression = getPoPExpression(attributeUri, originalMeasureExpression);

    if (isDerived(originalMeasure)) {
        const generated = createDerivedMetric(originalMeasure, mdObj, measureIndex, attributesMap);
        const generatedMeasureExpression = `(${generated.definition.metricDefinition.expression})`;
        metricExpression = getPoPExpression(attributeUri, generatedMeasureExpression);
    }

    const identifier = getGeneratedMetricIdentifier(
        originalMeasure,
        "pop",
        () => metricExpression,
        hasher,
        attributesMap,
    );

    return {
        element: identifier,
        definition: {
            metricDefinition: {
                identifier,
                expression: metricExpression,
                title,
                format,
            },
        },
        sort: getMeasureSorting(popMeasure, mdObj),
        meta: {
            measureIndex,
            isPoP: true,
        },
    };
}

function createContributionPoPMetric(popMeasure: any, mdObj: any, measureIndex: number, attributesMap: any) {
    const attributeUri = popMeasure?.definition?.popMeasureDefinition?.popAttribute?.uri;

    const originalMeasure = getOriginalMeasureForPoP(popMeasure, mdObj);

    const generated = createContributionMetric(originalMeasure, mdObj, measureIndex, attributesMap);
    const title = getBaseMetricTitle(popMeasure?.title);

    const format = CONTRIBUTION_METRIC_FORMAT;
    const hasher = partial(getGeneratedMetricHash, title, format);

    const generatedMeasureExpression = `(${generated.definition.metricDefinition.expression})`;
    const metricExpression = getPoPExpression(attributeUri, generatedMeasureExpression);

    const identifier = getGeneratedMetricIdentifier(
        originalMeasure,
        "pop",
        () => metricExpression,
        hasher,
        attributesMap,
    );

    return {
        element: identifier,
        definition: {
            metricDefinition: {
                identifier,
                expression: metricExpression,
                title,
                format,
            },
        },
        sort: getMeasureSorting(),
        meta: {
            measureIndex,
            isPoP: true,
        },
    };
}

function categoryToElement(attributesMap: any, mdObj: any, category: any) {
    const element = getAttrUriFromMap(category?.displayForm?.uri, attributesMap);
    return {
        element,
        sort: getCategorySorting(category, mdObj),
    };
}

function isPoP({ definition }: any) {
    return definition?.popMeasureDefinition !== undefined;
}
function isContribution({ definition }: any) {
    return definition?.measureDefinition?.computeRatio;
}
function isPoPContribution(popMeasure: any, mdObj: any) {
    if (isPoP(popMeasure)) {
        const originalMeasure = getOriginalMeasureForPoP(popMeasure, mdObj);
        return isContribution(originalMeasure);
    }
    return false;
}
function isCalculatedMeasure({ definition }: any) {
    return definition?.measureDefinition?.aggregation === undefined;
}

const rules = new Rules();

rules.addRule([isPoPContribution], createContributionPoPMetric);

rules.addRule([isPoP], createPoPMetric);

rules.addRule([isContribution], createContributionMetric);

rules.addRule([isDerived], createDerivedMetric);

rules.addRule([isCalculatedMeasure], createPureMetric);

function getMetricFactory(measure: any, mdObj: any) {
    const factory = rules.match(measure, mdObj);

    invariant(factory, `Unknown metric factory for: ${measure}`);

    return factory;
}

function getExecutionDefinitionsAndColumns(
    mdObj: GdcVisualizationObject.IVisualizationObjectContent,
    options: { removeDateItems?: boolean },
    attributesMap: any,
): GdcCatalog.IColumnsAndDefinitions {
    const measures = getMeasures(mdObj);
    let attributes = getAttributes(mdObj);

    const metrics = flatten(
        map(measures, (measure, index) =>
            getMetricFactory(measure, mdObj)(measure, mdObj, index, attributesMap),
        ),
    );
    if (options.removeDateItems) {
        attributes = filter(attributes, (attribute) => !isDateAttribute(attribute, attributesMap));
    }
    attributes = map(attributes, partial(categoryToElement, attributesMap, mdObj));

    const columns = compact(map([...attributes, ...metrics], "element"));
    return {
        columns,
        definitions: sortDefinitions(compact(map(metrics, "definition"))),
    };
}

function getBuckets(mdObj: any) {
    return mdObj?.buckets ?? [];
}

function getAttributesInBucket(bucket: any) {
    return bucket.items.reduce((list: any, bucketItem: any) => {
        if (isAttribute(bucketItem)) {
            list.push(bucketItem.visualizationAttribute);
        }
        return list;
    }, []);
}

function getAttributes(mdObject: any) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce((categoriesList: any, bucket: any) => {
        categoriesList.push(...getAttributesInBucket(bucket));
        return categoriesList;
    }, []);
}

function getDefinition(measure: any) {
    return measure?.definition?.measureDefinition ?? {};
}

function getMeasuresInBucket(bucket: any) {
    return bucket.items.reduce((list: any, bucketItem: any) => {
        if (isMeasure(bucketItem)) {
            list.push(bucketItem.measure);
        }
        return list;
    }, []);
}

function getMeasures(mdObject: any) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce((categoriesList: any, bucket: any) => {
        categoriesList.push(...getMeasuresInBucket(bucket));
        return categoriesList;
    }, []);
}

function getMeasureFilters(measure: any) {
    return getDefinition(measure)?.filters ?? [];
}

/**
 * Module for execution on experimental execution resource
 *
 * @deprecated The module is in maintenance mode only (just the the compilation issues are being fixed when
 *      referenced utilities and interfaces are being changed) and is not being extended when AFM executor
 *      have new functionality added.
 */
export class ExperimentalExecutionsModule {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(private xhr: XhrModule, private loadAttributesMap: any) {}

    /**
     * For the given projectId it returns table structure with the given
     * elements in column headers.
     *
     * @param projectId - GD project identifier
     * @param columns - An array of attribute or metric identifiers.
     * @param executionConfiguration - Execution configuration - can contain for example
     *                 property "where" containing query-like filters
     *                 property "orderBy" contains array of sorted properties to order in form
     *                      `[{column: 'identifier', direction: 'asc|desc'}]`
     * @param settings - Supports additional settings accepted by the underlying
     *                             xhr.ajax() calls
     *
     * @returns Structure with `headers` and `rawData` keys filled with values from execution.
     */
    public getData(
        projectId: string,
        columns: any[],
        executionConfiguration: any = {},
        settings: any = {},
    ): Promise<any> {
        if (process.env.NODE_ENV !== "test") {
            console.warn(
                "ExperimentalExecutionsModule is deprecated and is no longer being maintained. " +
                    "Please migrate to the ExecuteAfmModule.",
            );
        }

        const executedReport: any = {
            isLoaded: false,
        };

        // Create request and result structures
        const request: any = {
            execution: { columns },
        };
        // enrich configuration with supported properties such as
        // where clause with query-like filters
        ["where", "orderBy", "definitions"].forEach((property) => {
            if (executionConfiguration[property]) {
                request.execution[property] = executionConfiguration[property];
            }
        });

        // Execute request
        return this.xhr
            .post(`/gdc/internal/projects/${projectId}/experimental/executions`, {
                ...settings,
                body: JSON.stringify(request),
            })
            .then((r) => r.getData())
            .then((response) => {
                executedReport.headers = wrapMeasureIndexesFromMappings(
                    executionConfiguration?.metricMappings,
                    response?.executionResult?.headers ?? [],
                );

                // Start polling on url returned in the executionResult for tabularData
                return this.loadExtendedDataResults(
                    response.executionResult.extendedTabularDataResult,
                    settings,
                );
            })
            .then((r: any) => {
                const { result, status } = r;

                return {
                    ...executedReport,
                    rawData: result?.extendedTabularDataResult?.values ?? [],
                    warnings: result?.extendedTabularDataResult?.warnings ?? [],
                    isLoaded: true,
                    isEmpty: status === 204,
                };
            });
    }

    public mdToExecutionDefinitionsAndColumns(
        projectId: string,
        mdObj: GdcVisualizationObject.IVisualizationObjectContent,
        options: { attributesMap?: Record<string, unknown>; removeDateItems?: boolean } = {},
    ): Promise<GdcCatalog.IColumnsAndDefinitions> {
        const allDfUris = getAttributesDisplayForms(mdObj);
        const attributesMapPromise = this.getAttributesMap(options, allDfUris, projectId);

        return attributesMapPromise.then((attributesMap: any) => {
            return getExecutionDefinitionsAndColumns(mdObj, options, attributesMap);
        });
    }

    private getAttributesMap(
        options: { attributesMap?: Record<string, unknown> } = {},
        displayFormUris: string[],
        projectId: string,
    ) {
        const attributesMap = options.attributesMap ?? {};

        const missingUris = getMissingUrisInAttributesMap(displayFormUris, attributesMap);
        return this.loadAttributesMap(projectId, missingUris).then((result: any) => {
            return {
                ...attributesMap,
                ...result,
            };
        });
    }

    private loadExtendedDataResults(uri: string, settings: any, prevResult = emptyResult) {
        return new Promise((resolve, reject) => {
            this.xhr
                .ajax(uri, settings)
                .then((r) => {
                    const { response } = r;

                    if (response.status === 204) {
                        return {
                            status: response.status,
                            result: "",
                        };
                    }

                    return {
                        status: response.status,
                        result: r.getData(),
                    };
                })
                .then(({ status, result }) => {
                    const values = [
                        ...(prevResult?.extendedTabularDataResult?.values ?? []),
                        ...(result?.extendedTabularDataResult?.values ?? []),
                    ];

                    const warnings = [
                        ...(prevResult?.extendedTabularDataResult?.warnings ?? []),
                        ...(result?.extendedTabularDataResult?.warnings ?? []),
                    ];

                    const updatedResult = merge({}, prevResult, {
                        extendedTabularDataResult: {
                            values,
                            warnings,
                        },
                    });

                    const nextUri = result?.extendedTabularDataResult?.paging?.next;
                    if (nextUri) {
                        resolve(this.loadExtendedDataResults(nextUri, settings, updatedResult));
                    } else {
                        resolve({ status, result: updatedResult });
                    }
                }, reject);
        });
    }
}
