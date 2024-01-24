// (C) 2024 GoodData Corporation

import { useMemo } from "react";
import {
    ObjRef,
    ICatalogAttribute,
    isIdentifierRef,
    areObjRefsEqual,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";

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
import { ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";

export interface IValuesLimitingItemWithTitle {
    title?: string;
    item: ValuesLimitingItem;
    isDisabled?: boolean;
}

const findTitleForParentFilter = (
    parentFilter: IDashboardAttributeFilterParentItem,
    labels: ObjRefMap<IAttributeDisplayFormMetadataObject>,
) => parentFilter.title ?? labels.get(parentFilter.displayForm)?.title;

const findTitleForCatalogItem = (
    item: ObjRef,
    { metrics, facts }: IMetricsAndFacts,
    attributes: ICatalogAttribute[],
) => {
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
};

// put items with undefined titles at the end of the particular list's subgroup
const compareOptionalTitles = (titleA?: string, titleB?: string): number => {
    if (titleA === undefined) {
        return 1;
    }
    if (titleB === undefined) {
        return -1;
    }
    return titleA.localeCompare(titleB);
};

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

export const sortByTypeAndTitle = (
    a: IValuesLimitingItemWithTitle,
    b: IValuesLimitingItemWithTitle,
): number => {
    const refTypeComparison = getTypeOrder(a.item) - getTypeOrder(b.item);
    if (refTypeComparison !== 0) {
        return refTypeComparison;
    }
    return compareOptionalTitles(a.title, b.title);
};

const mapParentFilters = (
    parentFilters: IDashboardAttributeFilterParentItem[],
    validParentFilters: ObjRef[],
    labels: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    isSelected: boolean,
) =>
    parentFilters
        .filter((item) => item.isSelected === isSelected)
        .map((item) => {
            const isDisabled = !validParentFilters.some((validParent) =>
                areObjRefsEqual(validParent, item.displayForm),
            );
            return {
                title: findTitleForParentFilter(item, labels),
                item,
                isDisabled,
            };
        });

export const useLimitingItems = (
    parentFilters: IDashboardAttributeFilterParentItem[],
    validParentFilters: ObjRef[],
    validateElementsBy: ObjRef[],
    metricsAndFacts: IMetricsAndFacts,
): IValuesLimitingItemWithTitle[] => {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const labels = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useMemo(() => {
        const selectedParentFilterItems: IValuesLimitingItemWithTitle[] = mapParentFilters(
            parentFilters,
            validParentFilters,
            labels,
            true,
        );
        const validationItems =
            validateElementsBy.map((item) => ({
                title: findTitleForCatalogItem(item, metricsAndFacts, attributes),
                item,
            })) ?? [];
        return [...selectedParentFilterItems, ...validationItems].sort(sortByTypeAndTitle);
    }, [parentFilters, validParentFilters, validateElementsBy, attributes, labels, metricsAndFacts]);
};

export const useSearchableLimitingItems = (
    currentlySelectedItems: ObjRef[],
    parentFilters: IDashboardAttributeFilterParentItem[],
    validParentFilters: ObjRef[],
): IValuesLimitingItemWithTitle[] => {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const measures = useDashboardSelector(selectCatalogMeasures);
    const facts = useDashboardSelector(selectCatalogFacts);
    const labels = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useMemo(() => {
        const unusedParentFiltersWithTitles = mapParentFilters(
            parentFilters,
            validParentFilters,
            labels,
            false,
        );

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

        const unusedMetricsWithTitle = [
            ...metricsWithTitles,
            ...factsWithTitles,
            ...attributesWithTitles,
        ].filter((item) => !currentlySelectedItems.includes(item.item));

        return [...unusedParentFiltersWithTitles, ...unusedMetricsWithTitle].sort(sortByTypeAndTitle);
    }, [currentlySelectedItems, measures, facts, attributes, labels, parentFilters, validParentFilters]);
};
