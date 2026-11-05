// (C) 2007-2026 GoodData Corporation

import { has, isEqual, uniq, uniqWith } from "lodash-es";

import { type ObjRef, isUriRef, objRefToString } from "@gooddata/sdk-model";

import { currentReportMDObject } from "../selectors/buckets_selector.js";
import { getInsightForSaveViaMd } from "../selectors/insight_selectors.js";
import { getInsightTitle } from "../store/insight/insight_selectors.js";
import { getLastSavedObject } from "../store/report/report_selectors.js";
import { type IAppState } from "../store/types.js";
import {
    type IVisualization,
    type IBucket as IVisualizationObjectBucket,
    type IVisualizationObjectNegativeAttributeFilter,
    type IVisualizationObjectPositiveAttributeFilter,
    type VisualizationObjectExtendedFilter,
    type VisualizationObjectFilter,
    isVisualizationObjectMeasure,
    isVisualizationObjectNegativeAttributeFilter,
    isVisualizationObjectPositiveAttributeFilter,
} from "../typings/bear/bearTypes.js";
import { type IElement, type IFilterConfiguration } from "../typings/measure_filters.js";
import { type IReport } from "../typings/report.js";
import { convertModelInsightToADRep } from "../utils/sdkModelToADRep/InsightConverter.js";

export function getReportTitle(state: IAppState) {
    return getInsightTitle(state);
}

export function isReportTitleEmpty(state: IAppState) {
    return getReportTitle(state) === "";
}

export function getNewReportMDObject(state: IAppState): IReport {
    const createdReportMDObjectContent = currentReportMDObject(state);
    // through the domain accessor: the leaf is absent on the pristine post-reset state
    const lastReportObject = getLastSavedObject(state);

    return {
        ...lastReportObject,
        visualizationObject: {
            ...lastReportObject.visualizationObject,
            content: createdReportMDObjectContent,
            meta: {
                ...lastReportObject.visualizationObject?.meta,
                title: getReportTitle(state),
            },
        },
    };
}

export function getVisualizationObjectForSave(state: IAppState) {
    const visualization: IVisualization = {
        visualizationObject: convertModelInsightToADRep(getInsightForSaveViaMd(state), true),
    };

    return visualization;
}

const isAttributeFilter = (filter: unknown): filter is IAdAttributeFilter =>
    has(filter, "positiveAttributeFilter") || has(filter, "negativeAttributeFilter");

const joinFilterConfigurations = (
    configs: IFilterConfiguration[],
): {
    [uri: string]: IFilterConfiguration;
} => {
    const accumulator: Record<string, IFilterConfiguration> = {};
    return configs.reduce((acc, { dfUri, elementUris = [] }) => {
        const config = acc[dfUri] || { dfUri, elementUris };

        return {
            ...acc,
            [dfUri]: {
                ...config,
                elementUris: uniq([...config.elementUris, ...elementUris]),
            },
        };
    }, accumulator);
};

type IAdAttributeFilter =
    | IVisualizationObjectPositiveAttributeFilter
    | IVisualizationObjectNegativeAttributeFilter;

const getVisualizationFilterConfiguration = (filter: IAdAttributeFilter): IFilterConfiguration => {
    const positive = isVisualizationObjectPositiveAttributeFilter(filter)
        ? filter.positiveAttributeFilter
        : undefined;
    const negative = isVisualizationObjectNegativeAttributeFilter(filter)
        ? filter.negativeAttributeFilter
        : undefined;
    const displayForm = positive?.displayForm ?? negative?.displayForm;
    const dfUri = isUriRef(displayForm) ? displayForm.uri : undefined;

    const elementUris = positive?.in || negative?.notIn;

    return {
        dfUri,
        elementUris,
    };
};

export const getFilterItemsDefinitions = (
    buckets: IVisualizationObjectBucket[],
    filters: VisualizationObjectExtendedFilter[],
) => {
    const measureFilters = buckets.reduce((acc: VisualizationObjectFilter[], bucket) => {
        const bucketMeasureFilters = bucket.items.flatMap((item) =>
            isVisualizationObjectMeasure(item) && "measureDefinition" in item.measure.definition
                ? (item.measure.definition.measureDefinition.filters ?? [])
                : [],
        );

        return acc.concat(bucketMeasureFilters.filter(isAttributeFilter));
    }, []);

    const attributeFilters = [...measureFilters, ...filters].filter(isAttributeFilter);
    const configurations = attributeFilters.map(getVisualizationFilterConfiguration);

    return Object.values(joinFilterConfigurations(configurations));
};

export const indexValidElements = (
    validElements: Array<{ filterItemsRef: ObjRef; items: IElement[]; total: number }>,
): {
    [uri: string]: {
        items: IElement[];
        total: number;
    };
} => {
    const accumulator: Record<string, { items: IElement[]; total: number }> = {};
    return validElements.reduce((filterItems, result) => {
        // in case there is already filterItemsRef but contains different elements
        if (filterItems[objRefToString(result.filterItemsRef)]) {
            return {
                ...filterItems,
                [objRefToString(result.filterItemsRef)]: {
                    items: uniqWith(
                        [...result.items, ...filterItems[objRefToString(result.filterItemsRef)].items],
                        isEqual,
                    ),
                    total: result.total,
                },
            };
        }

        return {
            ...filterItems,
            [objRefToString(result.filterItemsRef)]: {
                items: result.items,
                total: result.total,
            },
        };
    }, accumulator);
};
