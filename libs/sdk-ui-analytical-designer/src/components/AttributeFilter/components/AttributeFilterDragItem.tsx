// (C) 2007-2026 GoodData Corporation

import classNames from "classnames";
import { connect } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import {
    DecoratedMetricAttributeFilter,
    createDecoratedMetricAttributeFilter,
} from "../../../models/decorated_metric_attribute_filter.js";
import { getItemCache } from "../../../selectors/item_cache_selector.js";
import { getBucketsMeta } from "../../../services/buckets_service.js";
import { getFilterItems } from "../../../store/filter_bar/filter_bar_selector.js";
import { FilterBar } from "../../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../../store/types.js";
import { type IBucketItemMetricFilter } from "../../../typings/bucket_item_filter.js";

export interface IAttributeFilterDragItemOwnProps {
    filterLocalIdentifier: string;
}

export interface IAttributeFilterDragItemStateProps {
    filterTitle: string | null;
}

export type IAttributeFilterDragItemProps = IAttributeFilterDragItemOwnProps &
    IAttributeFilterDragItemStateProps;

const makeMapStateToProps = () => {
    return createStructuredSelector({
        filterTitle: createGetAttributeFilterProp(),
    });
};

export const AttributeFilterDragItem = connect<
    IAttributeFilterDragItemStateProps,
    never,
    IAttributeFilterDragItemOwnProps,
    IAppState
>(makeMapStateToProps)(function AttributeFilterDragItem({ filterTitle }: IAttributeFilterDragItemProps) {
    const buttonClassNames = classNames(
        "adi-filter-button",
        "adi-filter-button-hover",
        "adi-attr-filter-button",
        "s-filter-drag-item",
        "s-filter-button",
        "dropdown-button",
        "toggle-menu",
        "gd-button",
        "button-dropdown",
        "gd-icon-right",
    );

    const buttonTitleClassNames = classNames(
        "adi-filter-title",
        `s-${filterTitle}`,
        "s-attribute-filter-button-title",
        "adi-filter-selection",
        "s-global-attribute-filter-title",
    );

    return (
        <div className={buttonClassNames}>
            <span className="gd-button-text">
                <div>
                    <div className={buttonTitleClassNames}>
                        <span className="shortened is-whole">{filterTitle}</span>
                    </div>
                </div>
            </span>
        </div>
    );
});

const getFilterLocalIdentifier = (_: IAppState, props: IAttributeFilterDragItemOwnProps) =>
    props.filterLocalIdentifier;

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
        getItemCache,
        getBucketsMeta,
        (attributeFilterState, itemCache, bucketsMeta): string | null => {
            const attributeFilter = attributeFilterState;

            if (!attributeFilter) {
                // dnd react is re-rendering AttributeFilterItem after filter is removed from state
                return null;
            }

            const oldFilterDefinition: IBucketItemMetricFilter = {
                allElements: [],
                attribute: attributeFilter.cacheItemIdentifier,
                displayFormRef: attributeFilter.displayFormRef,
                ...attributeFilter.filterConfig,
            };

            const decoratedFilter = createDecoratedMetricAttributeFilter(
                oldFilterDefinition,
                itemCache,
                bucketsMeta,
            );

            return DecoratedMetricAttributeFilter.getAttributeTitle(decoratedFilter) as string | null;
        },
    );
};
