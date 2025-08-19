// (C) 2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import type { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { type OnLeveledSelectFn, type UiLeveledTreeView, UiLeveledTreeview } from "@gooddata/sdk-ui-kit";

import { LeveledSearchTreeViewItemMemo } from "./LeveledSearchTreeViewItem.js";

export type SearchTreeViewLevels = [ISemanticSearchResultItem, ISemanticSearchRelationship];
export type SearchTreeViewItem = UiLeveledTreeView<SearchTreeViewLevels>;

type Props = {
    id: string;
    items: SearchTreeViewItem[];
    onSelect: OnLeveledSelectFn<SearchTreeViewLevels>;
    onFocus: (nodeId: string) => void;
};

/**
 * A tree view component for semantic search results.
 * @internal
 */
export function LeveledSearchTreeView({ id, onSelect, onFocus, items }: Props) {
    const intl = useIntl();

    return (
        <UiLeveledTreeview
            items={items}
            maxHeight={500}
            ariaAttributes={{
                id,
                tabIndex: -1,
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
