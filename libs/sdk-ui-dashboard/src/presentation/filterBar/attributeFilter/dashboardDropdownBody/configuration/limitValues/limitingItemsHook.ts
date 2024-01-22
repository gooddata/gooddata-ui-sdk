// (C) 2024 GoodData Corporation

import { useMemo } from "react";
import { ObjRef, ICatalogAttribute, isIdentifierRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { ValuesLimitingItem } from "../../../types.js";
import {
    useDashboardSelector,
    selectCatalogAttributes,
    selectAllCatalogDisplayFormsMap,
    IDashboardAttributeFilterParentItem,
    IMetricsAndFacts,
    selectCatalogMeasures,
    selectCatalogFacts,
} from "../../../../../../model/index.js";

export interface IValuesLimitingItemWithTitle {
    title?: string;
    item: ValuesLimitingItem;
}

function findTitleForCatalogItem(
    item: ObjRef,
    { metrics, facts }: IMetricsAndFacts,
    attributes: ICatalogAttribute[],
) {
    if (!isIdentifierRef(item)) {
        return undefined;
    }
    if (item.type === "measure") {
        return metrics.find((metric) => areObjRefsEqual(metric.measure.ref, item))?.measure.title;
    }
    if (item.type === "fact") {
        return facts.find((fact) => areObjRefsEqual(fact.fact.ref, item))?.fact.title;
    }
    if (item.type === "attribute") {
        return attributes.find((attribute) => areObjRefsEqual(attribute.attribute.ref, item))?.attribute
            .title;
    }
    return undefined;
}

// put items with undefined titles at the end of the particular list sub-group
function compareOptionalTitles(titleA?: string, titleB?: string): number {
    if (titleA === undefined) {
        return 1;
    }
    if (titleB === undefined) {
        return -1;
    }
    return titleA.localeCompare(titleB);
}

const getTypeOrder = (item: ValuesLimitingItem): number => {
    if (!isIdentifierRef(item)) {
        return 0;
    }
    switch (item.type) {
        case "measure":
            return 1;
        case "attribute":
            return 2;
        case "fact":
            return 3;
        default:
            return 0;
    }
};

export function sortByTypeAndTitle(a: IValuesLimitingItemWithTitle, b: IValuesLimitingItemWithTitle): number {
    const refTypeComparison = getTypeOrder(a.item) - getTypeOrder(b.item);
    if (refTypeComparison !== 0) {
        return refTypeComparison;
    }
    return compareOptionalTitles(a.title, b.title);
}

export const useLimitingItems = (
    parentFilters: IDashboardAttributeFilterParentItem[],
    validateElementsBy: ObjRef[],
    metricsAndFacts: IMetricsAndFacts,
): IValuesLimitingItemWithTitle[] => {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const labels = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useMemo(() => {
        // parent filters are not yet supported by the UI, once they will, we can uncomment this
        const parentFilterItems: IValuesLimitingItemWithTitle[] = []; /*parentFilters.map((item) => ({
            title: labels.get(item.displayForm)?.title,
            item,
        }));*/

        const validationItems =
            validateElementsBy.map((item) => ({
                title: findTitleForCatalogItem(item, metricsAndFacts, attributes),
                item,
            })) ?? [];
        return [...parentFilterItems, ...validationItems].sort(sortByTypeAndTitle);
    }, [parentFilters, validateElementsBy, attributes, labels, metricsAndFacts]);
};

export interface IValidationItemWithTitle {
    title: string;
    item: ObjRef;
}

export const useSearchableLimitingItems = (currentlySelectedItems: ObjRef[]): IValidationItemWithTitle[] => {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const measures = useDashboardSelector(selectCatalogMeasures);
    const facts = useDashboardSelector(selectCatalogFacts);

    return useMemo(() => {
        const metricsWithTitles = measures.map((measure) => ({
            title: measure.measure.title,
            item: measure.measure.ref,
        }));
        const factsWithTitles = facts.map((fact) => ({
            title: fact.fact.title,
            item: fact.fact.ref,
        }));
        const attributesWithTitles = attributes.map((attribute) => ({
            title: attribute.attribute.title,
            item: attribute.attribute.ref,
        }));
        return [...metricsWithTitles, ...factsWithTitles, ...attributesWithTitles]
            .filter((item) => !currentlySelectedItems.includes(item.item))
            .sort(sortByTypeAndTitle);
    }, [currentlySelectedItems, measures, facts, attributes]);
};
