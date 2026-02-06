// (C) 2025-2026 GoodData Corporation

import type { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";

import { thresholdFilter } from "./filters/items.filters.js";
import { type SearchTreeViewItem } from "./internal/LeveledSearchTreeView.js";
import { getItemRelationships } from "./utils/searchItem.js";

type BuildSemanticSearchItemsProps = {
    searchResults: ISemanticSearchResultItem[];
    relationships: ISemanticSearchRelationship[];
    threshold?: number;
};

export function buildSemanticSearchItems({
    searchResults,
    relationships,
    threshold = 0.8,
}: BuildSemanticSearchItemsProps): SearchTreeViewItem[] {
    return searchResults
        .filter(thresholdFilter(threshold))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
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
            const rels = getItemRelationships(item, relationships);
            return {
                item: {
                    id: item.id,
                    stringTitle: item.title,
                    data: item,
                },
                children: rels.map((relationship) => {
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
