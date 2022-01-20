// (C) 2019-2022 GoodData Corporation

/**
 * This package provides the Dashboard component that can be used to embed dashboards into your application as React components.
 *
 * @remarks
 * The component also allows for customization of the embedded dashboard using plugins.
 * See also `@gooddata/sdk-ui-loaders`.
 *
 * @packageDocumentation
 */

// exported only for api-extractor's sake
export { DateFilterConfigValidationResult } from "./_staging/dateFilterConfig/validation";

// ObjRefMap & factories will be part of the public API.. although in different package
export { ObjRefMap, ObjRefMapConfig, newDisplayFormMap } from "./_staging/metadata/objRefMap";

// TODO remove export after values resolver call from KD is obsolete
export { resolveFilterValues } from "./model/commandHandlers/drill/common/filterValuesResolver";

export * from "./model";
export * from "./presentation";
export * from "./types";
export * from "./converters";
export * from "./plugins";

export { InsightPlaceholderWidget, KpiPlaceholderWidget } from "./widgets/placeholders/types";
