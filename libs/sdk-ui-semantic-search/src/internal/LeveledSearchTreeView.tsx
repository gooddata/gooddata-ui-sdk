// (C) 2025 GoodData Corporation
import React from "react";
import { useIntl, type IntlShape } from "react-intl";
import type { ISemanticSearchResultItem, ISemanticSearchRelationship } from "@gooddata/sdk-model";
import { UiLeveledTreeview, type UiLeveledTreeView, type OnLeveledSelectFn } from "@gooddata/sdk-ui-kit";
import { LeveledSearchTreeViewItemMemo } from "./LeveledSearchTreeViewItem.js";
import { getItemRelationships, isItemLocked, isRelationshipLocked } from "../utils/searchItem.js";
import { getUIPath } from "../utils/getUIPath.js";

export type SearchTreeViewLevels = [
    ISemanticSearchResultItem,
    ISemanticSearchResultItem | ISemanticSearchRelationship,
];
export type SearchTreeViewItem = UiLeveledTreeView<SearchTreeViewLevels>;

type Props = {
    workspace: string;
    searchResults: ISemanticSearchResultItem[];
    searchRelationships: ISemanticSearchRelationship[];
    threshold?: number;
    onSelect: OnLeveledSelectFn<SearchTreeViewLevels>;
};

/**
 * A tree view component for semantic search results.
 * @internal
 */
export function LeveledSearchTreeView(props: Props) {
    const intl = useIntl();
    const items = buildItems(props, intl);
    return (
        <UiLeveledTreeview
            items={items}
            maxHeight={500}
            ariaAttributes={{
                id: "leveled-semantic-search-tree",
                "aria-label": intl.formatMessage({ id: "semantic-search.tree" }),
            }}
            expandedMode="default-collapsed"
            selectionMode="leafs-only"
            onSelect={props.onSelect}
            ItemComponent={LeveledSearchTreeViewItemMemo}
            shouldKeyboardActionPreventDefault={false}
            isDisabledFocusable // For displaying locked items
        />
    );
}

type BuildItemsProps = {
    workspace: string;
    searchResults: ISemanticSearchResultItem[];
    searchRelationships: ISemanticSearchRelationship[];
    threshold?: number;
};

function buildItems(
    { workspace, searchResults, searchRelationships, threshold = 0.8 }: BuildItemsProps,
    intl: IntlShape,
): SearchTreeViewItem[] {
    return searchResults
        .filter((item) => {
            // Filter out items with similarity score below the threshold
            return (item.score ?? 0) >= threshold;
        })
        .map((item): SearchTreeViewItem => {
            // Items are not actually disabled, but we need to display the lock icon for locked items,
            // so this API is used for that purpose as a convenience.
            const isDisabled = isItemLocked(item, workspace);
            const url = getUIPath(item.type, item.id, workspace);

            // Do not show relationships for dashboard items
            if (item.type === "dashboard") {
                return {
                    item: {
                        id: item.id,
                        stringTitle: item.title,
                        data: item,
                        isDisabled,
                        url,
                    },
                };
            }

            const relationships = getItemRelationships(item, searchRelationships);
            const children: SearchTreeViewItem["children"] = relationships.map((relationship) => {
                const isDisabled = isRelationshipLocked(relationship, workspace);
                const url = getUIPath(
                    "dashboardVisualization",
                    relationship.sourceObjectId,
                    workspace,
                    item.id,
                );
                return {
                    item: {
                        id: relationship.sourceObjectId,
                        stringTitle: relationship.sourceObjectTitle,
                        data: relationship,
                        isDisabled,
                        url,
                        icon: undefined, // Icon is rendered via ItemIcon component
                    },
                };
            });

            // Add artificial "Edit" action item when there are relationships to display
            if (children.length > 0) {
                children.push({
                    item: {
                        id: item.id,
                        stringTitle: intl.formatMessage({ id: "semantic-search.edit" }),
                        icon: "pencil",
                        data: item,
                        isDisabled,
                        url,
                    },
                });
            }

            return {
                item: {
                    id: item.id,
                    stringTitle: item.title,
                    data: item,
                    isDisabled,
                    url,
                },
                children,
            };
        });
}
