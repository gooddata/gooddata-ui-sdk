// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type DateFilterOption, type IDateFilterOptionsByType } from "../interfaces/index.js";
import { ListHeading } from "../ListHeading/ListHeading.js";
import { ListItem } from "../ListItem/ListItem.js";

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

interface IOtherPresetsSectionProps {
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    isMobile: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    enableEmptyDateValues: boolean;
}

export function OtherPresetsSection({
    filterOptions,
    selectedFilterOption,
    isMobile,
    onSelectedFilterOptionChange,
    enableEmptyDateValues,
}: IOtherPresetsSectionProps) {
    if (!enableEmptyDateValues || !filterOptions.emptyValues) {
        return null;
    }

    const option = filterOptions.emptyValues;

    return (
        <>
            <ListHeading>
                <FormattedMessage id="filters.other.heading" />
            </ListHeading>
            <ListItem
                isSelected={option.localIdentifier === selectedFilterOption.localIdentifier}
                onClick={() => onSelectedFilterOptionChange(option)}
                className={isMobile ? ITEM_CLASS_MOBILE : undefined}
            >
                {option.name ? option.name : <FormattedMessage id="filters.emptyValues.title" />}
            </ListItem>
        </>
    );
}
