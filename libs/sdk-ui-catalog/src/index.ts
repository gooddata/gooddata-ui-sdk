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

export type { ICatalogDetailProps } from "./catalogDetail/CatalogDetail.js";
export type { ICatalogDetailAction, EditHandlerEvent, OpenHandlerEvent } from "./catalogDetail/types.js";
export type { ICatalogDetailContentProps } from "./catalogDetail/CatalogDetailContent.js";
export type { ObjectType, CatalogCreateObjectType } from "./objectType/types.js";
export type {
    ICatalogItem,
    ICatalogItemBase,
    ICatalogItemRef,
    ICatalogItemInsight,
    ICatalogItemMeasure,
    ICatalogItemParameter,
    ICatalogItemAttribute,
    ICatalogItemFact,
    ICatalogItemDataSet,
    ICatalogItemDashboard,
    VisualizationType,
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
