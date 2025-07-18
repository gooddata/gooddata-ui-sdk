// (C) 2025 GoodData Corporation
import { DateFilterOption, IDateFilterOptionsByType } from "../interfaces/index.js";
import { AllTimeFilterItem } from "./AllTimeFilterItem.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IAllTimeFilterSectionProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    isMobile: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}

export function AllTimeFilterSection({
    filterOptions,
    selectedFilterOption,
    isMobile,
    onSelectedFilterOptionChange,
}: IAllTimeFilterSectionProps) {
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
}
