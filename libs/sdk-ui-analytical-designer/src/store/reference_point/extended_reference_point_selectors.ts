// (C) 2026 GoodData Corporation

import { type ChartType, type OverTimeComparisonType } from "@gooddata/sdk-ui";

import {
    type IStoredVisualizationProperties,
    type IVisualizationPropertiesControls,
} from "../../typings/properties.js";
import { type IFilter } from "../filter_bar/filter_bar_types.js";
import { type IAppState } from "../types.js";

import {
    type IExtendedRefPointBuckets,
    type IExtendedRefPointBucketsUiConfig,
    type IExtendedRefPointCustomError,
    type IExtendedRefPointUiConfig,
} from "./extended_reference_point_state.js";

/**
 * The extended reference point's read layer.
 *
 * ONE place that knows where the plug-viz round trip's answers live. Every accessor is
 * OPTIONAL-CHAINED PROPERTY ACCESS off the typed root, so every hop is checked against the domain's
 * own state type and a renamed `uiConfig` key is a compile error rather than a silent `undefined`.
 *
 * `data.extendedReferencePoint` is `null` until a pluggable visualization answers, and every field
 * below it is optional — hence the `?.` on every chain. It is not defensive coding: the state type
 * says the value may not be there, and each accessor's return type says the same to its callers.
 *
 * The `notSetValue` defaults are part of the contract: several of them (`canStackInPercent` = true,
 * `axis` = primary) are NOT the falsy default, so they have to live here rather than at each caller.
 * `??` still passes a stored `false`/`0` through.
 */

const erp = (state: IAppState) => state.data.extendedReferencePoint;
const controls = (state: IAppState) => erp(state)?.properties?.controls;
const uiConfig = (state: IAppState) => erp(state)?.uiConfig;
const optionalStacking = (state: IAppState) => uiConfig(state)?.optionalStacking;

// ------------------------------------------------------------------ buckets / filters / props

/**
 * `undefined` when no pluggable visualization has answered yet, and that is LOAD-BEARING: two
 * consumers fall back to the regular buckets with `bucketsExtended || buckets`
 * (`getDecoratedBucketsExtended`, `getUsedDateDatasetsExtendedFromBuckets`), and `[]` is truthy —
 * defaulting here would hide the regular buckets instead. Hence no default, and an OPTIONAL
 * return type so the compiler says so.
 */
export const getExtendedReferencePointBuckets = (state: IAppState): IExtendedRefPointBuckets | undefined =>
    erp(state)?.buckets;

/** The FILTER BAR's filters — the ERP's own `filters` bucket is replaced on write (see the state module). */
export const getExtendedReferencePointFilters = (state: IAppState): ReadonlyArray<IFilter> | undefined =>
    erp(state)?.filters;

export const getExtendedReferencePointProperties = (
    state: IAppState,
): IStoredVisualizationProperties | undefined => erp(state)?.properties;

export const getExtendedReferencePointPropertiesControls = (
    state: IAppState,
): IVisualizationPropertiesControls | undefined => controls(state);

export const isExtendedReferencePointStackToPercent = (state: IAppState): boolean =>
    (controls(state)?.["stackMeasuresToPercent"] as boolean) ?? false;

export const getExtendedReferencePointSecondaryXAxisMeasures = (
    state: IAppState,
    notSetValue: string[],
): string[] =>
    (controls(state)?.["secondary_xaxis"] as { measures?: string[] } | undefined)?.measures ?? notSetValue;

export const getExtendedReferencePointSecondaryYAxisMeasures = (
    state: IAppState,
    notSetValue: string[],
): string[] =>
    (controls(state)?.["secondary_yaxis"] as { measures?: string[] } | undefined)?.measures ?? notSetValue;

// -------------------------------------------------------------------------------- uiConfig

export const getUiConfigBuckets = (state: IAppState): IExtendedRefPointBucketsUiConfig | undefined =>
    uiConfig(state)?.buckets;

