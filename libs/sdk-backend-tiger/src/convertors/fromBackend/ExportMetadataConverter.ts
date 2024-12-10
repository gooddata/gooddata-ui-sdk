// (C) 2023-2024 GoodData Corporation

import { IExportMetadata } from "../../types/index.js";
export const convertExportMetadata = (exportMetadata: any): IExportMetadata | null => {
    // No filters === should use default filters
    if (!exportMetadata?.filters) {
        return null;
    }

    // Filters, or empty filters === override default filters
    return {
        filters: exportMetadata.filters,
    };
};
