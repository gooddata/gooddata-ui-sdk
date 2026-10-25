// (C) 2022-2026 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { type ISortItem } from "@gooddata/sdk-model";
import { type ISortConfig } from "@gooddata/sdk-ui-ext/internal";
import {
    Bubble,
    BubbleHoverTrigger,
    ChartSortingDialog,
    type IBucketItemDescriptors,
} from "@gooddata/sdk-ui-kit";

import { updateAppliedChartSort } from "../../sagas/chart_sort/chart_sort_ui_actions.js";
import { getDecoratedBucketItems } from "../../selectors/buckets_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { getAppliedSort, getSortConfig } from "../../store/chart_sort/chart_sort_selector.js";
import { type AppDispatch } from "../../store/types.js";

import { getBucketItemNames } from "./chart_sort_bucket_items.js";
import { sortButtonCurrentSortTypeCombiner } from "./chart_sort_button_combiners.js";
import { SortButton } from "./SortButton.js";
import { type CurrentSortType } from "./types.js";

interface IChartSortStateProps {
    sortConfig: ISortConfig;
    appliedSort: ISortItem[];
    bucketItems: IBucketItemDescriptors;
    currentSortType: CurrentSortType;
}

interface IChartSortDispatchProps {
    updateAppliedChartSort(appliedSort: ISortItem[]): void;
}

export type ChartSortProps = IChartSortStateProps & IChartSortDispatchProps;

function ChartSortComponent({
    updateAppliedChartSort,
    sortConfig,
    currentSortType,
    bucketItems,
    appliedSort,
}: ChartSortProps) {
    const intl = useIntl();

    const buttonRef = useRef<HTMLElement>(null);
    const [isOpen, setOpen] = useState(false);

    const onCancel = () => {
        setOpen(false);
    };

    const onApply = (sortItems: ISortItem[]) => {
        setOpen(false);
        updateAppliedChartSort(sortItems);
    };

    const toggleDropdown = () => {
        setOpen(!isOpen);
    };

    const sortButton = (
        <SortButton
            currentSortType={currentSortType}
            isEnabled={!sortConfig.disabled}
            isOpen={isOpen}
            refCallback={buttonRef}
            onClick={toggleDropdown}
        />
    );

    const buttonWithPossibleTooltip = sortConfig.disabledExplanation ? (
        <BubbleHoverTrigger hideDelay={0} className="s-chart-sort-button-bubble">
            {sortButton}
            <Bubble alignPoints={[{ align: "bc tc" }]}>{sortConfig.disabledExplanation}</Bubble>
        </BubbleHoverTrigger>
    ) : (
        sortButton
    );

    return (
        <div className="adi-chart-sort s-chart-sort">
            <div className="sort-button-panel">
                <h2 className="adi-filter-bucket-header sort-button-label">
                    {intl.formatMessage({ id: "chartSort.sortConfigButton.label" })}
                </h2>
                {buttonWithPossibleTooltip}
                {isOpen ? (
                    <ChartSortingDialog
                        locale={intl.locale}
                        currentSort={appliedSort?.length ? appliedSort : sortConfig.defaultSort}
                        availableSorts={sortConfig.availableSorts}
                        bucketItems={bucketItems}
                        buttonNode={buttonRef.current}
                        onApply={onApply}
                        onCancel={onCancel}
                    />
                ) : null}
            </div>
        </div>
    );
}

export const getCurrentSortType = createSelector(
    getSortConfig,
    getAppliedSort,
    getDecoratedBucketItems,
    getItemCache,
    sortButtonCurrentSortTypeCombiner,
);

export function ChartSort() {
    const sortConfig = useSelector(getSortConfig);
    const appliedSort = useSelector(getAppliedSort);
    const bucketItems = useSelector(getBucketItemNames);
    const currentSortType = useSelector(getCurrentSortType);

    const dispatch = useDispatch<AppDispatch>();
    const handleUpdateAppliedChartSort = useCallback(
        (appliedSort: ISortItem[]) => {
            dispatch(updateAppliedChartSort(appliedSort));
        },
        [dispatch],
    );

    if (!sortConfig.supported) {
        return null;
    }

    return (
        <ChartSortComponent
            sortConfig={sortConfig}
            appliedSort={appliedSort}
            bucketItems={bucketItems}
            currentSortType={currentSortType}
            updateAppliedChartSort={handleUpdateAppliedChartSort}
        />
    );
}
