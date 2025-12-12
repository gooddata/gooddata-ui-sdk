// (C) 2019-2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type IAllTimeDateFilterOption } from "@gooddata/sdk-model";

import { type DateFilterOption } from "../interfaces/index.js";
import { ListItem } from "../ListItem/ListItem.js";

export function AllTimeFilterItem({
    className,
    filterOption,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    isFocusFallback,
}: {
    filterOption: IAllTimeDateFilterOption;
    selectedFilterOption: DateFilterOption;
    className?: string;
    isFocusFallback?: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}) {
    return (
        <ListItem
            isSelected={filterOption.localIdentifier === selectedFilterOption.localIdentifier}
            onClick={() => onSelectedFilterOptionChange(filterOption)}
            className={cx("s-all-time", className)}
            isFocusFallback={isFocusFallback}
        >
            {filterOption.name ? filterOption.name : <FormattedMessage id="filters.allTime.title" />}
        </ListItem>
    );
}
