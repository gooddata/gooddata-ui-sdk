// (C) 2022-2023 GoodData Corporation

import {
    NotImplemented,
    IElementsQueryAttributeFilter,
    ElementsQueryOptionsElementsSpecification,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isElementsQueryOptionsElementsByValue,
} from "@gooddata/sdk-backend-spi";
import {
    filterObjRef,
    isUriRef,
    ObjRef,
    IAttributeElement,
    IRelativeDateFilter,
    IMeasure,
    IAttributeFilter,
    IDateFilter,
    measureItem,
    Identifier,
    objRefToString,
    IMeasureDefinition,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";
import intersectionBy from "lodash/intersectionBy.js";
import { AttributeElementsFiltering, AttributeElementsFilteringPredicate } from "./types.js";

const limiterFilteringPredicateAbstractFactory =
    <TLimitingItem>(refGetter: (item: TLimitingItem) => ObjRef | undefined, name: string) =>
    (specs: Record<Identifier, AttributeElementsFilteringPredicate<TLimitingItem>> | undefined) =>
    (limitingItem: TLimitingItem): ((item: IAttributeElement, index: number) => boolean) | undefined => {
        const ref = refGetter(limitingItem);
        if (isUriRef(ref)) {
            throw new NotImplemented(`Identifying ${name} by uri is not supported yet`);
        }

        const id = ref?.identifier;
        const spec = id && specs?.[id];
        if (!spec) {
            console.warn(`No ${name} limiting config found for id: ${id}. Ignoring...`);
            return undefined;
        }

        return (item: IAttributeElement, index: number) => spec(item, index, limitingItem);
    };

const attributeFilterPredicateFactory = limiterFilteringPredicateAbstractFactory<IAttributeFilter>(
    filterObjRef,
    "attribute filter",
);

const dateFilterPredicateFactory = limiterFilteringPredicateAbstractFactory<IDateFilter>(
    filterObjRef,
    "date filter",
);

const measurePredicateFactory = limiterFilteringPredicateAbstractFactory<IMeasure>(measureItem, "measure");

export const resolveLimitingItems =
    (
        attributeElementsFiltering: AttributeElementsFiltering | undefined,
        attributeFilters: IElementsQueryAttributeFilter[],
        dateFilters: IRelativeDateFilter[],
        measures: IMeasure[],
    ) =>
    (elements: IAttributeElement[]): IAttributeElement[] => {
        if (!attributeElementsFiltering) {
            return elements;
        }

        const measureLimiters = measures.map(measurePredicateFactory(attributeElementsFiltering.measures));
        const attributeFilterLimiters = attributeFilters
            .map((item) => item.attributeFilter) // ignoring the joining attribute for now
            .map(attributeFilterPredicateFactory(attributeElementsFiltering.attributeFilters));
        const dateFilterLimiters = dateFilters.map(
            dateFilterPredicateFactory(attributeElementsFiltering.dateFilters),
        );
        const allLimiters = compact([...measureLimiters, ...attributeFilterLimiters, ...dateFilterLimiters]);

        // filter by all the limiters separately so that they can make use of the index
        // independently of each other
        const filteredIndividually = allLimiters.map((limiter) => elements.filter(limiter));

        // and then intersect the results by uris, this effectively ANDs the filters
        return filteredIndividually.length
            ? intersectionBy(...filteredIndividually, (element) => element.uri)
            : elements;
    };

export const resolveSelectedElements =
    (selectedElements: ElementsQueryOptionsElementsSpecification | undefined) =>
    (elements: IAttributeElement[]): IAttributeElement[] => {
        if (!selectedElements) {
            return elements;
        }

        if (isElementsQueryOptionsElementsByPrimaryDisplayFormValue(selectedElements)) {
            throw new NotImplemented("Elements by primary display form value are not supported yet");
        }

        if (isElementsQueryOptionsElementsByValue(selectedElements)) {
            return elements.filter((element) =>
                selectedElements.values.some((value) => element.title === value),
            );
        }

        return elements.filter((element) => selectedElements.uris.some((uri) => element.uri === uri));
    };

export const resolveStringFilter =
    (filter: string | undefined | null) =>
    (elements: IAttributeElement[]): IAttributeElement[] => {
        return filter
            ? elements.filter((item) => item.title?.toLowerCase().includes(filter.toLowerCase()))
            : elements;
    };

/**
 * @internal
 */
export function newAttributeFilterLimitingItem(
    attributeFilter: IAttributeFilter,
    predicate: AttributeElementsFilteringPredicate<IAttributeFilter>,
): Record<Identifier, AttributeElementsFilteringPredicate<IAttributeFilter>> {
    return {
        [objRefToString(filterObjRef(attributeFilter))]: predicate,
    };
}

/**
 * @internal
 */
export function newDateFilterLimitingItem(
    dateFilter: IDateFilter,
    predicate: AttributeElementsFilteringPredicate<IDateFilter>,
): Record<Identifier, AttributeElementsFilteringPredicate<IDateFilter>> {
    return {
        [objRefToString(filterObjRef(dateFilter))]: predicate,
    };
}

/**
 * @internal
 */
export function newMeasureLimitingItem(
    measure: IMeasure<IMeasureDefinition>,
    predicate: AttributeElementsFilteringPredicate<IMeasure>,
): Record<Identifier, AttributeElementsFilteringPredicate<IMeasure>> {
    return {
        [objRefToString(measureItem(measure))]: predicate,
    };
}
