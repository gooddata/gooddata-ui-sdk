// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { IAllTimeDateFilterOption } from "@gooddata/sdk-model";

import { DateFilterOption } from "../interfaces/index.js";
import { ListItem } from "../ListItem/ListItem.js";

export const AllTimeFilterItem: React.FC<{
    filterOption: IAllTimeDateFilterOption;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}> = ({ className, filterOption, selectedFilterOption, onSelectedFilterOptionChange }) => (
    <ListItem
        isSelected={filterOption.localIdentifier === selectedFilterOption.localIdentifier}
        onClick={() => onSelectedFilterOptionChange(filterOption)}
        className={cx("s-all-time", className)}
    >
        {filterOption.name ? filterOption.name : <FormattedMessage id="filters.allTime.title" />}
    </ListItem>
);
