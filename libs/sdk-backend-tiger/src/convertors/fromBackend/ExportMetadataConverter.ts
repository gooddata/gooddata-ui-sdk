// (C) 2023-2025 GoodData Corporation

import { IExportMetadata } from "../../types/index.js";
import { cloneWithSanitizedIds } from "./IdSanitization.js";

export const convertExportMetadata = (
    exportMetadata: any,
    enableAutomationFilterContext: boolean,
): Partial<IExportMetadata> | null => {
    // Filters, or empty filters === override default filters
    return {
        ...(exportMetadata?.filters
            ? {
                  filters: enableAutomationFilterContext
                      ? exportMetadata.filters.map(cloneWithSanitizedIds)
                      : exportMetadata.filters,
              }
            : {}),
        ...(exportMetadata?.title ? { title: exportMetadata.title } : {}),
        ...(exportMetadata?.hideWidgetTitles ? { hideWidgetTitles: exportMetadata.hideWidgetTitles } : {}),
    };
};
