// (C) 2024 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ListItemProps } from "../types.js";
import classnames from "classnames";
import { renderDetails } from "../utils/renderDetails.js";
import { renderItemIcon } from "../utils/renderItemIcon.js";
import { UpdatedDate } from "./UpdateDate.js";
import { renderLock } from "../utils/renderLoack.js";

/**
 * A single result item in the search results.
 * @internal
 */
const CoreAnnotatedResultsItem: React.FC<ListItemProps<ISemanticSearchResultItem>> = ({
    listItem,
    isActive,
    setActive,
    onSelect,
}) => {
    const theme = useTheme();
    const Tag = listItem.url ? "a" : "span";

    // Use mouse enter with the target check instead of hover to prevent multiple triggers
    return (
        <Tag
            href={listItem.url}
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
                <span className="gd-semantic-search__results-item__text__1">
                    {renderLock(listItem)}
                    {listItem.item.title}
                </span>
                <span className="gd-semantic-search__results-item__text__2">
                    {listItem.parentRef ? (
                        <span className="gd-semantic-search__results-item__annotation">
                            {listItem.parentRef.sourceObjectTitle}
                        </span>
                    ) : null}
                    <span className="gd-semantic-search__results-item__annotation">
                        <UpdatedDate listItem={listItem} />
                    </span>
                </span>
            </span>
            {isActive ? renderDetails(listItem, theme) : null}
        </Tag>
    );
};

export const AnnotatedResultsItem = React.memo(CoreAnnotatedResultsItem);
