// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import classNames from "classnames";
import { useDispatch } from "react-redux";

import { logUpdateCompareFilter } from "../../../actions/buckets_actions.js";
import { updateDateFilter } from "../../../sagas/date_datasets/date_datasets_actions.js";
import { dateFilterClosed } from "../../../store/bucket_filters/bucket_filters_actions.js";
import { type IDateFilter } from "../../../store/filter_bar/filter_bar_types.js";
import { type AppDispatch } from "../../../store/types.js";
import { FilterItem } from "../FilterItem.js";

import { DateFilter } from "./DateFilter.js";
import { buildDateFilterValueFromDateFilterOption } from "./dateFilterOptionFactory.js";
import { type IUpdateDateFilterPayload } from "./types.js";

export interface IDateFilterItemOwnProps {
    filter: IDateFilter;
    className: string;
    isHighlighted?: boolean;
    isDraggedItem?: boolean;
    /** the user just added this filter, so its picker opens right away */
    isAutoOpen?: boolean;
    onClose?: () => void;
}

export function DateFilterItem({
    filter,
    className,
    isHighlighted,
    isDraggedItem,
    isAutoOpen,
    onClose: onCloseProp,
}: IDateFilterItemOwnProps) {
    const dispatch = useDispatch<AppDispatch>();

    const filterItemClassName = classNames("adi-date-filter", "s-date-filter", {
        highlight: isHighlighted,
    });
    const { localIdentifier } = filter;
    const onApply = useMemo(
        () =>
            ({
                overTimeComparisonType,
                overTimeComparisonMeasures,
                filter,
                dateDatasetRef,
                additionalDateAttributeFilters,
                isCurrentPeriodExcluded,
                emptyDateValuesFilter,
            }: IUpdateDateFilterPayload) => {
                dispatch(
                    updateDateFilter({
                        localIdentifier: localIdentifier,
                        overTimeComparisonType,
                        overTimeComparisonMeasures,
                        filterConfig: buildDateFilterValueFromDateFilterOption(filter),
                        dateDatasetRef,
                        additionalDateAttributeFilters,
                        isCurrentPeriodExcluded,
                        emptyDateValuesFilter,
                    }),
                );
                dispatch(logUpdateCompareFilter(overTimeComparisonType));
            },
        [dispatch, localIdentifier],
    );

    const onClose = useCallback(() => {
        dispatch(dateFilterClosed());
        onCloseProp?.();
    }, [dispatch, onCloseProp]);

    return (
        <FilterItem identifier={filter.localIdentifier} className={filterItemClassName}>
            <DateFilter
                filterLocalIdentifier={filter.localIdentifier}
                className={className}
                onApply={onApply}
                onClose={onClose}
                isDragged={isDraggedItem}
                isAutoOpen={isAutoOpen}
            />
        </FilterItem>
    );
}
