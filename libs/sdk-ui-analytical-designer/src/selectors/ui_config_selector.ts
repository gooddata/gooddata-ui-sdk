// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type ChartInlineVisualizationType } from "@gooddata/sdk-ui-ext";
import { type IExtendedReferencePoint } from "@gooddata/sdk-ui-ext/internal";

import { DATE, FILTERS } from "../constants/bucket.js";
import {
    getUiConfigBuckets,
    getUiConfigEmptyCanvasDragTypes,
} from "../store/reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../store/types.js";

export function getReferencePointExtendedBucketsUiConfig(state: IAppState) {
    return getUiConfigBuckets(state);
}

// TODO INE - replace this directly by UI SDK types once they are exported in barrel file
type IBucketsUiConfig = IExtendedReferencePoint["uiConfig"]["buckets"];
type IBucketUiConfig = IBucketsUiConfig[""];

const bucketAcceptsDate = (bucketConfig: IBucketUiConfig) => bucketConfig.accepts?.includes(DATE);

const getNumberOfAllowedDatesInBuckets = (bucketsUiConfig: IBucketsUiConfig): number => {
    return Object.keys(bucketsUiConfig)
        .filter((bucketName: string) => bucketName !== FILTERS) // filter out FILTERS as we check only regular buckets
        .reduce((number: number, bucketName) => {
            const bucketConfig = bucketsUiConfig[bucketName];
            const bucketDateLimit = bucketConfig.itemsLimitByType?.date;
            const numberOfAcceptedDates = bucketAcceptsDate(bucketConfig) ? bucketConfig.itemsLimit : 0;
            if (bucketDateLimit) {
                return number + bucketDateLimit;
            }
            if (numberOfAcceptedDates) {
                return number + numberOfAcceptedDates;
            }
            return number;
        }, 0);
};

export const visualizationAllowsMultipleDateDatasets = createSelector(
    getReferencePointExtendedBucketsUiConfig,
    (bucketsUiConfig: IBucketsUiConfig) => {
        const numberOfAllowedDates = getNumberOfAllowedDatesInBuckets(bucketsUiConfig);
        return numberOfAllowedDates > 1;
    },
);

export function isStaticHyperLinkDisplayFormTextEnabled(
    appState: IAppState,
    { localIdentifier }: { localIdentifier: string },
): boolean {
    const bucketsUiConfig = getReferencePointExtendedBucketsUiConfig(appState);
    if (!bucketsUiConfig) {
        return false;
    }

    const bucketUiConfig: IBucketUiConfig = bucketsUiConfig[localIdentifier];

    return bucketUiConfig?.allowsStaticHyperLinkDisplayFormText || false;
}

export function isSynchronizedDatesPreferred(appState: IAppState, bucketIdentifier: string): boolean {
    const bucketsUiConfig = getReferencePointExtendedBucketsUiConfig(appState);
    if (!bucketsUiConfig) {
        return false;
    }

    const bucketUiConfig = bucketsUiConfig[bucketIdentifier];
    return bucketUiConfig?.preferSynchronizedDates || false;
}

export function selectAllowsInlineVisualizations(
    appState: IAppState,
    { localIdentifier }: { localIdentifier?: string },
): boolean {
    const bucketsUiConfig = getReferencePointExtendedBucketsUiConfig(appState);
    if (!bucketsUiConfig) {
        return false;
    }

    const bucketUiConfig: IBucketUiConfig = bucketsUiConfig[localIdentifier];

    return bucketUiConfig?.allowsInlineVisualizations || false;
}

export function selectSupportedInlineVisualizationTypes(
    appState: IAppState,
    { localIdentifier }: { localIdentifier?: string },
): ChartInlineVisualizationType[] {
    const bucketsUiConfig = getReferencePointExtendedBucketsUiConfig(appState);
    if (!bucketsUiConfig) {
        return [];
    }

    const bucketUiConfig: IBucketUiConfig = bucketsUiConfig[localIdentifier];

    return bucketUiConfig?.supportedInlineVisualizationTypes || [];
}

export function selectDisableMeasureFilters(
    appState: IAppState,
    { localIdentifier }: { localIdentifier?: string },
): boolean {
    const bucketsUiConfig = getReferencePointExtendedBucketsUiConfig(appState);
    if (!bucketsUiConfig) {
        return false;
    }

    const bucketUiConfig: IBucketUiConfig = bucketsUiConfig[localIdentifier];

    return bucketUiConfig?.disableMeasureFilters || false;
}

/**
 * `string[] | undefined`, not `string[]`: the ERP is ABSENT until a pluggable visualization reports
 * one, and the reader passes `undefined` straight through. The sole consumer
 * (components/report/ReportBlank.tsx) already optional-chains it — the old `string[]` was a lie the
 * caller was defending against.
 */
export function selectSupportedEmptyCanvasDragTypes(appState: IAppState): string[] | undefined {
    return getUiConfigEmptyCanvasDragTypes(appState);
}
