// (C) 2025-2026 GoodData Corporation

import type { ISemanticSearchResultItem } from "@gooddata/sdk-model";

export function thresholdFilter(threshold: number) {
    return (item: ISemanticSearchResultItem) => {
        // Filter out items with similarity score below the threshold
        return (item.score ?? 0) >= threshold;
    };
}
