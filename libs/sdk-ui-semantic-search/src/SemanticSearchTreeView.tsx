// (C) 2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import type { ISemanticSearchResultItem, ISemanticSearchRelationship } from "@gooddata/sdk-model";
import { UiLeveledTreeview, type UiLeveledTreeView, type OnLeveledSelectFn } from "@gooddata/sdk-ui-kit";
import { LeveledSearchTreeViewItemMemo } from "./internal/LeveledSearchTreeViewItem.js";

export type SearchTreeViewLevels = [ISemanticSearchResultItem, ISemanticSearchRelationship];
export type SearchTreeViewItem = UiLeveledTreeView<SearchTreeViewLevels>;

type Props = {
    id: string;
    width?: number;
    items: SearchTreeViewItem[];
    onSelect: OnLeveledSelectFn<SearchTreeViewLevels>;
    onFocus: (nodeId: string) => void;
};

/**
 * A tree view component for semantic search results.
 * @internal
 */
export function SemanticSearchTreeView({ id, width, onSelect, onFocus, items }: Props) {
    const intl = useIntl();

    return (
        <UiLeveledTreeview
            items={items}
            width={width}
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
