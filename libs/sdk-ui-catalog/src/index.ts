// (C) 2025-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

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
    type EditHandlerEvent,
} from "./catalogDetail/CatalogDetailContent.js";

export type { ObjectType, CatalogCreateObjectType } from "./objectType/types.js";
export {
    type ICatalogItem,
    type ICatalogItemBase,
    type ICatalogItemRef,
    type ICatalogItemInsight,
    type ICatalogItemMeasure,
    type ICatalogItemParameter,
    type ICatalogItemAttribute,
    type ICatalogItemFact,
    type ICatalogItemDataSet,
    type ICatalogItemDashboard,
    type VisualizationType,
} from "./catalogItem/types.js";
export {
    isCatalogItemAttribute,
    isCatalogItemDashboard,
    isCatalogItemDataSet,
    isCatalogItemFact,
    isCatalogItemInsight,
    isCatalogItemMeasure,
    isCatalogItemParameter,
} from "./catalogItem/guards.js";
