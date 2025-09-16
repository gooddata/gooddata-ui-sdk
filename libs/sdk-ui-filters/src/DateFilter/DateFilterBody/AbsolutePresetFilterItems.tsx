// (C) 2019-2025 GoodData Corporation

import cx from "classnames";
import kebabCase from "lodash/kebabCase.js";

import { IAbsoluteDateFilterPreset } from "@gooddata/sdk-model";

import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized.js";
import { DateFilterOption } from "../interfaces/index.js";
import { ListItem } from "../ListItem/ListItem.js";

interface IAbsolutePresetFilterItemsProps {
    filterOptions: IAbsoluteDateFilterPreset[];
    dateFormat: string;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}

export function AbsolutePresetFilterItems({
    filterOptions,
    dateFormat,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    className,
}: IAbsolutePresetFilterItemsProps) {
    return (
        <>
            {filterOptions.map((item) => (
                <ListItem
                    key={item.localIdentifier}
                    isSelected={item.localIdentifier === selectedFilterOption.localIdentifier}
                    onClick={() => onSelectedFilterOptionChange(item)}
                    className={cx(`s-absolute-preset-${kebabCase(item.localIdentifier)}`, className)}
                >
                    <DateFilterTextLocalized filter={item} dateFormat={dateFormat} />
                </ListItem>
            ))}
        </>
    );
}
