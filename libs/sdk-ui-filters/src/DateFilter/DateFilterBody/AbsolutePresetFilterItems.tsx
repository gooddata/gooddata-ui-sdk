// (C) 2019 GoodData Corporation
import React from "react";
import kebabCase from "lodash/kebabCase";
import cx from "classnames";
import { ListItem } from "../ListItem/ListItem";
import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized";
import { IAbsoluteDateFilterPreset } from "@gooddata/sdk-backend-spi";
import { DateFilterOption } from "../interfaces";

interface IAbsolutePresetFilterItemsProps {
    filterOptions: IAbsoluteDateFilterPreset[];
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}

export const AbsolutePresetFilterItems: React.FC<IAbsolutePresetFilterItemsProps> = ({
    filterOptions,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    className,
}) => (
    <>
        {filterOptions.map((item) => (
            <ListItem
                key={item.localIdentifier}
                isSelected={item.localIdentifier === selectedFilterOption.localIdentifier}
                // tslint:disable-next-line:jsx-no-lambda
                onClick={() => onSelectedFilterOptionChange(item)}
                className={cx(`s-absolute-preset-${kebabCase(item.localIdentifier)}`, className)}
            >
                <DateFilterTextLocalized filter={item} />
            </ListItem>
        ))}
    </>
);
