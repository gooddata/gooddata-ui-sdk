// (C) 2007-2026 GoodData Corporation

import { type ComponentType, memo } from "react";

import classNames from "classnames";
import { connect } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import {
    type CatalogItem,
    type ObjRef,
    areObjRefsEqual,
    isCatalogAttribute,
    isCatalogComputedAttribute,
    isComputedAttributeRef,
} from "@gooddata/sdk-model";
import {
    type AttributeFilterAvailableSelectionType,
    type IAttributeFilterDropdownBodyProps,
    type IAttributeFilterDropdownButtonProps,
    type IAttributeFilterElementsSearchBarProps,
} from "@gooddata/sdk-ui-filters";

import { FILTERS } from "../../constants/bucket.js";
import {
    type IDecoratedMetricAttributeFilter,
    createDecoratedMetricAttributeFilter,
} from "../../models/decorated_metric_attribute_filter.js";
import { findAttributeCacheItemByRef } from "../../models/item_cache_lookup.js";
import { filterSupportedDisplayForms } from "../../selectors/buckets_selector.js";
import { getAvailableSelectionTypes } from "../../selectors/feature_flag_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { getBucketsMeta } from "../../services/buckets_service.js";
import { isLocationIconEnabled } from "../../services/reference_point_service.js";
import {
    updateAttributeFilter,
    updateAttributeFilterDisplayForm,
} from "../../store/bucket_filters/bucket_filters_actions.js";
import {
    getAvailableItems,
    getCatalogItems,
    isLoadingAvailability,
} from "../../store/catalog/catalog_selector.js";
import { getAttributeFilterConfigs, getFilterItems } from "../../store/filter_bar/filter_bar_selector.js";
import {
    FilterBar,
    type IAttributeElement,
    type IAttributeFilter,
    type IOnAttributeFilterApplyProps,
} from "../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../store/types.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IUpdateAttributeFilterPayload } from "../../typings/measure_filters.js";
import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";
import { AttributeFilter } from "../AttributeFilter/AttributeFilter.js";

import { FilterItem } from "./FilterItem.js";

export interface IAttributeFilterItemOwnProps {
    dropdownClassName?: string;
    filterLocalIdentifier: string;
    isHighlighted?: boolean;
    isDraggedItem?: boolean;
    attributeFilterProp?: IAttributeFilter;
    onApply?: (props: IOnAttributeFilterApplyProps) => void;
    onClose?: () => void;
    isAutoOpen?: boolean;
    useAlternativeDisplayForms?: boolean;

    dropdownButtonComponent?: ComponentType<IAttributeFilterDropdownButtonProps>;
    dropdownBodyComponent?: ComponentType<IAttributeFilterDropdownBodyProps>;
    elementsSearchBarComponent?: ComponentType<IAttributeFilterElementsSearchBarProps>;
    availableSelectionTypesOverride?: AttributeFilterAvailableSelectionType[];
}

interface IAttributeFilterItemDispatchProps {
    updateAttributeFilter: (payload: {
        displayFormRef: ObjRef;
        filterLocalIdentifier: string;
        totalElementsCount: number;
        selectedElements: ReadonlyArray<IAttributeElement>;
        isInverted: boolean;
    }) => void;
    updateAttributeFilterDisplayForm: (payload: {
        filterLocalIdentifier: string;
        displayAsDfRef: ObjRef;
        primaryDfRef?: ObjRef;
        selectedElements?: IAttributeElement[];
    }) => void;
}

interface IAttributeFilterItemStateProps {
    filter: IDecoratedMetricAttributeFilter | null;
    isUsedByInsight: boolean;
    isLocationIconEnabled?: boolean;
    availableDisplayForms: ICacheItemDisplayForm[];
    availableSelectionTypes: AttributeFilterAvailableSelectionType[];
}

