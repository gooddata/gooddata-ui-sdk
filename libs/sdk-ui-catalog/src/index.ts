// (C) 2025-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

/*
 * Analytics Catalog public API.
 */

export { AnalyticsCatalog, type IAnalyticsCatalogProps } from "./AnalyticsCatalog.js";
export {
    AnalyticsCatalogDetail,
    type IAnalyticsCatalogDetailProps,
    AnalyticsCatalogDetailContent,
    type IAnalyticsCatalogDetailContentProps,
} from "./AnalyticsCatalogDetail.js";
export { AnalyticsCatalogFilter, type IAnalyticsCatalogFilterProps } from "./AnalyticsCatalogFilter.js";

/*
 * Supplementary API.
 */

export { type ICatalogDetailProps } from "./catalogDetail/CatalogDetail.js";
export {
    type ICatalogDetailContentProps,
    type OpenHandlerEvent,
} from "./catalogDetail/CatalogDetailContent.js";

export { type ObjectType } from "./objectType/types.js";
export { type ICatalogItem, type ICatalogItemRef, type VisualizationType } from "./catalogItem/types.js";
