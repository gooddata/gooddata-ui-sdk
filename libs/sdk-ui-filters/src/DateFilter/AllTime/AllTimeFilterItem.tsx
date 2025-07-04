// (C) 2019-2025 GoodData Corporation
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { ListItem } from "../ListItem/ListItem.js";
import { IAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { DateFilterOption } from "../interfaces/index.js";

export function AllTimeFilterItem({
    className,
    filterOption,
    selectedFilterOption,
    onSelectedFilterOptionChange,
}: {
    filterOption: IAllTimeDateFilterOption;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}) {
    return (
        <ListItem
            isSelected={filterOption.localIdentifier === selectedFilterOption.localIdentifier}
            onClick={() => onSelectedFilterOptionChange(filterOption)}
            className={cx("s-all-time", className)}
        >
            {filterOption.name ? filterOption.name : <FormattedMessage id="filters.allTime.title" />}
        </ListItem>
    );
}
