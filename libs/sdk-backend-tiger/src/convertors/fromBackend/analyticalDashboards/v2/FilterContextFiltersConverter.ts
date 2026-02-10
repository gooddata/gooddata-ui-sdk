// (C) 2025-2026 GoodData Corporation

import { type AnalyticalDashboardModelV2, type ITigerFilterContextItem } from "@gooddata/api-client-tiger";
import { type FilterContextItem } from "@gooddata/sdk-model";

import { cloneWithSanitizedIdsTyped } from "../../IdSanitization.js";
import { sanitizeSelectionMode } from "../common/singleSelectionFilter.js";

export function convertFilterContextFilters(
    content: AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    return sanitizeSelectionMode(
        cloneWithSanitizedIdsTyped<ITigerFilterContextItem[], FilterContextItem[]>(content.filters),
    );
}
