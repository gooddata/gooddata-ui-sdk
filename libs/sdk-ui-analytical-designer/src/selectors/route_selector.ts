// (C) 2007-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { createSelector } from "reselect";

import { type ExplainConfig } from "@gooddata/sdk-backend-spi";
import { idRef, objRefToString } from "@gooddata/sdk-model";
import { parseStringToArray } from "@gooddata/util";

import { DEFAULT_REPORT_ID } from "../constants/route_params.js";
import { getAppReadyState } from "../store/app_context/app_context_selectors.js";
import {
    getLocationRedirectLock,
    getPreviousRouteProjectId,
    getPreviousRouteQueryDataset,
    getPreviousRouteQueryExclude,
    getPreviousRouteQueryInclude,
    getPreviousRouteQuerySourceInsight,
    getPreviousRouteReportId,
    getRouteExplainRequested,
    getRouteForceReload,
    getRouteProjectId as getRouteProjectIdState,
    getRouteQueryAllowDashboardLinks,
    getRouteQueryAsOfDate as getRouteQueryAsOfDateState,
    getRouteQueryDataset,
    getRouteQueryExclude,
    getRouteQueryExplainType,
    getRouteQueryInclude,
    getRouteQueryIsEmbeddedFromKD,
    getRouteQueryShowEmbedButton,
    getRouteQuerySourceDashboard,
    getRouteQuerySourceInsight,
    getRouteReportId,
} from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";
import { type ITagsConfiguration } from "../typings/route.js";

import { getIsEmbedded } from "./meta_selector.js";

export function getDataSet(state: IAppState): string | undefined {
    return getRouteQueryDataset(state);
}

export function getPreviousDataSet(state: IAppState) {
    return getPreviousRouteQueryDataset(state);
}

/**
 * `undefined` before the first LOCATION_CHANGED and after a bare SET_ROUTE_PROJECT_ID — the router
 * deliberately does NOT materialize a reportId there, because `isReportChangedToDefault` uses its
 * absence to decide the first-navigation whole-app reset (pinned in router_navigation.test.ts). So the
 * type says so rather than asserting the state away; it does NOT default to DEFAULT_REPORT_ID,
 * which would change that reset decision.
 */
export function getReportId(state: IAppState): string | undefined {
    return getRouteReportId(state);
}

export function getPreviousReportId(state: IAppState) {
    return getPreviousRouteReportId(state);
}

export function reportIdParamChanged(state: IAppState) {
    const reportId = getReportId(state);
    const prevReportId = getPreviousReportId(state);

    return prevReportId !== reportId && reportId !== DEFAULT_REPORT_ID;
}

export function getRouteProjectId(state: IAppState) {
    return getRouteProjectIdState(state);
}

export function isSourceInsightParamChanged(state: IAppState) {
    const reportId = getReportId(state);
    const sourceInsightId = getSourceInsightId(state);
    const prevSourceInsightId = getPreviousSourceInsightId(state);

    return reportId === DEFAULT_REPORT_ID && sourceInsightId && sourceInsightId !== prevSourceInsightId;
}

export function datasetParamChanged(state: IAppState): boolean {
    return getDataSet(state) !== getPreviousDataSet(state);
}

function isMissingProjectId(state: IAppState) {
    return !getRouteProjectIdState(state);
}

function isChangedProjectId(state: IAppState) {
    return getRouteProjectIdState(state) !== getPreviousRouteProjectId(state);
}

const parseTagsString = (tags: string) => (parseStringToArray(tags) || []).map((tagId) => idRef(tagId));

const createTagsConfiguration = (include: string, exclude: string): ITagsConfiguration => {
    const includeObjectsWithTags = parseTagsString(include);
    const excludeObjectsWithTags = parseTagsString(exclude);

    return {
        includeObjectsWithTags,
        excludeObjectsWithTags,
    };
};

// The two inputs stay SEPARATE scalar selectors on purpose: memoizing on the query OBJECT would
// recompute (and hand out a fresh tags configuration) whenever any unrelated query param changes.
export const getTagsConfiguration = createSelector(
    (state: IAppState) => getRouteQueryInclude(state) as string,
    (state: IAppState) => getRouteQueryExclude(state) as string,
    createTagsConfiguration,
);

/**
 * The route tag scope (include / exclude object tags) as strings. The pluggable host shell passes it
 * to its AI assistant so the host's object search stays within the same tag filter AD applies to
 * its catalog.
 */
export interface IAiAssistantTagScope {
    includeTags?: string[];
    excludeTags?: string[];
}

export const selectAiAssistantTagScope = createSelector(
    getTagsConfiguration,
    (tagsConfiguration): IAiAssistantTagScope => ({
        includeTags: tagsConfiguration?.includeObjectsWithTags?.map(objRefToString),
        excludeTags: tagsConfiguration?.excludeObjectsWithTags?.map(objRefToString),
    }),
);

export const getPreviousTagsConfiguration = createSelector(
    (state: IAppState) => getPreviousRouteQueryInclude(state) as string,
    (state: IAppState) => getPreviousRouteQueryExclude(state) as string,
    createTagsConfiguration,
);

export const isTagsConfigurationChanged = createSelector(
    getTagsConfiguration,
    getPreviousTagsConfiguration,
    (tagsConfiguration, previousTagsConfiguration): boolean => {
        return !isEqual(tagsConfiguration, previousTagsConfiguration);
    },
);

export function isAppLoading(state: IAppState) {
    return !getAppReadyState(state);
}

export function isForceReload(state: IAppState) {
    return !!getRouteForceReload(state);
}

export function isFullReloadNeeded(state: IAppState) {
    return [isMissingProjectId, isChangedProjectId, isForceReload, isAppLoading].some((rule) => rule(state));
}

export function isLocationChangeLocked(state: IAppState) {
    return getLocationRedirectLock(state);
}

export function isExplainRequested(state: IAppState): boolean {
    return !!getRouteExplainRequested(state);
}

export function getExplainType(state: IAppState): ExplainConfig<undefined>["explainType"] {
    return getRouteQueryExplainType(state)?.toUpperCase() as ExplainConfig<undefined>["explainType"];
}

export const getDatasetIdentifier = (state: IAppState): string | undefined =>
    getRouteQueryDataset(state) || undefined;

export function getSourceDashboardId(state: IAppState): string {
    return getRouteQuerySourceDashboard(state) as string;
}

export const getSourceInsightId = (state: IAppState): string | undefined => getRouteQuerySourceInsight(state);

export const getPreviousSourceInsightId = (state: IAppState): string | undefined =>
    getPreviousRouteQuerySourceInsight(state);

export function isAllowedDashboardLinks(state: IAppState): boolean {
    return getRouteQueryAllowDashboardLinks(state) === "true";
}

export function isEmbeddedFromKD(state: IAppState): boolean {
    return getRouteQueryIsEmbeddedFromKD(state) === "true";
}

export function isEmbedButtonVisibilityForcedByURLParam(state: IAppState): boolean {
    return getRouteQueryShowEmbedButton(state) === "true";
}

export function getRouteQueryAsOfDate(state: IAppState): string | undefined {
    return getRouteQueryAsOfDateState(state);
}

export const isEditFromKD = createSelector(
    getIsEmbedded,
    getSourceDashboardId,
    (isEmbedded, sourceDashboardId) => {
        return isEmbedded && sourceDashboardId !== undefined;
    },
);

export const isExploreFromKD = createSelector(
    getIsEmbedded,
    getSourceInsightId,
    (isEmbedded, sourceInsightId) => {
        return isEmbedded && sourceInsightId !== undefined;
    },
);
