// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IBootstrapData } from "../actions/app_context_actions.js";
import { METRIC } from "../constants/bucket.js";
import { DecoratedDateDataset } from "../models/decorated_date_dataset.js";
import { DateDatasetsMetaService } from "../services/date_datasets_meta_service.js";
import { getDefaultSelectedDateDatasetUri } from "../store/measure_date_datasets/measure_date_datasets_helpers.js";
import {
    activityDateDataset,
    closedDateDataset,
    dateDatasetsMeta,
    decoratedClosedDateDatasetRefWithoutRelevance,
    seedDateDatasetsMeta,
} from "../tests/constants.test.helpers.js";
import {
    seedMeasureDateDatasetSelectedUri,
    seedMeasureDateDatasetStatus,
} from "../tests/measure_date_datasets.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";
import { type IDecoratedBucketItem } from "../typings/buckets.js";
import { type PartialRecursive } from "../typings/type_utils.js";

import { measureDateFilterSelector } from "./measure_date_filter_selector.js";

const initialState = getInitializedState();

describe("measureDateFilterSelector", () => {
    const measureIdentifier = "m1";
    const availableDateDatasets = [activityDateDataset, closedDateDataset];

    it("returns object with required properties", () => {
        const bootstrapResource: PartialRecursive<IBootstrapData> = {
            project: {
                timezoneOffset: 62,
            },
        };
        const stateWithProjectTimezoneOffset = withRoot(initialState, {
            bootstrapData: bootstrapResource as unknown as IBootstrapData,
        });
        let appState = seedMeasureDateDatasetStatus(
            stateWithProjectTimezoneOffset,
            measureIdentifier,
            availableDateDatasets,
            42,
        );

        appState = seedDateDatasetsMeta(appState, dateDatasetsMeta);

        const selectorResult = measureDateFilterSelector(appState, {
            bucketItem: { localIdentifier: measureIdentifier } as IDecoratedBucketItem,
        });
        expect(selectorResult).toEqual({
            projectTimezoneOffset: 62,
            selectedDateDataset: decoratedClosedDateDatasetRefWithoutRelevance,
            dateDatasetsList: [
                DecoratedDateDataset.createDecorated(activityDateDataset),
                DecoratedDateDataset.createDecorated(closedDateDataset),
            ],
            dateDatasetsUnavailableCount: 42,
            dateDatasetsIsLoading: false,
            dateFormat: "MM/dd/yyyy",
            isDisabled: false,
            isDateDatasetsDropdownLoaded: false,
            enableUnavailableItemsVisibility: false,
            activeCalendars: undefined,
            dateDatasetRefsWithGranularities: [
                {
                    ref: { uri: activityDateDataset.uri },
                    attributes: [],
                },
                {
                    ref: { uri: closedDateDataset.uri },
                    attributes: [],
                },
            ],
        });
    });

    describe("selected date dataset", () => {
        /**
         * The measure's availability names a date dataset the date-datasets META does not carry —
         * the two come from different requests, so they can disagree. Neither meta lookup then finds
         * an item, so any `.uri` read must come AFTER the absence check.
         *
         * Note the premise the availability list has to satisfy: with an EMPTY list `Array.find`
         * never invokes the predicate, so the unsafe read is not even reached.
         */
        it("answers null when the date-datasets meta does not carry the available date dataset", () => {
            const datasetMissingFromMeta = {
                ...activityDateDataset,
                uri: "/gdc/md/project/obj/not-in-meta",
                identifier: "not.in.meta",
            };
            const appState = seedDateDatasetsMeta(
                seedMeasureDateDatasetStatus(initialState, measureIdentifier, [datasetMissingFromMeta], 0),
                dateDatasetsMeta,
            );

            // premise: the availability is non-empty, so the predicate does run
            expect(
                measureDateFilterSelector(appState, {
                    bucketItem: { localIdentifier: measureIdentifier } as IDecoratedBucketItem,
                }).dateDatasetsList,
            ).toHaveLength(1);

            expect(
                measureDateFilterSelector(appState, {
                    bucketItem: { localIdentifier: measureIdentifier } as IDecoratedBucketItem,
                }).selectedDateDataset,
            ).toBe(null);
        });

        it("should return selected date dataset", () => {
            let appState = seedMeasureDateDatasetStatus(
                initialState,
                measureIdentifier,
                availableDateDatasets,
                1,
            );

            appState = seedMeasureDateDatasetSelectedUri(appState, measureIdentifier, closedDateDataset.uri);
            appState = seedDateDatasetsMeta(appState, dateDatasetsMeta);

            const selectorResult = measureDateFilterSelector(appState, {
                bucketItem: { localIdentifier: "m1" } as IDecoratedBucketItem,
            });

            expect(selectorResult.selectedDateDataset).toEqual(decoratedClosedDateDatasetRefWithoutRelevance);
        });

        it("should return default selected date dataset if nothing was already selected", () => {
            const measureIdentifier = "m1";
            let appState = seedMeasureDateDatasetStatus(
                initialState,
                measureIdentifier,
                availableDateDatasets,
                1,
            );
            appState = seedDateDatasetsMeta(appState, dateDatasetsMeta);

            const selectorResult = measureDateFilterSelector(appState, {
                bucketItem: { localIdentifier: "m1" } as IDecoratedBucketItem,
            });

            const selectedDateDatasetUri = DateDatasetsMetaService.getDateDatasetUriByIdentifier(
                appState,
                selectorResult.selectedDateDataset.identifier,
            );

            expect(selectedDateDatasetUri).toEqual(
                getDefaultSelectedDateDatasetUri(availableDateDatasets, {
                    hasDateInBuckets: false,
                    hasDateFilter: false,
                    primaryDateDatasetRef: undefined,
                }),
            );
        });

        it("should return default when selected date dataset uri does not match with available date datasets", () => {
            const measureIdentifier = "m1";
            let appState = seedMeasureDateDatasetStatus(
                initialState,
                measureIdentifier,
                availableDateDatasets,
                1,
            );
            appState = seedMeasureDateDatasetSelectedUri(appState, measureIdentifier, "unavailableUri");
            appState = seedDateDatasetsMeta(appState, dateDatasetsMeta);

            const selectorResult = measureDateFilterSelector(appState, {
                bucketItem: { localIdentifier: "m1" } as IDecoratedBucketItem,
            });

            const selectedDateDatasetUri = DateDatasetsMetaService.getDateDatasetUriByIdentifier(
                appState,
                selectorResult.selectedDateDataset.identifier,
            );

            expect(selectedDateDatasetUri).toEqual(
                getDefaultSelectedDateDatasetUri(availableDateDatasets, {
                    hasDateInBuckets: false,
                    hasDateFilter: false,
                    primaryDateDatasetRef: undefined,
                }),
            );
        });
    });

    describe("isDisabled", () => {
        it("should return selected date dataset", () => {
            const masterMeasureItem = {
                localIdentifier: "m1",
                type: METRIC,
            };
            const derivedMeasureItem = {
                localIdentifier: "m1_derived",
                masterLocalIdentifier: "m1",
                type: METRIC,
            };

            const stateWithMasterAndDerived = withData(initialState, {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [masterMeasureItem, derivedMeasureItem],
                    },
                ],
            });

            const selectorResult = measureDateFilterSelector(stateWithMasterAndDerived, {
                bucketItem: { localIdentifier: "m1" } as IDecoratedBucketItem,
            });

            expect(selectorResult.isDisabled).toBe(true);
        });
    });
});
