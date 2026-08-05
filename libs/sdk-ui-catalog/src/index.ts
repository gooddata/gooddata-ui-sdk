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
 * Visualization as-code codec injection. The host supplies the Tiger-coupled AAC codec so this package
 * stays backend-agnostic; without it, visualizations fall back to Analytical Designer.
 */
export {
    InsightCodecProvider,
    type IInsightCodec,
    type VisualizationTypePredicate,
} from "./insight/insightCodecContext.js";
// Re-exported so the `IInsightCodec` rollup resolves.
export type {
    IAsCodeEditing,
    AsCodeSerialization,
    AsCodeValidation,
    AsCodeValidationContext,
} from "./asCode/descriptor.js";

/*
 * Supplementary API.
 */

export type { ICatalogDetailProps } from "./catalogDetail/CatalogDetail.js";
export type { EditHandlerEvent, OpenHandlerEvent } from "./catalogDetail/types.js";
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
