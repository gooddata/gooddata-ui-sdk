// (C) 2026 GoodData Corporation

import {
    type IExtendedRefPointBucketUiConfig,
    type IExtendedRefPointUiConfig,
    type IExtendedReferencePointState,
} from "../store/reference_point/extended_reference_point_state.js";

/**
 * TYPED patching of `data.extendedReferencePoint` for test fixtures.
 *
 * Almost every fixture that touches this subtree is answering ONE question — "what did the pluggable
 * visualization say its uiConfig supports?" — so the helpers are named after the uiConfig SECTION they
 * write rather than by a path into it. Each takes a `Partial<...>` of the real section type, so a
 * misspelled flag is a compile error.
 *
 * The containers are MATERIALIZED on the way down: a fixture may start from an ABSENT extended
 * reference point, which is the state before the first plug-viz answer.
 *
 * TEST-ONLY, and named so.
 */

/**
 * The section patch types are SPELLED OUT as mapped types rather than written as `Partial<...>` of
 * the SDK's uiConfig sections. Those sections are not on sdk-ui-ext's internal barrel, so a
 * `Partial<>` of one cannot be NAMED by the declaration emit — the compiler reaches for the deep
 * `node_modules/@gooddata/sdk-ui-ext/esm/...` path and rejects it as non-portable (TS2742). Writing
 * the mapping out gives each helper a nameable declaration here, the same problem
 * `extended_reference_point_state.ts` solves for the uiConfig types themselves.
 */
type IRecommendationsUiConfigPatch = {
    [K in keyof NonNullable<IExtendedRefPointUiConfig["recommendations"]>]?: NonNullable<
        IExtendedRefPointUiConfig["recommendations"]
    >[K];
};

type IOptionalStackingUiConfigPatch = {
    [K in keyof NonNullable<IExtendedRefPointUiConfig["optionalStacking"]>]?: NonNullable<
        IExtendedRefPointUiConfig["optionalStacking"]
    >[K];
};

type IExportConfigUiConfigPatch = {
    [K in keyof NonNullable<IExtendedRefPointUiConfig["exportConfig"]>]?: NonNullable<
        IExtendedRefPointUiConfig["exportConfig"]
    >[K];
};

/** Patches the uiConfig itself — the sections below are the same write, one level deeper. */
export const withUiConfig = (
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    patch: Partial<IExtendedRefPointUiConfig>,
): IExtendedReferencePointState =>
    ({
        ...extendedReferencePoint,
        uiConfig: { ...extendedReferencePoint?.uiConfig, ...patch },
    }) as IExtendedReferencePointState;

/** `uiConfig.recommendations` — which recommendation blocks the visualization offers. */
export const withRecommendationsUiConfig = (
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    patch: IRecommendationsUiConfigPatch,
): IExtendedReferencePointState =>
    withUiConfig(extendedReferencePoint, {
        recommendations: { ...extendedReferencePoint?.uiConfig?.recommendations, ...patch },
    });

/** `uiConfig.openAsReport` — whether the insight may be opened as a report, and why not. */
export const withOpenAsReportUiConfig = (
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    patch: Partial<IExtendedRefPointUiConfig["openAsReport"]>,
): IExtendedReferencePointState =>
    withUiConfig(extendedReferencePoint, {
        openAsReport: { ...extendedReferencePoint?.uiConfig?.openAsReport, ...patch },
    });

/** `uiConfig.optionalStacking` — the stack-measures checkboxes. */
export const withOptionalStackingUiConfig = (
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    patch: IOptionalStackingUiConfigPatch,
): IExtendedReferencePointState =>
    withUiConfig(extendedReferencePoint, {
        optionalStacking: { ...extendedReferencePoint?.uiConfig?.optionalStacking, ...patch },
    });

/** `uiConfig.supportedLocationIcon` — the geo location-icon support pair. */
export const withSupportedLocationIconUiConfig = (
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    patch: Partial<IExtendedRefPointUiConfig["supportedLocationIcon"]>,
): IExtendedReferencePointState =>
    withUiConfig(extendedReferencePoint, {
        supportedLocationIcon: { ...extendedReferencePoint?.uiConfig?.supportedLocationIcon, ...patch },
    });

/** `uiConfig.exportConfig` — whether export is offered. */
export const withExportConfigUiConfig = (
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    patch: IExportConfigUiConfigPatch,
): IExtendedReferencePointState =>
    withUiConfig(extendedReferencePoint, {
        exportConfig: { ...extendedReferencePoint?.uiConfig?.exportConfig, ...patch },
    });

/** `uiConfig.buckets[localIdentifier]` — ONE bucket's drag-and-drop rules. */
export const withBucketUiConfig = (
    extendedReferencePoint: IExtendedReferencePointState | undefined,
    bucketLocalIdentifier: string,
    patch: Partial<IExtendedRefPointBucketUiConfig>,
): IExtendedReferencePointState =>
    withUiConfig(extendedReferencePoint, {
        buckets: {
            ...extendedReferencePoint?.uiConfig?.buckets,
            [bucketLocalIdentifier]: {
                ...extendedReferencePoint?.uiConfig?.buckets?.[bucketLocalIdentifier],
                ...patch,
            },
        },
    });
