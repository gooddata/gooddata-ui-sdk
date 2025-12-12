// (C) 2025 GoodData Corporation

import type { ISemanticSearchResultItem } from "@gooddata/sdk-model";

import { type SearchTreeViewItem } from "../internal/LeveledSearchTreeView.js";

export function thresholdFilter(threshold: number) {
    return (item: ISemanticSearchResultItem) => {
        // Filter out items with similarity score below the threshold
        return (item.score ?? 0) >= threshold;
    };
}

export function permissionsFilter(canEdit: boolean) {
    return (item: SearchTreeViewItem) => {
        //NOTE: This is a workaround for a permissions, if user has only view permission on the dashboard
        // and we found object that is not dashboard has no relationships, we don't want to show it
        if (!canEdit && item.item.data.type !== "dashboard") {
            return (item.children?.length ?? 0) > 0;
        }
        return true;
    };
}
