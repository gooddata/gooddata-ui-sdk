// (C) 2025 GoodData Corporation
import React from "react";
import { useIntl, type IntlShape } from "react-intl";
import type { ISemanticSearchResultItem, ISemanticSearchRelationship } from "@gooddata/sdk-model";
import { UiLeveledTreeview, type UiLeveledTreeView, type OnLeveledSelectFn } from "@gooddata/sdk-ui-kit";
import { LeveledSearchTreeViewItemMemo } from "./LeveledSearchTreeViewItem.js";
import { getItemRelationships, isItemLocked, isRelationshipLocked } from "../utils/searchItem.js";
import { getUIPath } from "../utils/getUIPath.js";

export type SearchTreeViewLevels = [ISemanticSearchResultItem, ISemanticSearchRelationship];
export type SearchTreeViewItem = UiLeveledTreeView<SearchTreeViewLevels>;

type Props = {
    id: string;
    workspace: string;
    searchResults: ISemanticSearchResultItem[];
    searchRelationships: ISemanticSearchRelationship[];
    canEdit?: boolean;
    threshold?: number;
    onSelect: OnLeveledSelectFn<SearchTreeViewLevels>;
    onFocus: (nodeId: string) => void;
};

/**
 * A tree view component for semantic search results.
 * @internal
 */
export function LeveledSearchTreeView({ id, onSelect, onFocus, ...props }: Props) {
    const intl = useIntl();
    const items = buildItems(props, intl);
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

type BuildItemsProps = {
    workspace: string;
    searchResults: ISemanticSearchResultItem[];
    searchRelationships: ISemanticSearchRelationship[];
    threshold?: number;
    canEdit?: boolean;
};

function buildItems(
    { workspace, searchResults, searchRelationships, threshold = 0.8, canEdit }: BuildItemsProps,
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
            if (children.length > 0 && canEdit) {
                children.push({
                    item: {
                        id: item.id,
                        stringTitle: intl.formatMessage({ id: "semantic-search.edit" }),
                        icon: "pencil",
                        data: {
                            sourceObjectId: item.id,
                            targetObjectId: item.id,
                            sourceObjectTitle: item.title,
                            targetObjectTitle: item.title,
                            sourceObjectType: item.type,
                            targetObjectType: item.type,
                            sourceWorkspaceId: workspace,
                            targetWorkspaceId: workspace,
                        },
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
        })
        .filter((item) => {
            //NOTE: This is a workaround for a permissions, if user has only view permission on the dashboard
            // and we found object that is not dashboard has no relationships, we don't want to show it
            if (!canEdit && item.item.data.type !== "dashboard") {
                return (item.children?.length ?? 0) > 0;
            }
            return true;
        });
}
