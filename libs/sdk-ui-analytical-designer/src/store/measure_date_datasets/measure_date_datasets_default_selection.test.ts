// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { DATE, TREND, VIEW } from "../../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { GRANULARITY } from "../../models/granularity.js";
import {
    bucketsHaveCategoriesWithDateItem,
    getPrimaryDateDatasetRef,
    hasDateFilterInFilterBar,
} from "../../services/buckets_service.js";
import { defaultBuckets } from "../../tests/constants.test.helpers.js";
import { buildDateFilterMock } from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { FilterBarService } from "../filter_bar/filter_bar_service.js";
import { type IAppState } from "../types.js";

import { getDefaultSelectedDateDatasetUri } from "./measure_date_datasets_helpers.js";

/**
 * The measure's DEFAULT date-dataset selection, end to end over a real root state.
 *
 * The rule itself is a narrow pure helper (measure_date_datasets_helpers.ts) and is
 * pinned per input in measure_date_datasets_store.test.ts. What this suite pins is the COMPOSITION
 * the caller performs — `measure_date_filter_selector` resolves exactly these three buckets-domain
 * reads and hands them over — which is the part a refactor can silently mis-wire. It moved here
 * from services/test/measure_date_datasets_service.test.ts when that whole-root facade was deleted.
 */
const defaultSelectedDateDatasetUri = (state: IAppState, availableDateDatasets: IDateDataset[]) =>
    getDefaultSelectedDateDatasetUri(availableDateDatasets, {
        hasDateInBuckets: bucketsHaveCategoriesWithDateItem(state),
        hasDateFilter: hasDateFilterInFilterBar(state),
        primaryDateDatasetRef: getPrimaryDateDatasetRef(state),
    });

describe("the measure's default date dataset", () => {
    const closedDateDataset: IDateDataset = {
        attributes: [
            {
                dfRef: {
                    identifier: "closed.dfIdentifier",
                },
                dateType: GRANULARITY.DATE,
                dfIdentifier: "closed.dfIdentifier",
                dfUri: "closed.dfUri",
                granularity: "",
                uri: "closed.uri",
                ref: uriRef("closed.uri"),
                displayForms: [],
            },
        ],
        id: "closed.dd",
        ref: {
            identifier: "closed.dd",
        },
        identifier: "closed.dd",
        isAvailable: true,
        relevance: 10,
        title: "Closed",
        summary: "",
        type: "",
        uri: "closed.dataseturi",
    };
    const activeDateDataset: IDateDataset = {
        attributes: [
            {
                dateType: GRANULARITY.DATE,
                dfRef: {
                    identifier: "active.dfIdentifier",
                },
                dfIdentifier: "active.dfIdentifier",
                dfUri: "active.dfUri",
                granularity: "",
                uri: "active.uri",
                ref: uriRef("active.uri"),
                displayForms: [],
            },
        ],
        ref: {
            identifier: "active.dd",
        },
        id: "active.dd",
        identifier: "active.dd",
        isAvailable: true,
        relevance: 0,
        title: "Active",
        summary: "",
        type: "",
        uri: "active.dataseturi",
    };
    const snapshotDateDataset: IDateDataset = {
        attributes: [
            {
                dateType: GRANULARITY.DATE,
                dfRef: {
                    identifier: "snapshot.dfIdentifier",
                },
                dfIdentifier: "snapshot.dfIdentifier",
                dfUri: "snapshot.dfUri",
                granularity: "",
                uri: "snapshot.uri",
                ref: uriRef("snapshot.uri"),
                displayForms: [],
            },
        ],
        ref: {
            identifier: "snapshot.dd",
        },
        id: "snapshot.dd",
        identifier: "snapshot.dd",
        isAvailable: true,
        relevance: 0,
        title: "Snapshot",
        summary: "",
        type: "",
        uri: "snapshot.dataseturi",
    };

    const appState = withData(getInitializedState(), { buckets: defaultBuckets });

    describe("getDefaultSelectedDateDatasetUri", () => {
        it("should return most relevant date dataset uri from available date datasets", () => {
            const availableDateDatasets = [activeDateDataset, closedDateDataset, snapshotDateDataset];

            expect(defaultSelectedDateDatasetUri(appState, availableDateDatasets)).toEqual(
                closedDateDataset.uri,
            );
        });

        it("should return global date dataset uri if global date filter is available", () => {
            const availableDateDatasets = [activeDateDataset, closedDateDataset, snapshotDateDataset];

            let updatedState = appState;

            updatedState = FilterBarService.addFilter(
                updatedState,
                buildDateFilterMock({
                    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
                    dateDatasetRef: snapshotDateDataset.ref,
                }),
            );

            expect(defaultSelectedDateDatasetUri(updatedState, availableDateDatasets)).toEqual(
                snapshotDateDataset.uri,
            );
        });

        it("should return most relevant date dataset uri if global date filter is available, but global date dataset is not one of available", () => {
            const availableDateDatasets = [activeDateDataset, closedDateDataset];

            let updatedState = appState;

            updatedState = FilterBarService.addFilter(
                updatedState,
                FilterBarService.createDateFilter(snapshotDateDataset.ref),
            );

            expect(defaultSelectedDateDatasetUri(updatedState, availableDateDatasets)).toEqual(
                closedDateDataset.uri,
            );
        });

        it("should return its date dataset uri if date is in view by", () => {
            const availableDateDatasets = [activeDateDataset, closedDateDataset, snapshotDateDataset];

            let updatedState = appState;

            updatedState = withData(appState, {
                dateDatasets: { ...appState.data.dateDatasets, available: availableDateDatasets },
            });

            updatedState = withData(updatedState, {
                buckets: [
                    {
                        localIdentifier: VIEW,
                        items: [
                            {
                                attribute: DATE_DATASET_ATTRIBUTE,
                                type: DATE,
                                dateDatasetRef: activeDateDataset.ref,
                            },
                        ],
                    },
                ],
            });

            expect(defaultSelectedDateDatasetUri(updatedState, availableDateDatasets)).toEqual(
                activeDateDataset.uri,
            );
        });

        it("should return its date dataset uri if date is in trend by", () => {
            const availableDateDatasets = [activeDateDataset, closedDateDataset, snapshotDateDataset];

            let updatedState = appState;

            updatedState = withData(appState, {
                dateDatasets: { ...appState.data.dateDatasets, available: availableDateDatasets },
            });

            updatedState = withData(updatedState, {
                buckets: [
                    {
                        localIdentifier: TREND,
                        items: [
                            {
                                attribute: DATE_DATASET_ATTRIBUTE,
                                type: DATE,
                                dateDatasetRef: activeDateDataset.ref,
                            },
                        ],
                    },
                ],
            });

            expect(defaultSelectedDateDatasetUri(updatedState, availableDateDatasets)).toEqual(
                activeDateDataset.uri,
            );
        });

        it("should return most relevant date dataset uri if date is in view by, but its date dataset is not one of available", () => {
            const availableDateDatasets = [activeDateDataset, closedDateDataset];

            const updatedState = withData(appState, {
                buckets: [
                    {
                        localIdentifier: VIEW,
                        items: [
                            {
                                attribute: DATE_DATASET_ATTRIBUTE,
                                type: DATE,
                                dateDatasetRef: snapshotDateDataset.ref,
                            },
                        ],
                    },
                ],
            });

            expect(defaultSelectedDateDatasetUri(updatedState, availableDateDatasets)).toEqual(
                closedDateDataset.uri,
            );
        });
    });
});
