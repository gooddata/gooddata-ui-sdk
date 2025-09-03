// (C) 2025 GoodData Corporation

/*
 * Analytics Catalog public API.
 */

export { AnalyticsCatalog, type IAnalyticsCatalogProps } from "./AnalyticsCatalog.js";
export {
    AnalyticsCatalogDetail,
    type AnalyticsCatalogDetailProps,
    AnalyticsCatalogDetailContent,
    type AnalyticsCatalogDetailContentProps,
} from "./AnalyticsCatalogDetail.js";
export { type CatalogDetailProps } from "./catalogDetail/CatalogDetail.js";
export {
    type CatalogDetailContentProps,
    type OpenHandlerEvent,
} from "./catalogDetail/CatalogDetailContent.js";

export { type ObjectType } from "./objectType/index.js";
export { type ICatalogItem, type ICatalogItemRef } from "./catalogItem/index.js";
