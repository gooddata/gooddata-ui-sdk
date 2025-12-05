// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import type { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { type OnLeveledSelectFn, type UiLeveledTreeView, UiLeveledTreeview } from "@gooddata/sdk-ui-kit";

import { LeveledSearchTreeViewItemMemo } from "./LeveledSearchTreeViewItem.js";

export type SearchTreeViewLevels = [ISemanticSearchResultItem, ISemanticSearchRelationship];
export type SearchTreeViewItem = UiLeveledTreeView<SearchTreeViewLevels>;

export type LeveledSearchTreeViewProps = {
    id: string;
    items: SearchTreeViewItem[];
    maxHeight?: number;
    onSelect: OnLeveledSelectFn<SearchTreeViewLevels>;
    onFocus?: (nodeId?: string) => void;
    tabIndex?: number;
};

/**
 * A tree view component for semantic search results.
 * @internal
 */
export function LeveledSearchTreeView(props: LeveledSearchTreeViewProps) {
    const { id, items, maxHeight = 500, onSelect, onFocus, tabIndex = -1 } = props;
    const intl = useIntl();

    return (
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
            onSelect={onSelect}
            onFocus={onFocus}
            ItemComponent={LeveledSearchTreeViewItemMemo}
            shouldKeyboardActionPreventDefault={false}
            isDisabledFocusable // For displaying locked items
        />
    );
}
