// (C) 2025 GoodData Corporation

import { AnalyticalDashboardModelV2 } from "@gooddata/api-client-tiger";
import { FilterContextItem } from "@gooddata/sdk-model";

import { cloneWithSanitizedIds } from "../../IdSanitization.js";
import { sanitizeSelectionMode } from "../common/singleSelectionFilter.js";

export function convertFilterContextFilters(
    content: AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    return sanitizeSelectionMode(cloneWithSanitizedIds(content.filters));
}
