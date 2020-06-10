// (C) 2019 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { ListItem } from "../ListItem/ListItem";
import { IAllTimeDateFilter } from "@gooddata/sdk-backend-spi";
import { DateFilterOption } from "../interfaces";

export const AllTimeFilterItem: React.FC<{
    filterOption: IAllTimeDateFilter;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
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
