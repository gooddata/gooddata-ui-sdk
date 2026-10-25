// (C) 2019-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IParameterMetadataObject } from "@gooddata/sdk-model";

import {
    addFilter,
    addRankingFilterFromMetric,
    updateFilters,
} from "../../../sagas/filter_bar/filter_bar_ui_actions.js";
import { type IItemsState } from "../../../sagas/filter_bar/types.js";
import { isRankingFilterSupported as isRankingFilterSupportedSelector } from "../../../selectors/backend_capabilities_selector.js";
import {
    enableImprovedRankingFilter as enableImprovedRankingFilterSelector,
    enableParameters as enableParametersSelector,
    enableRankingWithMvf as enableRankingWithMvfSelector,
} from "../../../selectors/feature_flag_selector.js";
import { getAttributes, getMeasures } from "../../../services/buckets_service.js";
import { isDateItemAvailable as isDateItemAvailableSelector } from "../../../store/catalog/catalog_selector.js";
import { closeFilterDropdown, toggleFilterDropdown } from "../../../store/filter_bar/filter_bar_actions.js";
import {
    hasActiveMeasureValueFilter as hasActiveMeasureValueFilterSelector,
    hasRankingFilter as hasRankingFilterSelector,
    isFilterBarDropdownOpen as isFilterBarDropdownOpenSelector,
} from "../../../store/filter_bar/filter_bar_selector.js";
import { addParameterFilters } from "../../../store/filter_bar/parameter_filter_actions.js";
import { type AppDispatch } from "../../../store/types.js";
import { type ICacheItem } from "../../../typings/state_objects.js";
import { createDateItem } from "../../catalog/CatalogList.js";

import { useFilterBarButtonAnimationTimestamp } from "./AnimationHook.js";
import { getAttributeItems, getDateItem, getMeasureItems } from "./filter_dropdown_selector.js";
import { FilterBarButton } from "./FilterBarButton.js";
import { FilterBarDropdownBody } from "./FilterBarDropdownBody.js";
import { type IAddFilterItem, getRankingFilterDisabledReason } from "./filterBarDropdownUtils.js";

export function FilterBarDropdown() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const dateItem = useSelector(getDateItem);
    const attributes = useSelector(getAttributeItems);
    const measures = useSelector(getMeasureItems);
    const bucketMeasures = useSelector(getMeasures);
    const bucketAttributes = useSelector(getAttributes);
    const hasActiveMeasureValueFilter = useSelector(hasActiveMeasureValueFilterSelector);
    const isRankingFilterSupported = useSelector(isRankingFilterSupportedSelector);
    const hasRankingFilter = useSelector(hasRankingFilterSelector);
    const enableRankingWithMvf = useSelector(enableRankingWithMvfSelector);
    const enableImprovedRankingFilter = useSelector(enableImprovedRankingFilterSelector);
    const enableParameters = useSelector(enableParametersSelector);
    const isDateItemAvailable = useSelector(isDateItemAvailableSelector);
    const isDropdownOpen = useSelector(isFilterBarDropdownOpenSelector);

    const onApply = useCallback(
        (items: IItemsState, rankingFilterState: boolean) => {
            dispatch(updateFilters(items, rankingFilterState));
        },
        [dispatch],
    );
    const onAddFilter = useCallback(
        (catalogItem: ICacheItem, bucketItemLocalIdentifier?: string, autoOpen?: boolean) => {
            dispatch(addFilter(catalogItem, bucketItemLocalIdentifier, autoOpen));
        },
        [dispatch],
    );
    const onAddRankingFilterFromMetric = useCallback(
        (catalogItem: ICacheItem, bucketItemLocalIdentifier?: string) => {
            dispatch(addRankingFilterFromMetric(catalogItem, bucketItemLocalIdentifier));
        },
        [dispatch],
    );
    const onAddParameterFilters = useCallback(
        (parameters: ReadonlyArray<IParameterMetadataObject>) => {
            dispatch(addParameterFilters(parameters));
        },
        [dispatch],
    );
    const toggleDropdown = useCallback(() => {
        dispatch(toggleFilterDropdown());
    }, [dispatch]);
    const closeDropdown = useCallback(() => {
        dispatch(closeFilterDropdown());
    }, [dispatch]);

    const rankingDisabledReason = getRankingFilterDisabledReason(
        isRankingFilterSupported,
        !!(bucketMeasures?.length ?? 0),
        !!(bucketAttributes?.length ?? 0),
        hasRankingFilter,
        hasActiveMeasureValueFilter,
        enableImprovedRankingFilter,
        enableRankingWithMvf,
    );

    const animationTimestamp = useFilterBarButtonAnimationTimestamp(dateItem, measures, attributes);

    const [filterBarButtonRef, setFilterBarButtonRef] = useState<HTMLElement>(null);

    const handleAddFilters = useCallback(
        (items: IAddFilterItem[]) => {
            // a single picked filter opens its picker right away; a multi-pick adds several and opens none
            const autoOpen = items.length === 1;
            items.forEach(({ bucketItemLocalIdentifier, ...catalogItem }) =>
                onAddFilter(catalogItem, bucketItemLocalIdentifier, autoOpen),
            );
            closeDropdown();
        },
        [closeDropdown, onAddFilter],
    );

    const handleAddDateFilter = useCallback(() => {
        if (!isDateItemAvailable) {
            return;
        }
        const { available: _available, uri, identifier, ...rest } = createDateItem(intl);
        handleAddFilters([{ ...rest, identifier, uri: uri ?? identifier }]);
    }, [handleAddFilters, intl, isDateItemAvailable]);

    const handleAddRankingFilter = useCallback(() => {
        onApply({}, true);
        closeDropdown();
    }, [closeDropdown, onApply]);

    const handleAddRankingFilterFromMetric = useCallback(
        (items: IAddFilterItem[]) => {
            // The ranking metric picker is single-select, so at most one metric is picked.
            const [item] = items;
            if (item) {
                const { bucketItemLocalIdentifier, ...catalogItem } = item;
                onAddRankingFilterFromMetric(catalogItem, bucketItemLocalIdentifier);
            }
            closeDropdown();
        },
        [closeDropdown, onAddRankingFilterFromMetric],
    );

    return (
        <>
            <FilterBarButton
                isActive={isDropdownOpen}
                onClick={toggleDropdown}
                animationTimestamp={animationTimestamp}
                refCallback={setFilterBarButtonRef}
                intl={intl}
            />
            {isDropdownOpen ? (
                <FilterBarDropdownBody
                    onClose={closeDropdown}
                    onAddFilters={handleAddFilters}
                    onAddDateFilter={handleAddDateFilter}
                    onAddRankingFilter={handleAddRankingFilter}
                    onAddRankingFilterFromMetric={handleAddRankingFilterFromMetric}
                    isDateItemAvailable={isDateItemAvailable}
                    buttonNode={filterBarButtonRef}
                    rankingDisabledReason={rankingDisabledReason}
                    enableImprovedRankingFilter={enableImprovedRankingFilter}
                    enableParameters={enableParameters}
                    onAddParameters={onAddParameterFilters}
                />
            ) : null}
        </>
    );
}