const catalogItemMatchesFilter = (catalogItem: CatalogItem, attributeFilter: IAttributeFilter) => {
    if (!isCatalogAttribute(catalogItem) && !isCatalogComputedAttribute(catalogItem)) {
        return false;
    }
    if (areObjRefsEqual(catalogItem.defaultDisplayForm.ref, attributeFilter.displayFormRef)) {
        return true;
    }

    return isComputedAttributeRef(attributeFilter.displayFormRef)
        ? isCatalogComputedAttribute(catalogItem) &&
              catalogItem.computedAttribute.id === attributeFilter.cacheItemIdentifier
        : isCatalogAttribute(catalogItem) && catalogItem.attribute.id === attributeFilter.cacheItemIdentifier;
};

export type IAttributeFilterItemProps = IAttributeFilterItemOwnProps &
    IAttributeFilterItemDispatchProps &
    IAttributeFilterItemStateProps;

export const AttributeFilterItemPureBase = memo(function AttributeFilterItemPureBase({
    dropdownClassName,
    filterLocalIdentifier,
    isHighlighted = false,
    onApply,
    onClose,
    isAutoOpen = false,
    useAlternativeDisplayForms = true,
    dropdownButtonComponent,
    dropdownBodyComponent,
    elementsSearchBarComponent,
    updateAttributeFilter,
    updateAttributeFilterDisplayForm,
    filter,
    isUsedByInsight,
    availableDisplayForms,
    availableSelectionTypes,
    availableSelectionTypesOverride,
}: IAttributeFilterItemProps) {
    const onApplyHandler = (payload: IUpdateAttributeFilterPayload) => {
        const { totalElementsCount, selectedElements, isInverted, displayFormRef, textModeFilter } = payload;

        if (onApply) {
            onApply({
                filterLocalIdentifier,
                displayFormRef,
                totalElementsCount,
                selectedElements: selectedElements ?? [],
                isInverted,
                ...(textModeFilter ? { textModeFilter } : {}),
            });
        } else {
            updateAttributeFilter({
                filterLocalIdentifier,
                displayFormRef,
                totalElementsCount,
                selectedElements: selectedElements ?? [],
                isInverted,
                ...(textModeFilter ? { textModeFilter } : {}),
            });
        }
    };

    const onDisplayFormChange = (
        dfRef: ObjRef,
        currentDisplayFormRef: ObjRef,
        selectedElements: IAttributeElement[],
    ) => {
        updateAttributeFilterDisplayForm({
            filterLocalIdentifier,
            displayAsDfRef: dfRef,
            primaryDfRef: currentDisplayFormRef,
            selectedElements,
        });
    };

    if (!filter) {
        return null;
    }

    const identifier = filter.attribute?.identifier as string;

    const filterItemClassName = classNames({ highlight: isHighlighted });

    return (
        <FilterItem identifier={identifier} className={filterItemClassName}>
            <AttributeFilter
                bucketType={FILTERS}
                filter={filter}
                onApply={onApplyHandler}
                onClose={onClose}
                isUsedByInsight={isUsedByInsight}
                autoOpen={isAutoOpen}
                useAlternativeDisplayForms={useAlternativeDisplayForms}
                onDisplayFormChange={onDisplayFormChange}
                availableDisplayForms={availableDisplayForms}
                availableSelectionTypes={availableSelectionTypesOverride ?? availableSelectionTypes}
                dropdownClassName={dropdownClassName}
                dropdownButtonComponent={dropdownButtonComponent}
                dropdownBodyComponent={dropdownBodyComponent}
                elementsSearchBarComponent={elementsSearchBarComponent}
            />
        </FilterItem>
    );
});

const getFilterLocalIdentifier = (_: IAppState, props: IAttributeFilterItemOwnProps) =>
    props.filterLocalIdentifier;

const getAttributeFilterItemFromProps = (_: IAppState, props: IAttributeFilterItemOwnProps) =>
    props.attributeFilterProp;

