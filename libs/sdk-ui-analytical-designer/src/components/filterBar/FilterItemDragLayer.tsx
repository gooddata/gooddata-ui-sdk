// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import { FilterBar, type IFilterBarItem } from "../../store/filter_bar/filter_bar_types.js";
import { isParameterFilter } from "../../store/filter_bar/parameter_filter_types.js";
import { AttributeFilterDragItem } from "../AttributeFilter/components/AttributeFilterDragItem.js";

import { DateFilterItem } from "./dateFilter/DateFilterItem.js";
import { MeasureValueFilterItem } from "./MeasureValueFilterItem.js";
import { ParameterFilterDragItem } from "./parameterFilter/ParameterFilterDragItem.js";
import { RankingFilterItem } from "./rankingFilter/RankingFilterItem.js";

export interface IFilterItemDragLayerProps {
    readonly filter: IFilterBarItem;
}

export const FilterItemDragLayer = memo(function FilterItemDragLayer({ filter }: IFilterItemDragLayerProps) {
    if (FilterBar.isDateFilter(filter)) {
        return <DateFilterItem filter={filter} className={"adi-filter-button-hover"} isDraggedItem />;
    } else if (FilterBar.isAttributeFilter(filter)) {
        return (
            <AttributeFilterDragItem
                key={filter.localIdentifier}
                filterLocalIdentifier={filter.localIdentifier}
            />
        );
    } else if (FilterBar.isMeasureValueFilter(filter)) {
        return <MeasureValueFilterItem filter={filter} className={"adi-filter-button-hover"} isDraggedItem />;
    } else if (FilterBar.isRankingFilter(filter)) {
        return <RankingFilterItem filter={filter} className={"adi-filter-button-hover"} />;
    } else if (isParameterFilter(filter)) {
        return <ParameterFilterDragItem filter={filter} />;
    }
    return null;
});
