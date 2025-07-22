// (C) 2025 GoodData Corporation
import { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";

import { ListItem } from "../types.js";

import { getUIPath } from "./getUIPath.js";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

export function buildSearchList(
    workspace: string,
    searchResults: ISemanticSearchResultItem[],
    relationships: ISemanticSearchRelationship[],
    threshold: number = 0.8,
): IUiListboxInteractiveItem<ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>>[] {
    return searchResults.filter(filterByThreshold(threshold)).map((item) => {
        const isLocked = isItemLocked(item, workspace);

        // Look up parent items if available
        const parents = getParentObjects(relationships, item);
        // The item itself
        return {
            data: createListItem(
                item,
                getUIPath(item.type, item.id, workspace),
                isLocked,
                parents.map((parent) =>
                    createListItem(
                        parent,
                        getUIPath(parent.targetObjectType, parent.targetObjectId, workspace),
                        isRelationshipLocked(parent, workspace),
                    ),
                ),
            ),
            id: item.id,
            isDisabled: isLocked,
            stringTitle: item.title,
            type: "interactive",
        };
    });
}

function filterByThreshold(threshold: number) {
    // Filter out items with similarity score below the threshold
    return (item: ISemanticSearchResultItem) => {
        return (item.score ?? 0) >= threshold;
    };
}

// helpers

function isItemLocked(item: ISemanticSearchResultItem, workspace: string) {
    return item.workspaceId !== workspace;
}

function isRelationshipLocked(item: ISemanticSearchRelationship, workspace: string) {
    return item.targetWorkspaceId !== workspace;
}

function getParentObjects(relationships: ISemanticSearchRelationship[], item: ISemanticSearchResultItem) {
    return relationships.filter(
        (rel) => rel.targetObjectId === item.id && rel.targetObjectType === item.type,
    );
}

function createListItem<T, R>(
    item: T,
    url?: string,
    isLocked?: boolean,
    parents?: ListItem<R, undefined>[],
): ListItem<T, R> {
    return {
        item,
        parents,
        url,
        isLocked,
    };
}
