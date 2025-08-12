// (C) 2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import type { ISemanticSearchResultItem, ISemanticSearchRelationship } from "@gooddata/sdk-model";
import { UiLeveledTreeview, type UiLeveledTreeView, type OnLeveledSelectFn } from "@gooddata/sdk-ui-kit";
import { LeveledSearchTreeViewItemMemo } from "./internal/LeveledSearchTreeViewItem.js";
import { getItemRelationships } from "./utils/searchItem.js";

export type SearchTreeViewLevels = [ISemanticSearchResultItem, ISemanticSearchRelationship];
export type SearchTreeViewItem = UiLeveledTreeView<SearchTreeViewLevels>;

type Props = {
    id: string;
    searchResults: ISemanticSearchResultItem[];
    searchRelationships: ISemanticSearchRelationship[];
    width?: number;
    threshold?: number;
    onSelect: OnLeveledSelectFn<SearchTreeViewLevels>;
    onFocus: (nodeId: string) => void;
};

/**
 * A tree view component for semantic search results.
 * @internal
 */
export function SemanticSearchTreeView({ id, width, onSelect, onFocus, ...props }: Props) {
    const intl = useIntl();
    const items = buildItems(props);
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

type BuildItemsProps = {
    searchResults: ISemanticSearchResultItem[];
    searchRelationships: ISemanticSearchRelationship[];
    threshold?: number;
};

function buildItems({
    searchResults,
    searchRelationships,
    threshold = 0.8,
}: BuildItemsProps): SearchTreeViewItem[] {
    return searchResults
        .filter((item) => {
            // Filter out items with similarity score below the threshold
            return (item.score ?? 0) >= threshold;
        })
        .map((item): SearchTreeViewItem => {
            // Do not show relationships for dashboard items
            if (item.type === "dashboard") {
                return {
                    item: {
                        id: item.id,
                        stringTitle: item.title,
                        data: item,
                    },
                };
            }
            const relationships = getItemRelationships(item, searchRelationships);
            return {
                item: {
                    id: item.id,
                    stringTitle: item.title,
                    data: item,
                },
                children: relationships.map((relationship) => {
                    return {
                        item: {
                            id: relationship.sourceObjectId,
                            stringTitle: relationship.sourceObjectTitle,
                            data: relationship,
                        },
                    };
                }),
            };
        });
}
