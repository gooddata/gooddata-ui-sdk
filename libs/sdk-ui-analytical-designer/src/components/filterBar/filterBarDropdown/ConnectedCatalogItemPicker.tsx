// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";
import { createSelector } from "reselect";

import { getProjectId } from "../../../selectors/bootstrap_selector.js";
import { getInsightWithBucketsViaMd } from "../../../selectors/insight_selectors.js";
import { getItemCache } from "../../../selectors/item_cache_selector.js";
import { getTagsConfiguration } from "../../../selectors/route_selector.js";
import { getAttributes, getMeasures } from "../../../services/buckets_service.js";
import {
    getAvailableItems,
    getHLLFilteredCatalogItems,
    getSortedCatalogGroups,
    isLoadingItems,
} from "../../../store/catalog/catalog_selector.js";
import { getFilterItems, getMeasureValueFilters } from "../../../store/filter_bar/filter_bar_selector.js";
import { FilterBar, type IMeasureValueFilter } from "../../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../../store/types.js";
import { getRouteParams } from "../../../utils/location.js";
import { getBucketItemNames } from "../../sort/chart_sort_bucket_items.js";

import { FilterBarCatalogItemPicker } from "./FilterBarCatalogItemPicker.js";
import { type IAddFilterItem } from "./filterBarDropdownUtils.js";
import { type FilterBarPickerItemType } from "./useFilterBarPickerItems.js";

// A stable empty array so the "ignore measure value filters" override does not introduce a new
// reference on each render (which would break referential stability of the picker props).
const EMPTY_MEASURE_VALUE_FILTERS: ReadonlyArray<IMeasureValueFilter> = [];

const getAttributeFilters = createSelector(getFilterItems, (filterItems) =>
    filterItems.filter(FilterBar.isAttributeFilter),
);

const getDatasetId = (state: IAppState) => getRouteParams(state).dataset;

const getIncludeObjectsWithTags = (state: IAppState) => getTagsConfiguration(state).includeObjectsWithTags;

const getExcludeObjectsWithTags = (state: IAppState) => getTagsConfiguration(state).excludeObjectsWithTags;

export interface IConnectedCatalogItemPickerProps {
    itemTypes: FilterBarPickerItemType[];
    selectionMode?: "single" | "multiple";
    isOpen: boolean;
    maxListHeight: number;
    /**
     * Whether to render the full picker including its header. Defaults to true. Set to false to render
     * only the picker body (search + grouped list), e.g. when embedded in the ranking filter measure
     * dropdown which provides its own anchor button.
     */
    withHeader?: boolean;
    /**
     * When true, the picker ignores existing measure value filters when deciding which metrics are
     * available. Used by ranking pickers, where ranking is independent of measure value filters.
     */
    ignoreMeasureValueFilters?: boolean;
    onBack: () => void;
    onClose: () => void;
    onAdd: (items: IAddFilterItem[]) => void;
}

/**
 * Connects the catalog data needed by the catalog item picker from a single place, so both the add
 * filter flow and the ranking filter measure dropdown reuse the same data wiring.
 */
export function ConnectedCatalogItemPicker({
    ignoreMeasureValueFilters,
    ...rest
}: IConnectedCatalogItemPickerProps) {
    const bucketMeasures = useSelector(getMeasures);
    const bucketAttributes = useSelector(getAttributes);
    const bucketItemNames = useSelector(getBucketItemNames);
    const itemCache = useSelector(getItemCache);
    const attributeFilters = useSelector(getAttributeFilters);
    const measureValueFilters = useSelector(getMeasureValueFilters);
    const availableCatalogItems = useSelector(getAvailableItems);
    const allCatalogItems = useSelector(getHLLFilteredCatalogItems);
    const catalogGroups = useSelector(getSortedCatalogGroups);
    const projectId = useSelector(getProjectId);
    const insight = useSelector(getInsightWithBucketsViaMd);
    const datasetId = useSelector(getDatasetId);
    const includeObjectsWithTags = useSelector(getIncludeObjectsWithTags);
    const excludeObjectsWithTags = useSelector(getExcludeObjectsWithTags);
    const isCatalogLoading = useSelector(isLoadingItems);

    return (
        <FilterBarCatalogItemPicker
            {...rest}
            bucketMeasures={bucketMeasures}
            bucketAttributes={bucketAttributes}
            bucketItemNames={bucketItemNames}
            itemCache={itemCache}
            attributeFilters={attributeFilters}
            availableCatalogItems={availableCatalogItems}
            allCatalogItems={allCatalogItems}
            catalogGroups={catalogGroups}
            projectId={projectId}
            insight={insight}
            datasetId={datasetId}
            includeObjectsWithTags={includeObjectsWithTags}
            excludeObjectsWithTags={excludeObjectsWithTags}
            isCatalogLoading={isCatalogLoading}
            measureValueFilters={
                ignoreMeasureValueFilters ? EMPTY_MEASURE_VALUE_FILTERS : measureValueFilters
            }
        />
    );
}
