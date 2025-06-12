// (C) 2019-2022 GoodData Corporation
import React from "react";
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

export const AbsolutePresetFilterItems: React.FC<IAbsolutePresetFilterItemsProps> = ({
    filterOptions,
    dateFormat,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    className,
}) => (
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
