// (C) 2007-2020 GoodData Corporation
import md5 from "md5";
import invariant from "invariant";
import cloneDeep from "lodash/cloneDeep";
import compact from "lodash/compact";
import filter from "lodash/filter";
import first from "lodash/first";
import find from "lodash/find";
import map from "lodash/map";
import merge from "lodash/merge";
import every from "lodash/every";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import negate from "lodash/negate";
import partial from "lodash/partial";
import flatten from "lodash/flatten";
import set from "lodash/set";
import { getAttributesDisplayForms, GdcVisualizationObject, GdcCatalog } from "@gooddata/gd-bear-model";

import { Rules } from "../utils/rules";
import { sortDefinitions } from "../utils/definitions";
import { getMissingUrisInAttributesMap } from "../utils/attributesMapLoader";
import { IMeasure } from "../interfaces";
import { XhrModule } from "../xhr";
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

function getPoPDefinition(measure: IMeasure) {
    return get(measure, ["definition", "popMeasureDefinition"], {});
}

function getAggregation(measure: IMeasure) {
    return get(getDefinition(measure), "aggregation", "").toLowerCase();
}

function isEmptyFilter(metricFilter: any) {
    if (get(metricFilter, "positiveAttributeFilter")) {
        return isEmpty(get(metricFilter, ["positiveAttributeFilter", "in"]));
    }
    if (get(metricFilter, "negativeAttributeFilter")) {
        return isEmpty(get(metricFilter, ["negativeAttributeFilter", "notIn"]));
    }
    if (get(metricFilter, "absoluteDateFilter")) {
        return (
            get(metricFilter, ["absoluteDateFilter", "from"]) === undefined &&
            get(metricFilter, ["absoluteDateFilter", "to"]) === undefined
        );
    }
    return (
        get(metricFilter, ["relativeDateFilter", "from"]) === undefined &&
        get(metricFilter, ["relativeDateFilter", "to"]) === undefined
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
    return get(attributesMap, [dfUri, "attribute", "content", "type"]);
}

function getAttrUriFromMap(dfUri: string, attributesMap: any) {
    return get(attributesMap, [dfUri, "attribute", "meta", "uri"]);
}

function isAttrFilterNegative(attributeFilter: any) {
    return get(attributeFilter, "negativeAttributeFilter") !== undefined;
}

function getAttrFilterElements(attributeFilter: any) {
    const isNegative = isAttrFilterNegative(attributeFilter);
    const pathToElements = isNegative
        ? ["negativeAttributeFilter", "notIn"]
        : ["positiveAttributeFilter", "in"];
    return get(attributeFilter, pathToElements, []);
}

function getAttrFilterExpression(measureFilter: any, attributesMap: any) {
    const isNegative = get(measureFilter, "negativeAttributeFilter", false);
    const detailPath = isNegative ? "negativeAttributeFilter" : "positiveAttributeFilter";
    const attributeUri = getAttrUriFromMap(
        get(measureFilter, [detailPath, "displayForm", "uri"]),
        attributesMap,
    );
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
    const objectUri = get(getDefinition(item), "item.uri");
    const where = filter(
        map(getMeasureFilters(item), partial(getFilterExpression, attributesMap)),
        (e) => !!e,
    );

    return `SELECT ${aggregation ? `${aggregation}([${objectUri}])` : `[${objectUri}]`}${
        notEmpty(...where) ? ` WHERE ${where.join(" AND ")}` : ""
    }`;
}

function getPercentMetricExpression(category: any, attributesMap: any, measure: any) {
    let metricExpressionWithoutFilters = `SELECT [${get(getDefinition(measure), "item.uri")}]`;

    if (isDerived(measure)) {
        metricExpressionWithoutFilters = getGeneratedMetricExpression(
            set(cloneDeep(measure), ["definition", "measureDefinition", "filters"], []),
            attributesMap,
        );
    }

    const attributeUri = getAttrUriFromMap(get(category, "displayForm.uri"), attributesMap);
    const whereFilters = filter(
        map(getMeasureFilters(measure), partial(getFilterExpression, attributesMap)),
        (e) => !!e,
    );
    const whereExpression = notEmpty(...whereFilters) ? ` WHERE ${whereFilters.join(" AND ")}` : "";

    // tslint:disable-next-line:max-line-length
    return `SELECT (${metricExpressionWithoutFilters}${whereExpression}) / (${metricExpressionWithoutFilters} BY ALL [${attributeUri}]${whereExpression})`;
}

function getPoPExpression(attributeUri: string, metricExpression: string) {
    return `SELECT ${metricExpression} FOR PREVIOUS ([${attributeUri}])`;
}

function getGeneratedMetricHash(title: string, format: string, expression: string) {
    return md5(`${expression}#${title}#${format}`);
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
    const [, , , prjId, , id] = get(getDefinition(item), "item.uri", "").split("/");
    const identifier = `${prjId}_${id}`;
    const hash = hasher(expressionCreator(item, attributesMap));
    const hasNoFilters = isEmpty(getMeasureFilters(item));
    const type = getMeasureType(item);

    const prefix = hasNoFilters || allFiltersEmpty(item) ? "" : "_filtered";

    return `${type}_${identifier}.generated.${hash}${prefix}_${aggregation}`;
}

function isDateAttribute(attribute: any, attributesMap = {}) {
    return getAttrTypeFromMap(get(attribute, ["displayForm", "uri"]), attributesMap) !== undefined;
}

function getMeasureSorting(measure?: any, mdObj?: any) {
    const sorting = get(mdObj, ["properties", "sortItems"], []);
    const matchedSorting = sorting.find((sortItem: any) => {
        const measureSortItem = get(sortItem, ["measureSortItem"]);
        if (measureSortItem) {
            // only one item now, we support only 2d data
            const identifier = get(measureSortItem, [
                "locators",
                0,
                "measureLocatorItem",
                "measureIdentifier",
            ]);
            return identifier === get(measure, "localIdentifier");
        }
        return false;
    });
    if (matchedSorting) {
        return get(matchedSorting, ["measureSortItem", "direction"], null);
    }
    return null;
}

function getCategorySorting(category: any, mdObj: any) {
    const sorting = get(mdObj, ["properties", "sortItems"], []);
    const matchedSorting = sorting.find((sortItem: any) => {
        const attributeSortItem = get(sortItem, ["attributeSortItem"]);
        if (attributeSortItem) {
            const identifier = get(attributeSortItem, ["attributeIdentifier"]);
            return identifier === get(category, "localIdentifier");
        }
        return false;
    });
    if (matchedSorting) {
        return get(matchedSorting, ["attributeSortItem", "direction"], null);
    }
    return null;
}

const createPureMetric = (measure: any, mdObj: any, measureIndex: number) => ({
    element: get(measure, ["definition", "measureDefinition", "item", "uri"]),
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
    const title = getBaseMetricTitle(get(measure, "title"));
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
        (measure: any) =>
            get(measure, "localIdentifier") === get(getPoPDefinition(popMeasure), ["measureIdentifier"]),
    );
}

function createPoPMetric(popMeasure: any, mdObj: any, measureIndex: number, attributesMap: any) {
    const title = getBaseMetricTitle(get(popMeasure, "title"));
    const format = get(popMeasure, "format");
    const hasher = partial(getGeneratedMetricHash, title, format);

    const attributeUri = get(popMeasure, "definition.popMeasureDefinition.popAttribute.uri");
    const originalMeasure = getOriginalMeasureForPoP(popMeasure, mdObj);

    const originalMeasureExpression = `[${get(getDefinition(originalMeasure), ["item", "uri"])}]`;
    let metricExpression = getPoPExpression(attributeUri, originalMeasureExpression);

    if (isDerived(originalMeasure)) {
        const generated = createDerivedMetric(originalMeasure, mdObj, measureIndex, attributesMap);
        const generatedMeasureExpression = `(${get(generated, [
            "definition",
            "metricDefinition",
            "expression",
        ])})`;
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
    const attributeUri = get(popMeasure, ["definition", "popMeasureDefinition", "popAttribute", "uri"]);

    const originalMeasure = getOriginalMeasureForPoP(popMeasure, mdObj);

    const generated = createContributionMetric(originalMeasure, mdObj, measureIndex, attributesMap);
    const title = getBaseMetricTitle(get(popMeasure, "title"));

    const format = CONTRIBUTION_METRIC_FORMAT;
    const hasher = partial(getGeneratedMetricHash, title, format);

    const generatedMeasureExpression = `(${get(generated, [
        "definition",
        "metricDefinition",
        "expression",
    ])})`;
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
    const element = getAttrUriFromMap(get(category, ["displayForm", "uri"]), attributesMap);
    return {
        element,
        sort: getCategorySorting(category, mdObj),
    };
}

function isPoP({ definition }: any) {
    return get(definition, "popMeasureDefinition") !== undefined;
}
function isContribution({ definition }: any) {
    return get(definition, ["measureDefinition", "computeRatio"]);
}
function isPoPContribution(popMeasure: any, mdObj: any) {
    if (isPoP(popMeasure)) {
        const originalMeasure = getOriginalMeasureForPoP(popMeasure, mdObj);
        return isContribution(originalMeasure);
    }
    return false;
}
function isCalculatedMeasure({ definition }: any) {
    return get(definition, ["measureDefinition", "aggregation"]) === undefined;
}

const rules = new Rules();

rules.addRule([isPoPContribution], createContributionPoPMetric);

rules.addRule([isPoP], createPoPMetric);

rules.addRule([isContribution], createContributionMetric);

rules.addRule([isDerived], createDerivedMetric);

rules.addRule([isCalculatedMeasure], createPureMetric);

function getMetricFactory(measure: any, mdObj: any) {
    const factory = rules.match(measure, mdObj);

    invariant(factory, `Unknown factory for: ${measure}`);

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
    return get(mdObj, "buckets", []);
}

function getAttributesInBucket(bucket: any) {
    return get(bucket, "items").reduce((list: any, bucketItem: any) => {
        if (isAttribute(bucketItem)) {
            list.push(get(bucketItem, "visualizationAttribute"));
        }
        return list;
    }, []);
}

function getAttributes(mdObject: any) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce(
        (categoriesList: any, bucket: any) => categoriesList.concat(getAttributesInBucket(bucket)),
        [],
    );
}

function getDefinition(measure: any) {
    return get(measure, ["definition", "measureDefinition"], {});
}

function getMeasuresInBucket(bucket: any) {
    return get(bucket, "items").reduce((list: any, bucketItem: any) => {
        if (isMeasure(bucketItem)) {
            list.push(get(bucketItem, "measure"));
        }
        return list;
    }, []);
}

function getMeasures(mdObject: any) {
    const buckets = getBuckets(mdObject);
    return buckets.reduce(
        (measuresList: any, bucket: any) => measuresList.concat(getMeasuresInBucket(bucket)),
        [],
    );
}

function getMeasureFilters(measure: any) {
    return get(getDefinition(measure), "filters", []);
}

/**
 * Module for execution on experimental execution resource
 *
 * @class execution
 * @module execution
 * @deprecated The module is in maintenance mode only (just the the compilation issues are being fixed when
 *      referenced utilities and interfaces are being changed) and is not being extended when AFM executor
 *      have new functionality added.
 */
export class ExperimentalExecutionsModule {
    constructor(private xhr: XhrModule, private loadAttributesMap: any) {}

    /**
     * For the given projectId it returns table structure with the given
     * elements in column headers.
     *
     * @method getData
     * @param {String} projectId - GD project identifier
     * @param {Array} columns - An array of attribute or metric identifiers.
     * @param {Object} executionConfiguration - Execution configuration - can contain for example
     *                 property "where" containing query-like filters
     *                 property "orderBy" contains array of sorted properties to order in form
     *                      [{column: 'identifier', direction: 'asc|desc'}]
     * @param {Object} settings - Supports additional settings accepted by the underlying
     *                             xhr.ajax() calls
     *
     * @return {Object} Structure with `headers` and `rawData` keys filled with values from execution.
     */
    public getData(projectId: string, columns: any[], executionConfiguration: any = {}, settings: any = {}) {
        if (process.env.NODE_ENV !== "test") {
            // tslint:disable-next-line:no-console
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
                    get(executionConfiguration, "metricMappings"),
                    get(response, ["executionResult", "headers"], []),
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
                    rawData: get(result, "extendedTabularDataResult.values", []),
                    warnings: get(result, "extendedTabularDataResult.warnings", []),
                    isLoaded: true,
                    isEmpty: status === 204,
                };
            });
    }

    public mdToExecutionDefinitionsAndColumns(
        projectId: string,
        mdObj: GdcVisualizationObject.IVisualizationObjectContent,
        options: { attributesMap?: {}; removeDateItems?: boolean } = {},
    ): Promise<GdcCatalog.IColumnsAndDefinitions> {
        const allDfUris = getAttributesDisplayForms(mdObj);
        const attributesMapPromise = this.getAttributesMap(options, allDfUris, projectId);

        return attributesMapPromise.then((attributesMap: any) => {
            return getExecutionDefinitionsAndColumns(mdObj, options, attributesMap);
        });
    }

    private getAttributesMap(
        options: { attributesMap?: {} } = {},
        displayFormUris: string[],
        projectId: string,
    ) {
        const attributesMap = get(options, "attributesMap", {});

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
                        ...get(prevResult, "extendedTabularDataResult.values", []),
                        ...get(result, "extendedTabularDataResult.values", []),
                    ];

                    const warnings = [
                        ...get(prevResult, "extendedTabularDataResult.warnings", []),
                        ...get(result, "extendedTabularDataResult.warnings", []),
                    ];

                    const updatedResult = merge({}, prevResult, {
                        extendedTabularDataResult: {
                            values,
                            warnings,
                        },
                    });

                    const nextUri = get(result, "extendedTabularDataResult.paging.next");
                    if (nextUri) {
                        resolve(this.loadExtendedDataResults(nextUri, settings, updatedResult));
                    } else {
                        resolve({ status, result: updatedResult });
                    }
                }, reject);
        });
    }
}
