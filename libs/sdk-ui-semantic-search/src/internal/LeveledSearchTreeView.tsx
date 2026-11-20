// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import type {
    GenAIObjectType,
    ISemanticSearchRelationship,
    ISemanticSearchResultItem,
} from "@gooddata/sdk-model";
import { type OnLeveledSelectFn, type UiLeveledTreeView, UiLeveledTreeview } from "@gooddata/sdk-ui-kit";

import { LeveledSearchTreeViewItemMemo } from "./LeveledSearchTreeViewItem.js";
import { SearchLinkPolicyContext, isSearchItemLinkEnabled } from "./SearchLinkPolicyContext.js";

export type SearchTreeViewLevels = [ISemanticSearchResultItem, ISemanticSearchRelationship];
export type SearchTreeViewItem = UiLeveledTreeView<SearchTreeViewLevels>;

export type LeveledSearchTreeViewProps = {
    id: string;
    items: SearchTreeViewItem[];
    maxHeight?: number;
    onSelect: OnLeveledSelectFn<SearchTreeViewLevels>;
    onFocus?: (nodeId?: string) => void;
    tabIndex?: number;
    isLinkEnabled?: (type: GenAIObjectType) => boolean;
};

/**
 * A tree view component for semantic search results.
 * @internal
 */
export function LeveledSearchTreeView(props: LeveledSearchTreeViewProps) {
    const { id, items, maxHeight = 500, onSelect, onFocus, tabIndex = -1, isLinkEnabled } = props;
    const intl = useIntl();

    const handleSelect = useCallback<LeveledSearchTreeViewProps["onSelect"]>(
        (item, modifiers, event) => {
            if (!isSearchItemLinkEnabled(item.data, isLinkEnabled)) {
                event.preventDefault();
                return;
            }
            onSelect(item, modifiers, event);
        },
        [isLinkEnabled, onSelect],
    );

    return (
        <SearchLinkPolicyContext.Provider value={isLinkEnabled}>
            <UiLeveledTreeview
                items={items}
                maxHeight={maxHeight}
                ariaAttributes={{
                    id,
                    tabIndex,
                    "aria-label": intl.formatMessage({ id: "semantic-search.tree" }),
                }}
                expandedMode="default-collapsed"
                selectionMode="leafs-only"
                expansionMode="single"
                onSelect={handleSelect}
                onFocus={onFocus}
                ItemComponent={LeveledSearchTreeViewItemMemo}
                shouldKeyboardActionPreventDefault={false}
                isDisabledFocusable // For displaying locked items
            />
        </SearchLinkPolicyContext.Provider>
    );
}