const getAttributeFilterItem = createSelector(
    getFilterItems,
    getFilterLocalIdentifier,
    (filterItems, filterLocalIdentifier) =>
        filterItems
            .filter(FilterBar.isAttributeFilter)
            .find((item) => item.localIdentifier === filterLocalIdentifier),
);

const createGetAttributeFilterProp = () => {
    return createSelector(
        getAttributeFilterItem,
        getAttributeFilterItemFromProps,
        getItemCache,
        getBucketsMeta,
        getAttributeFilterConfigs,
        (
            attributeFilterState,
            attributeFilterProp,
            itemCache,
            bucketsMeta,
            attributeFilterConfigs,
        ): IDecoratedMetricAttributeFilter | null => {
            const attributeFilter = attributeFilterProp ?? attributeFilterState;

            if (!attributeFilter) {
                // dnd react is re-rendering AttributeFilterItem after filter is removed from state
                return null;
            }

            const oldFilterDefinition: IBucketItemMetricFilter = {
                localIdentifier: attributeFilter.localIdentifier,
                allElements: [],
                attribute: attributeFilter.cacheItemIdentifier,
                displayFormRef: attributeFilter.displayFormRef,
                ...attributeFilter.filterConfig,
                ...(attributeFilter.textModeFilter ? { textModeFilter: attributeFilter.textModeFilter } : {}),
            };

            return createDecoratedMetricAttributeFilter(
                oldFilterDefinition,
                itemCache,
                bucketsMeta,
                false,
                attributeFilterConfigs,
            );
        },
    );
};

const isUsedByInsightSelector = () => {
    return createSelector(
        getAttributeFilterItem,
        getCatalogItems,
        getAvailableItems,
        isLoadingAvailability,
        (attributeFilter, catalogItems, availableCatalogItems, isLoadingAvailability): boolean => {
            const isInCatalogItems =
                attributeFilter &&
                catalogItems.some((catalogItem) => catalogItemMatchesFilter(catalogItem, attributeFilter));
            const isInAvailableCatalogItems =
                attributeFilter &&
                availableCatalogItems.some((availableCatalogItem) =>
                    catalogItemMatchesFilter(availableCatalogItem, attributeFilter),
                );
            return !isInCatalogItems || isInAvailableCatalogItems || isLoadingAvailability;
        },
    );
};

const NO_DISPLAY_FORMS: ReadonlyArray<ICacheItemDisplayForm> = Object.freeze([]);

const getDisplayFormsForAttributeFilterSelector = createSelector(
    getItemCache,
    getAttributeFilterItem,
    (itemCache, attributeFilter): ICacheItemDisplayForm[] => {
        const displayForms =
            (attributeFilter &&
                findAttributeCacheItemByRef(
                    itemCache,
                    attributeFilter.cacheItemIdentifier,
                    attributeFilter.displayFormRef,
                )?.displayForms) ||
            NO_DISPLAY_FORMS;

        return filterSupportedDisplayForms(displayForms);
    },
);

const makeMapStateToProps = () => {
    return createStructuredSelector({
        filter: createGetAttributeFilterProp(),
        isUsedByInsight: isUsedByInsightSelector(),
        isLocationIconEnabled,
        availableDisplayForms: getDisplayFormsForAttributeFilterSelector,
        availableSelectionTypes: getAvailableSelectionTypes,
    });
};

const mapDispatchToProps: IAttributeFilterItemDispatchProps = {
    updateAttributeFilter,
    updateAttributeFilterDisplayForm,
};

export const AttributeFilterItemPure = connect<
    IAttributeFilterItemStateProps,
    IAttributeFilterItemDispatchProps,
    IAttributeFilterItemOwnProps,
    IAppState
>(
    makeMapStateToProps,
    mapDispatchToProps,
)(AttributeFilterItemPureBase);

export const AttributeFilterItemTest = {
    getAttributeFilterItem,
    createGetAttributeFilterProp,
    isUsedByInsightSelector,
    getDisplayFormsForAttributeFilterSelector,
};