/** A single bucket's uiConfig flag, e.g. `allowShowOnSecondaryAxis` for MEASURES. */
export const getUiConfigBucketFlag = <T>(
    state: IAppState,
    bucketLocalIdentifier: string,
    flag: string,
    notSetValue?: T,
): T =>
    ((uiConfig(state)?.buckets?.[bucketLocalIdentifier] as Record<string, unknown> | undefined)?.[
        flag
    ] as T) ?? (notSetValue as T);

export const getUiConfigAxis = (state: IAppState, notSetValue: string): string =>
    uiConfig(state)?.axis ?? notSetValue;

export const getUiConfigCustomError = (state: IAppState): IExtendedRefPointCustomError =>
    uiConfig(state)?.customError as IExtendedRefPointCustomError;

export const getUiConfigEmptyCanvasDragTypes = (state: IAppState): string[] | undefined =>
    uiConfig(state)?.supportedEmptyCanvasDragTypes;

export const isUiConfigExportConfigSupported = (state: IAppState): boolean =>
    uiConfig(state)?.exportConfig?.supported ?? false;

export const isUiConfigNoMetricSupported = (state: IAppState): boolean =>
    uiConfig(state)?.noMetricAccepted?.supported ?? false;

export const getUiConfigSupportedChartTypes = (state: IAppState, notSetValue: ChartType[]): ChartType[] =>
    (uiConfig(state)?.supportedChartTypes as ChartType[]) ?? notSetValue;

export const getUiConfigSupportedOverTimeComparisonTypes = (
    state: IAppState,
    notSetValue: OverTimeComparisonType[],
): OverTimeComparisonType[] => uiConfig(state)?.supportedOverTimeComparisonTypes ?? notSetValue;

export const isUiConfigChartFillSupported = (state: IAppState): boolean =>
    uiConfig(state)?.supportsChartFill ?? false;

export const getUiConfigLocationIcon = (
    state: IAppState,
): IExtendedRefPointUiConfig["supportedLocationIcon"] => uiConfig(state)?.supportedLocationIcon;

export const isUiConfigLocationIconSupported = (state: IAppState): boolean =>
    uiConfig(state)?.supportedLocationIcon?.supported ?? false;

// -------------------------------------------------------------------- uiConfig.optionalStacking

export const isUiConfigOptionalStackingSupported = (state: IAppState): boolean =>
    optionalStacking(state)?.supported ?? false;

export const isUiConfigOptionalStackingDisabled = (state: IAppState): boolean =>
    optionalStacking(state)?.disabled ?? false;

export const getUiConfigOptionalStackingStackMeasures = (state: IAppState, notSetValue?: boolean): boolean =>
    optionalStacking(state)?.stackMeasures ?? (notSetValue as boolean);

export const getUiConfigOptionalStackingStackMeasuresToPercent = (
    state: IAppState,
    notSetValue?: boolean,
): boolean => optionalStacking(state)?.stackMeasuresToPercent ?? (notSetValue as boolean);

/** Defaults to TRUE — a visualization that never reported the flag can stack in percent. */
export const canUiConfigStackInPercent = (state: IAppState): boolean =>
    optionalStacking(state)?.canStackInPercent ?? true;

export const getUiConfigOptionalStackingStackToPercentVisible = (state: IAppState): boolean | undefined =>
    optionalStacking(state)?.stackToPercentVisible;

// ------------------------------------------------------------------- uiConfig.recommendations

export const getUiConfigRecommendation = (state: IAppState, recommendation: string): boolean =>
    ((uiConfig(state)?.recommendations as Record<string, boolean> | undefined)?.[recommendation] ??
        false) as boolean;

export const isFilteringRecommendationSupported = (state: IAppState): boolean =>
    uiConfig(state)?.recommendations?.["supportsFilteringRecommendation"] ?? false;

// --------------------------------------------------------------------- uiConfig.openAsReport

export const isOpenAsReportSupported = (state: IAppState): boolean =>
    uiConfig(state)?.openAsReport?.supported ?? false;

export const getOpenAsReportWarningMessage = (state: IAppState): string =>
    uiConfig(state)?.openAsReport?.warningMessage as string;
