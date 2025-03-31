// (C) 2023-2025 GoodData Corporation

import { IExportMetadata } from "../../types/index.js";
export const convertExportMetadata = (exportMetadata: any): Partial<IExportMetadata> | null => {
    // Filters, or empty filters === override default filters
    return {
        ...(exportMetadata?.filters ? { filters: exportMetadata.filters } : {}),
        ...(exportMetadata?.title ? { title: exportMetadata.title } : {}),
        ...(exportMetadata?.hideWidgetTitles ? { hideWidgetTitles: exportMetadata.hideWidgetTitles } : {}),
    };
};
