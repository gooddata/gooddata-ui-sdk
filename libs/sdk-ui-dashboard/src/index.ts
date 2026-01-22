// (C) 2019-2026 GoodData Corporation

/**
 * This package provides a Dashboard component that enables you to embed dashboards into your application as React components.
 *
 * @remarks
 * The component also allows for customization of the embedded dashboard using plugins.
 * See also `@gooddata/sdk-ui-loaders`.
 *
 * @packageDocumentation
 */

// exported only for api-extractor's sake
export type { DateFilterConfigValidationResult } from "./_staging/dateFilterConfig/validation.js";

// ObjRefMap & factories will be part of the public API.. although in different package
export { type IObjRefMapConfig, ObjRefMap, newDisplayFormMap } from "./_staging/metadata/objRefMap.js";

// TODO remove export after values resolver call from KD is obsolete
export { resolveFilterValues } from "./model/commandHandlers/drill/common/filterValuesResolver.js";

export * from "./model/index.js";
export * from "./presentation/index.js";
export * from "./types.js";
export * from "./converters/index.js";
export * from "./plugins/index.js";
export * from "./widgets/index.js";
export * from "./tools/index.js";
export * from "./kdaDialog/index.js";
