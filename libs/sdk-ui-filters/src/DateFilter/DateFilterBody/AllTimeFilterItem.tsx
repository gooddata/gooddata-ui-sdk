// (C) 2019 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";
import { ListItem } from "../ListItem/ListItem";

export const AllTimeFilterItem: React.FC<{
    filterOption: ExtendedDateFilters.IAllTimeDateFilter;
    selectedFilterOption: ExtendedDateFilters.DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: ExtendedDateFilters.DateFilterOption) => void;
}> = ({ className, filterOption, selectedFilterOption, onSelectedFilterOptionChange }) => (
    <ListItem
        isSelected={filterOption.localIdentifier === selectedFilterOption.localIdentifier}
        // tslint:disable-next-line:jsx-no-lambda
        onClick={() => onSelectedFilterOptionChange(filterOption)}
        className={cx("s-all-time", className)}
    >
        <FormattedMessage id="filters.allTime.title" />
    </ListItem>
);
