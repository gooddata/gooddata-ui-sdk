// (C) 2021-2022 GoodData Corporation
import { useMemo } from "react";
import { AttributeFiltersOrPlaceholders, useResolveValueWithPlaceholders } from "@gooddata/sdk-ui";
import { filterIsEmpty, IAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import isFunction from "lodash/isFunction";
import { ParentFilterOverAttributeType } from "../types";

/**
 * @internal
 */
export const useResolveParentFiltersInput = (
    parentFilters?: AttributeFiltersOrPlaceholders,
    overAttribute?: ParentFilterOverAttributeType,
) => {
    const resolvedParentFilters = useResolveValueWithPlaceholders(parentFilters);

    const limitingAttributeFilters = useMemo(() => {
        return getParentFiltersWithOverAttribute(resolvedParentFilters, overAttribute);
    }, [resolvedParentFilters, overAttribute]);

    return {
        limitingAttributeFilters,
    };
};

const getParentFiltersWithOverAttribute = (
    parentFilters: IAttributeFilter[],
    overAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef),
): IElementsQueryAttributeFilter[] => {
    if (!parentFilters || !overAttribute) {
        return [];
    }

    const overAttributeGetter = isFunction(overAttribute) ? overAttribute : () => overAttribute;

    return parentFilters
        .map((attributeFilter, index) => {
            return {
                attributeFilter,
                overAttribute: overAttributeGetter(attributeFilter, index),
            };
        })
        .filter((item) => {
            return !filterIsEmpty(item.attributeFilter);
        });
};
