// (C) 2026 GoodData Corporation

import { type IInsightLayerDefinition } from "@gooddata/sdk-model";

/**
 * The insight domain owns the currently edited insight's metadata leaves of the `data` branch:
 * `data.title`, `data.tags`, `data.summary`, `data.layers` and `data.layersOwner`.
 *
 * `data` is a SHARED container, so the domain cannot be one slice: each leaf is its own
 * `combineReducers` entry.
 *
 * `tags` and `layers` hold plain arrays on EVERY path — the initial values, the application resets
 * and the open/save payloads alike. A wrong-kind value here fails silently rather than loudly
 * (`[...value]` still iterates, and `value.length` is `undefined > 0 === false`), which is why the
 * report characterization suite asserts the kind.
 *
 * The application resets write the domain's initial values below, through matcher cases on the
 * slices.
 */

export type IInsightTitleState = string;
export const insightTitleInitialState: IInsightTitleState = "";

export type IInsightTagsState = string[];
export const insightTagsInitialState: IInsightTagsState = [];

export type IInsightSummaryState = string;
export const insightSummaryInitialState: IInsightSummaryState = "";

export type IInsightLayersState = IInsightLayerDefinition[];
export const insightLayersInitialState: IInsightLayersState = [];

/** The identifier of the insight the stored layers belong to (see buckets_selector#getStoredLayers). */
export type IInsightLayersOwnerState = string | null;
export const insightLayersOwnerInitialState: IInsightLayersOwnerState = null;
