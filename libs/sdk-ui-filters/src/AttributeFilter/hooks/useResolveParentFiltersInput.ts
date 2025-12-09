// (C) 2021-2025 GoodData Corporation
import { useMemo } from "react";

import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef, filterIsEmpty } from "@gooddata/sdk-model";
import { AttributeFiltersOrPlaceholders, useResolveValueWithPlaceholders } from "@gooddata/sdk-ui";

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
            return getParentFiltersWithoutOverAttribute(resolvedParentFilters ?? []);
        }

        if (!overAttribute) {
            return getParentFiltersWithoutOverAttribute(resolvedParentFilters ?? []);
        }

        return getParentFiltersWithOverAttribute(resolvedParentFilters ?? [], overAttribute);
    }, [supportsSettingConnectingAttributes, resolvedParentFilters, overAttribute]);
};

const getParentFiltersWithoutOverAttribute = (
    parentFilters: IAttributeFilter[],
): IElementsQueryAttributeFilter[] => {
    if (!parentFilters) {
        return [];
    }

    // overAttribute violate null check
    return parentFilters.map((attributeFilter) => ({
        attributeFilter,
        overAttribute: null as unknown as ObjRef,
    }));
};

const getParentFiltersWithOverAttribute = (
    parentFilters: IAttributeFilter[],
    overAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef),
): IElementsQueryAttributeFilter[] => {
    if (!parentFilters || !overAttribute) {
        return [];
    }

    const overAttributeGetter = typeof overAttribute === "function" ? overAttribute : () => overAttribute;

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
