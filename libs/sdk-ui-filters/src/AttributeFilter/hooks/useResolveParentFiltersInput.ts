// (C) 2021-2022 GoodData Corporation
import { useMemo } from "react";
import { AttributeFiltersOrPlaceholders, useResolveValueWithPlaceholders } from "@gooddata/sdk-ui";
import { filterIsEmpty, IAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import isFunction from "lodash/isFunction.js";
import { ParentFilterOverAttributeType } from "../types.js";

/**
 * @internal
 */
export const useResolveParentFiltersInput = (
    parentFilters?: AttributeFiltersOrPlaceholders,
    overAttribute?: ParentFilterOverAttributeType,
    supportsSettingConnectingAttributes?: boolean,
): IElementsQueryAttributeFilter[] => {
    const resolvedParentFilters = useResolveValueWithPlaceholders(parentFilters);

    return useMemo(() => {
        if (!supportsSettingConnectingAttributes) {
            return getParentFiltersWithoutOverAttribute(resolvedParentFilters);
        }

        return getParentFiltersWithOverAttribute(resolvedParentFilters, overAttribute);
    }, [supportsSettingConnectingAttributes, resolvedParentFilters, overAttribute]);
};

const getParentFiltersWithoutOverAttribute = (
    parentFilters: IAttributeFilter[],
): IElementsQueryAttributeFilter[] => {
    if (!parentFilters) {
        return [];
    }

    return parentFilters.map((attributeFilter) => ({ attributeFilter, overAttribute: null }));
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
