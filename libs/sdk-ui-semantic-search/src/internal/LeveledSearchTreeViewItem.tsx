// (C) 2024-2025 GoodData Corporation

import { memo } from "react";

import {
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    isSemanticSearchResultItem,
} from "@gooddata/sdk-model";
import { type IUiTreeviewItemProps, UiIcon } from "@gooddata/sdk-ui-kit";

import { GroupResultCounter } from "./GroupResultCounter.js";
import { SearchItemDetails } from "./SearchItemDetails.js";
import { SearchItemIcon } from "./SearchItemIcon.js";
import { UpdatedDate } from "./UpdateDate.js";
import { SearchItem } from "../SearchItem.js";
import { getAriaLabel } from "../utils/getAriaLabel.js";

type Props = IUiTreeviewItemProps<ISemanticSearchResultItem | ISemanticSearchRelationship>;

/**
 * A single result item in the search results.
 * @internal
 */
export const LeveledSearchTreeViewItemMemo = memo(function LeveledSearchTreeViewItem(props: Props) {
    const { item, type, level, isFocused, isExpanded, childCount, onSelect, onHover, ariaAttributes } = props;
    const href = type === "leaf" ? item.url : undefined;

    return (
        <SearchItem
            ariaAttributes={{
                ...ariaAttributes,
                "aria-label": getAriaLabel(item.data),
            }}
            level={level}
            href={href}
            onClick={onSelect}
            onHover={onHover}
            isFocused={isFocused}
            icon={<SearchItemIcon item={item.data} icon={item.icon} />}
            details={<SearchItemDetails item={item.data} />}
            resultCounter={<GroupResultCounter count={childCount} isExpanded={isExpanded} />}
        >
            <span className="gd-semantic-search__results-item__text__row">
                {item.isDisabled ? (
                    <UiIcon type="lock" color="complementary-7" size={16} ariaHidden={true} />
                ) : null}
                <span className="gd-semantic-search__results-item__text__ellipsis">{item.stringTitle}</span>
            </span>
            <span className="gd-semantic-search__results-item__text__row">
                {isSemanticSearchResultItem(item.data) && level === 1 && (
                    <UpdatedDate createdAt={item.data.createdAt} modifiedAt={item.data.modifiedAt} />
                )}
            </span>
        </SearchItem>
    );
});

export const getItemTitle = (item: IUiTreeviewItemProps<unknown>["item"]) => {
    return item.stringTitle;
};
