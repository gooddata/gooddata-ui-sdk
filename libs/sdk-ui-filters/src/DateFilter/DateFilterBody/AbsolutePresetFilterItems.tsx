// (C) 2019-2025 GoodData Corporation
import kebabCase from "lodash/kebabCase.js";
import cx from "classnames";
import { ListItem } from "../ListItem/ListItem.js";
import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized.js";
import { IAbsoluteDateFilterPreset } from "@gooddata/sdk-model";
import { DateFilterOption } from "../interfaces/index.js";

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
