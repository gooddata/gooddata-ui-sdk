// (C) 2025 GoodData Corporation
import React from "react";

import { AllTimeFilterItem } from "./AllTimeFilterItem.js";
import { DateFilterOption, IDateFilterOptionsByType } from "../interfaces/index.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IAllTimeFilterSectionProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    isMobile: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}

export const AllTimeFilterSection: React.FC<IAllTimeFilterSectionProps> = ({
    filterOptions,
    selectedFilterOption,
    isMobile,
    onSelectedFilterOptionChange,
}) => {
    if (!filterOptions.allTime) {
        return null;
    }

    return (
        <AllTimeFilterItem
            filterOption={filterOptions.allTime}
            selectedFilterOption={selectedFilterOption}
            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
            className={isMobile ? ITEM_CLASS_MOBILE : undefined}
        />
    );
};
