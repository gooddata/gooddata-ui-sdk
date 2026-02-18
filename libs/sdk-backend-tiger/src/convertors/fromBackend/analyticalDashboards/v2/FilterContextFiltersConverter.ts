// (C) 2025-2026 GoodData Corporation

import { type AnalyticalDashboardModelV2 } from "@gooddata/api-client-tiger";
import { type FilterContextItem } from "@gooddata/sdk-model";

import { convertTigerToSdkFilters } from "../../../shared/storedFilterConverter.js";
import { sanitizeSelectionMode } from "../common/singleSelectionFilter.js";

export function convertFilterContextFilters(
    content: AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    return sanitizeSelectionMode(convertTigerToSdkFilters(content.filters) ?? []);
}
