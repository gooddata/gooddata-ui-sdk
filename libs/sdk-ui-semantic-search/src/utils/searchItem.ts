// (C) 2025 GoodData Corporation
import type { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";

/** @internal */
export function isItemLocked(item: ISemanticSearchResultItem, workspace: string) {
    return item.workspaceId !== workspace;
}

/** @internal */
export function isRelationshipLocked(item: ISemanticSearchRelationship, workspace: string) {
    return item.targetWorkspaceId !== workspace;
}

/** @internal */
export function getItemRelationships(
    item: ISemanticSearchResultItem,
    relationships: ISemanticSearchRelationship[],
) {
    return relationships.filter(
        (rel) =>
            rel.targetObjectId === item.id &&
            rel.targetObjectType === item.type &&
            rel.sourceObjectType === "dashboard",
    );
}
