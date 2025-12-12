// (C) 2025 GoodData Corporation

import type { IntlShape } from "react-intl";

import type { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";

import { type SearchTreeViewItem } from "./LeveledSearchTreeView.js";
import { permissionsFilter, thresholdFilter } from "../filters/items.filters.js";
import { getUIPath } from "../utils/getUIPath.js";
import { getItemRelationships, isItemLocked, isRelationshipLocked } from "../utils/searchItem.js";

type BuildSearchOverlayItemsProps = {
    intl: IntlShape;
    searchResults: ISemanticSearchResultItem[];
    relationships: ISemanticSearchRelationship[];
    workspace?: string;
    threshold?: number;
    canEdit?: boolean;
};

export function buildSemanticSearchTreeViewItems({
    intl,
    workspace = "",
    searchResults,
    relationships,
    threshold = 0.8,
    canEdit = false,
}: BuildSearchOverlayItemsProps): SearchTreeViewItem[] {
    return searchResults
        .filter(thresholdFilter(threshold))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
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

            const rels = getItemRelationships(item, relationships);
            const children: SearchTreeViewItem["children"] = rels.map((relationship) => {
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
        .filter(permissionsFilter(canEdit));
}
