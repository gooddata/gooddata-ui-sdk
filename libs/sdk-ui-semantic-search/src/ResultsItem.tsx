// (C) 2024 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ListItemProps } from "./types.js";
import classnames from "classnames";
import { renderItemIcon } from "./utils/renderItemIcon.js";
import { renderDetails } from "./utils/renderDetails.js";

/**
 * A single result item in the search results.
 * @internal
 */
export const ResultsItem: React.FC<ListItemProps<ISemanticSearchResultItem>> = ({
    listItem,
    isActive,
    setActive,
    onSelect,
}) => {
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
            <span className="gd-semantic-search__results-item__icon">
                {renderItemIcon(listItem, { color: theme?.palette?.complementary?.c5 ?? "#B0BECA" })}
            </span>
            <span className="gd-semantic-search__results-item__text gd-semantic-search__results-item__text--result">
                <span className="gd-semantic-search__results-item__text__1">{listItem.item.title}</span>
            </span>
            {isActive ? renderDetails(listItem, theme) : null}
        </span>
    );
};
