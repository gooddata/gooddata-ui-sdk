// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { MeasureDateDatasetsActions } from "../../actions/measure_date_datasets_actions.js";
import { GRANULARITY } from "../../models/granularity.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { activityDateDataset, closedDateDataset } from "../../tests/constants.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { type IAppState } from "../types.js";

import {
    getDefaultSelectedDateDatasetUri,
    getStatusFromState,
    setSelectedByIdentifierInState,
    setSelectedInState,
} from "./measure_date_datasets_helpers.js";
import {
    getMeasureDateDatasetStatus,
    getMeasureDateDatasetsState,
} from "./measure_date_datasets_selectors.js";
import { type IMeasureDateDatasetsState } from "./measure_date_datasets_state.js";

/** Drives the real root reducer, so the slice is exercised through its mount. */
describe("measureDateDatasets store", () => {
    const localIdentifier = "m1";
    const testDateDataset: IDateDataset = {
        attributes: [
            {
                dateType: GRANULARITY.DATE,
                dfRef: {
                    identifier: "dfIdentifier",
                },
                dfIdentifier: "dfIdentifier",
                dfUri: "dfUri",
                granularity: "",
                uri: "uri",
                ref: uriRef("uri"),
                displayForms: [],
            },
        ],
        ref: {
            identifier: "dd1",
        },
        id: "dd1",
        identifier: "dd1",
        isAvailable: true,
        relevance: 1,
        title: "Test date dataset",
        summary: "",
        type: "",
        uri: "dataseturi",
    };

    const finishedState = (state: IAppState = getInitializedState()) =>
        rootReducer(
            state,
            MeasureDateDatasetsActions.measureDateDatasetsFinished(
                localIdentifier,
                [activityDateDataset, closedDateDataset],
                1,
            ),
        );

    it("should not modify the subtree upon the saga-only REQUESTED action", () => {
        const state = getInitializedState();
        const newState = rootReducer(
            state,
            MeasureDateDatasetsActions.measureDateDatasetsRequested(localIdentifier),
        );

        expect(newState.data.measuresDateDatasets).toBe(state.data.measuresDateDatasets);
    });

    it("should set 'isLoading' flag to true for given measure identifier upon loading start", () => {
        const newState = rootReducer(
            getInitializedState(),
            MeasureDateDatasetsActions.measureDateDatasetsStarted(localIdentifier),
        );

        expect(getMeasureDateDatasetsState(newState)).toEqual({
            [localIdentifier]: { isLoading: true },
        });
    });

    it("should set 'isLoading' flag to false for given measure identifier on loading error", () => {
        const newState = rootReducer(
            getInitializedState(),
            MeasureDateDatasetsActions.measureDateDatasetsError(localIdentifier),
        );

        expect(getMeasureDateDatasetsState(newState)).toEqual({
            [localIdentifier]: { isLoading: false },
        });
    });

    it("should set date datasets for given measure identifier and set 'isLoading' flag to false upon successful date data sets request", () => {
        const availableDateDatasets = [testDateDataset];
        const unavailableDateDatasetsCount = 0;
        const newState = rootReducer(
            getInitializedState(),
            MeasureDateDatasetsActions.measureDateDatasetsFinished(
                localIdentifier,
                availableDateDatasets,
                unavailableDateDatasetsCount,
            ),
        );

        expect(getMeasureDateDatasetsState(newState)).toEqual({
            [localIdentifier]: {
                availableDateDatasets,
                isLoading: false,
                unavailableDateDatasetsCount,
            },
        });
    });

    it("should preserve a previously selected date dataset when the availability reloads", () => {
        let state = finishedState();
        state = rootReducer(
            state,
            MeasureDateDatasetsActions.selectDateDataset(localIdentifier, closedDateDataset.identifier),
        );

        const reloaded = finishedState(state);

        expect(getMeasureDateDatasetStatus(reloaded, localIdentifier).selectedDateDatasetUri).toEqual(
            closedDateDataset.uri,
        );
        expect(getMeasureDateDatasetStatus(reloaded, localIdentifier).isLoading).toBe(false);
    });

    it("should set selected date dataset for the measure", () => {
        const newState = rootReducer(
            finishedState(),
            MeasureDateDatasetsActions.selectDateDataset(localIdentifier, closedDateDataset.identifier),
        );

        expect(getMeasureDateDatasetStatus(newState, localIdentifier).selectedDateDatasetUri).toEqual(
            closedDateDataset.uri,
        );
    });

    it("should set selected date dataset without time travel for the measure", () => {
        const newState = rootReducer(
            finishedState(),
            MeasureDateDatasetsActions.selectDateDatasetWithoutTimeTravel(
                localIdentifier,
                closedDateDataset.identifier,
            ),
        );

        expect(getMeasureDateDatasetStatus(newState, localIdentifier).selectedDateDatasetUri).toEqual(
            closedDateDataset.uri,
        );
    });

    it("should ignore a select of a date dataset the measure does not have available, preserving identity", () => {
        const state = finishedState();
        const newState = rootReducer(
            state,
            MeasureDateDatasetsActions.selectDateDataset(localIdentifier, "unknown.dd"),
        );

        expect(newState.data.measuresDateDatasets).toBe(state.data.measuresDateDatasets);
    });

    it("should re-establish subtree identity on repeated no-op dispatches", () => {
        const once = finishedState();
        const twice = finishedState(once);
        expect(twice.data.measuresDateDatasets).toBe(once.data.measuresDateDatasets);

        const started = rootReducer(
            once,
            MeasureDateDatasetsActions.measureDateDatasetsStarted(localIdentifier),
        );
        const startedAgain = rootReducer(
            started,
            MeasureDateDatasetsActions.measureDateDatasetsStarted(localIdentifier),
        );
        expect(startedAgain.data.measuresDateDatasets).toBe(started.data.measuresDateDatasets);
    });

    it("stores the statuses plain, so the RTK dev checks can walk the subtree", () => {
        let state = finishedState();
        state = rootReducer(
            state,
            MeasureDateDatasetsActions.selectDateDataset(localIdentifier, closedDateDataset.identifier),
        );

        const subtree = state.data.measuresDateDatasets;
        Object.values(subtree as Record<string, { availableDateDatasets?: unknown }>).forEach((status) => {
            expect(Array.isArray(status.availableDateDatasets)).toBe(true);
        });
    });

    /**
     * The EXTERNAL writers (the bucket-filters operations and open-report) call the same helpers
     * over this subtree, so what is pinned here is the SUBTREE contract every write path shares with
     * the slice. Their call sites are pinned in their own suites.
     */
    describe("the subtree contract the external writers share with the slice", () => {
        const subtreeOf = (state: IAppState) => state.data.measuresDateDatasets as IMeasureDateDatasetsState;

        it("setSelectedInState writes the same plain shape the slice writes", () => {
            const subtree = setSelectedInState(
                subtreeOf(finishedState()),
                localIdentifier,
                closedDateDataset.uri,
            );

            expect(getStatusFromState(subtree, localIdentifier).selectedDateDatasetUri).toEqual(
                closedDateDataset.uri,
            );
        });

        it("setSelectedByIdentifierInState resolves within the measure's own availability", () => {
            const subtree = setSelectedByIdentifierInState(
                subtreeOf(finishedState()),
                localIdentifier,
                activityDateDataset.identifier,
            );

            expect(getStatusFromState(subtree, localIdentifier).selectedDateDatasetUri).toEqual(
                activityDateDataset.uri,
            );
        });

        it("clears the selection when the reset writes `undefined` (the remove-filter path)", () => {
            const selected = setSelectedInState(
                subtreeOf(finishedState()),
                localIdentifier,
                closedDateDataset.uri,
            );
            const subtree = setSelectedInState(selected, localIdentifier, undefined);

            expect(getStatusFromState(subtree, localIdentifier).selectedDateDatasetUri).toEqual(undefined);
            // the getter fills defaults, so it reads `undefined` for an absent AND a
            // present-undefined key — assert the stronger stored contract setSelectedInState
            // documents: the key is REMOVED, keeping the entry clean for serializableCheck
            expect(subtree[localIdentifier]).not.toHaveProperty("selectedDateDatasetUri");
        });
    });

    describe("getDefaultSelectedDateDatasetUri — the inputs are arguments", () => {
        const availableDateDatasets = [activityDateDataset, closedDateDataset];

        it("answers the most relevant available dataset when the insight uses no dates", () => {
            expect(
                getDefaultSelectedDateDatasetUri(availableDateDatasets, {
                    hasDateInBuckets: false,
                    hasDateFilter: false,
                    primaryDateDatasetRef: closedDateDataset.ref,
                }),
            ).toEqual(closedDateDataset.uri);
        });

        it("answers the PRIMARY dataset when the buckets hold a date and it is available", () => {
            expect(
                getDefaultSelectedDateDatasetUri(availableDateDatasets, {
                    hasDateInBuckets: true,
                    hasDateFilter: false,
                    primaryDateDatasetRef: activityDateDataset.ref,
                }),
            ).toEqual(activityDateDataset.uri);
        });

        it("answers the PRIMARY dataset when only the filter bar holds a date filter", () => {
            expect(
                getDefaultSelectedDateDatasetUri(availableDateDatasets, {
                    hasDateInBuckets: false,
                    hasDateFilter: true,
                    primaryDateDatasetRef: activityDateDataset.ref,
                }),
            ).toEqual(activityDateDataset.uri);
        });

        it("falls back to the most relevant one when the primary dataset is not available here", () => {
            expect(
                getDefaultSelectedDateDatasetUri([activityDateDataset], {
                    hasDateInBuckets: true,
                    hasDateFilter: true,
                    primaryDateDatasetRef: closedDateDataset.ref,
                }),
            ).toEqual(activityDateDataset.uri);
        });

        it("has no answer when the measure has no date dataset available at all", () => {
            expect(
                getDefaultSelectedDateDatasetUri([], {
                    hasDateInBuckets: true,
                    hasDateFilter: false,
                    primaryDateDatasetRef: closedDateDataset.ref,
                }),
            ).toEqual(undefined);
        });
    });
});
