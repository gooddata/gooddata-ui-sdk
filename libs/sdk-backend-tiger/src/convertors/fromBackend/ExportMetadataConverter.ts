// (C) 2023-2026 GoodData Corporation

import { isFilterContextItem } from "@gooddata/sdk-model";

import { type FiltersByTab, type IExportMetadata } from "../../types/index.js";
import { convertTigerToSdkFilters } from "../shared/storedFilterConverter.js";

export const convertExportMetadata = (exportMetadata: any): Partial<IExportMetadata> | null => {
    // Filters, or empty filters === override default filters
    return {
        ...(exportMetadata?.filters
            ? {
                  filters:
                      convertTigerToSdkFilters(exportMetadata.filters)?.filter(isFilterContextItem) ?? [],
              }
            : {}),

        ...(exportMetadata?.filtersByTab
            ? {
                  filtersByTab: Object.keys(exportMetadata?.filtersByTab).reduce((acc, tabId) => {
                      acc[tabId] =
                          convertTigerToSdkFilters(exportMetadata?.filtersByTab[tabId])?.filter(
                              isFilterContextItem,
                          ) ?? [];
                      return acc;
                  }, {} as FiltersByTab),
              }
            : {}),
        ...(exportMetadata?.title ? { title: exportMetadata.title } : {}),
        ...(exportMetadata?.hideWidgetTitles ? { hideWidgetTitles: exportMetadata.hideWidgetTitles } : {}),
        ...(exportMetadata?.exportMetadata === undefined
            ? {}
            : { exportMetadata: exportMetadata.exportMetadata }),
    };
};
