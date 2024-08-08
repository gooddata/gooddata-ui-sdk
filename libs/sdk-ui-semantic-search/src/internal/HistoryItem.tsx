// (C) 2024 GoodData Corporation

import * as React from "react";
import { Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ListItemProps } from "../types.js";
import classnames from "classnames";

/**
 * A single result item in the search results.
 * @internal
 */
export const HistoryItem: React.FC<ListItemProps<string>> = ({ listItem, onSelect, isActive, setActive }) => {
    const theme = useTheme();

    // Use mouse enter with the target check instead of hover to prevent multiple triggers
    return (
        <span
            className={classnames({
                "gd-semantic-search__results-item": true,
                "gd-semantic-search__results-item--active": isActive,
            })}
            onPointerOver={() => setActive(listItem)}
            onClick={(e) => onSelect(listItem, e.nativeEvent)}
        >
            <span className="gd-semantic-search__results-item__icon gd-semantic-search__results-item__icon--history">
                <Icon.HistoryBack color={theme?.palette?.complementary?.c5 ?? "#B0BECA"} />
            </span>
            <span className="gd-semantic-search__results-item__text gd-semantic-search__results-item__text--history">
                {listItem.item}
            </span>
        </span>
    );
};
