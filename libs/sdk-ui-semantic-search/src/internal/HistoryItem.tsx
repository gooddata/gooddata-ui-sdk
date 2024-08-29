// (C) 2024 GoodData Corporation

import * as React from "react";
import { Icon } from "@gooddata/sdk-ui-kit";
import { ListItemProps } from "../types.js";
import { SearchListItem } from "../SearchListItem.js";
import { ITheme } from "@gooddata/sdk-model";

const renderIcon = (_: any, theme?: ITheme) => (
    <Icon.HistoryBack color={theme?.palette?.complementary?.c5 ?? "#B0BECA"} />
);

/**
 * A single history item.
 * @internal
 */
export const HistoryItem: React.FC<ListItemProps<string>> = (props) => {
    return (
        <SearchListItem
            {...props}
            renderIcon={renderIcon}
            className="gd-semantic-search__results-item--history"
        >
            <span className="gd-semantic-search__results-item__text__row">
                <span className="gd-semantic-search__results-item__text__ellipsis">
                    {props.listItem.item}
                </span>
            </span>
        </SearchListItem>
    );
};
