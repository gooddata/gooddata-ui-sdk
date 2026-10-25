// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type VisualizationProperties,
    idRef,
    newMeasure,
    newRelativeDateFilter,
    uriRef,
} from "@gooddata/sdk-model";

import { openReportStarted } from "../../actions/open_actions.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { initialState } from "../../reducers/initial_state.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import {
    activityDateDataset,
    bucketFiltersWithSelection,
    closedDateDataset,
    dateCreated,
    dateDatasetsAvailable,
    insightWithMeasuresWithVariousTypesOfFilters,
    measuresWithDateFilter,
    metadataBucketCategoriesWithDate,
    metadataBucketStacksItems,
    pieVisualizationClass,
    seedDateDatasetsMeta,
    tableVisualizationClass,
} from "../../tests/constants.test.helpers.js";
import { newInsight } from "../../tests/insightMocking.test.helpers.js";
import { withData, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IRawBuckets } from "../../typings/buckets.js";
import { type ILoadedReportItems } from "../../typings/report.js";
import { type ICatalogEntries } from "../../typings/state_objects.js";
import { buildOpenReportFinished } from "../../utils/open_report_actions.js";
import { getMeasureDateDatasetsState } from "../measure_date_datasets/measure_date_datasets_selectors.js";
import { type IAppState } from "../types.js";

import { getSelectedDateDataset } from "./open_report_operation.js";

/**
 * THE OPEN-REPORT ORACLE. Every pin drives the REAL chain — the action is built through the saga's
 * own boundary (`resolveOpenReportResult` via `buildOpenReportFinished`) and applied by
 * `rootReducer` — so what is pinned is the operation AND the owning slices consuming its result.
 */
const openReport = (state: IAppState, action: Parameters<typeof rootReducer>[1]): IAppState =>
    rootReducer(state, action);

describe("the open-report operation", () => {
    describe("#OPEN_REPORT_STARTED", () => {
        it("should delete extended reference point", () => {
            const action = openReportStarted("projectId", "reportId");

            const state = withData(initialState, { extendedReferencePoint: {} });
            const updatedState = openReport(state, action);

            expect(updatedState.data.extendedReferencePoint).toBeNull();
        });
    });

    // #OPEN_REPORT_FAILED is one of the application resets — its pins live with
    // the reset inventory (store/app_context/test/application_reset.test.ts) and the owning
    // domain suites (execution NOT_FOUND, referencePoint.reportNotFound).

    describe("#OPEN_REPORT_FINISHED", () => {
        function getOpenReportFinishedAction(
            state: IAppState,
            // a string is the INVALID input one scenario feeds the normalization
            properties?: VisualizationProperties | string,
            useDefaultClass = false,
            loadedItemCache?: ICatalogEntries,
        ) {
            const loadedItems: ILoadedReportItems = {
                itemCache: {
                    "attribute.id": {
                        identifier: "attribute.id",
                        dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
                        dfRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/952"),
                    },
                },
                filterItems: {
                    "/gdc/md/TeamOneGoodSales1/obj/952": {
                        items: [
                            { uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168282", title: "element" },
                            { uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=168284", title: "element" },
                            { uri: "/gdc/md/TeamOneGoodSales1/obj/949/elements?id=964771", title: "element" },
                        ],
                        total: 3,
                    },
                },
                allDateDatasets: { available: [dateCreated], unavailable: 0 },
                availableDateDatasets: { available: [dateCreated], unavailable: 0 },
                parameterFilters: [],
                parameterWarnings: [],
            };
            if (loadedItemCache) {
                loadedItems.itemCache = loadedItemCache;
            }

            const insight = newInsight("local:table", "foo", "/gdc/md/vo1", (i) =>
                i
                    .title("foo")
                    .filters(bucketFiltersWithSelection)
                    .properties((properties || {}) as VisualizationProperties),
            );

            const time = 123;
            return buildOpenReportFinished(state, insight, loadedItems, time, useDefaultClass);
        }

        describe("Setting opening report data into state", () => {
            it("should get and store buckets", () => {
                const state = openReport(initialState, getOpenReportFinishedAction(initialState));
                expect(state.data.buckets).toEqual([]);
            });

            it("should set visualization class", () => {
                const updateState = withData(initialState, {
                    visualizationClasses: [tableVisualizationClass],
                });
                const state = openReport(updateState, getOpenReportFinishedAction(updateState));

                expect(state.data.visualizationClass.visualizationClass.url).toEqual("local:table");
            });

            it("should set table visualization class when report has deleted or deprecated visualization class", () => {
                const updateState = withData(initialState, {
                    visualizationClasses: [tableVisualizationClass],
                });
                const state = openReport(updateState, getOpenReportFinishedAction(updateState, null, true));

                expect(state.data.visualizationClass.visualizationClass.url).toEqual("local:table");
            });

            it("should set other visualization class when report has deleted or deprecated visualization class", () => {
                const updateState = withData(initialState, { visualizationClasses: [pieVisualizationClass] });
                const state = openReport(updateState, getOpenReportFinishedAction(updateState, null, true));

                expect(state.data.visualizationClass.visualizationClass.url).toEqual("local:pie");
            });

            it("should set buckets into reference point", () => {
                const state = openReport(initialState, getOpenReportFinishedAction(initialState));
                expect(state.data.buckets).toEqual(state.data.referencePoint.buckets);
            });
        });

        it("should merge state itemCache with loaded items and set it to state", () => {
            const originalCache = {
                measureInCache: {
                    uri: "/gdc/md/obj/1",
                },
                "attribute.id": {
                    identifier: "attribute.id",
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
                },
            };
            const stateWithCache = withData(initialState, { itemCache: originalCache });

            const measureIdentifier = "loadedMeasure";
            const loadedCache = {
                [measureIdentifier]: {
                    uri: "/gdc/md/obj/2",
                },
            };

            const action = getOpenReportFinishedAction(stateWithCache, undefined, false, loadedCache);

            const result = openReport(stateWithCache, action);
            const resultCache = result.data.itemCache;
            expect(resultCache).toEqual({
                ...originalCache,
                ...loadedCache,
            });
        });

        it("should set properties to empty object when invalid properties provided", () => {
            const state = openReport(
                initialState,
                getOpenReportFinishedAction(initialState, "invalid properties"),
            );
            expect(state.data.visualizationProperties).toEqual({});
        });

        it("should set measure date datasets upon report load finish", () => {
            const loadedItems: ILoadedReportItems = {
                itemCache: {
                    m1: {
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/9211",
                        identifier: "measure.apples",
                    },
                    m2: {
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/2723",
                        identifier: "measure.pears",
                    },
                    m3: {
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/4906",
                        identifier: "measure.oranges",
                    },
                    a1: {
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/992",
                        identifier: "attributes.country",
                    },
                },
                filterItems: {},
                allDateDatasets: {
                    available: [activityDateDataset, closedDateDataset],
                    unavailable: 0,
                },
                availableDateDatasets: {
                    available: [activityDateDataset, closedDateDataset],
                    unavailable: 0,
                },
                parameterFilters: [],
                parameterWarnings: [],
            };

            const appState = seedDateDatasetsMeta(initialState, {
                items: [
                    {
                        identifier: "attr.datedataset.activity",
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity",
                        ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity"),
                        attributes: [],
                        type: "date",
                        title: "Week/Year (Activity)",
                        summary: "Week/Year based on EU Weeks (Mon-Sun).",
                    },
                    {
                        identifier: "attr.datedataset.closed",
                        uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed",
                        ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed"),
                        attributes: [],
                        type: "date",
                        title: "Week/Year (Closed)",
                        summary: "Week/Year based on EU Weeks (Mon-Sun).",
                    },
                ],
            });

            const openReportFinishedAction = buildOpenReportFinished(
                appState,
                insightWithMeasuresWithVariousTypesOfFilters,
                loadedItems,
                0,
                false,
            );

            const updatedState = openReport(appState, openReportFinishedAction);
            const result = getMeasureDateDatasetsState(updatedState);

            expect(result).toEqual({
                m1: {
                    selectedDateDatasetUri:
                        "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity",
                },
                m2: {
                    selectedDateDatasetUri:
                        "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed",
                },
            });
        });

        const ACTIVITY_URI = "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity";
        const CLOSED_URI = "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed";
        const insightWithTwoMeasureDateFilters = newInsight("local:two", "two", "gdc/md/two", (i) =>
            i.buckets([
                {
                    localIdentifier: "measures",
                    items: [
                        newMeasure(uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/9211"), (m) =>
                            m
                                .localId("m1")
                                .filters(
                                    newRelativeDateFilter(uriRef(ACTIVITY_URI), "GDC.time.year", -2, -2),
                                    newRelativeDateFilter(uriRef(CLOSED_URI), "GDC.time.year", -1, -1),
                                ),
                        ),
                    ],
                },
            ]),
        );
        const emptyLoadedItems: ILoadedReportItems = {
            itemCache: {},
            filterItems: {},
            allDateDatasets: { available: [activityDateDataset, closedDateDataset], unavailable: 0 },
            availableDateDatasets: { available: [activityDateDataset, closedDateDataset], unavailable: 0 },
            parameterFilters: [],
            parameterWarnings: [],
        };
        const loadedMeasureDateFilters = (state: IAppState) =>
            (state.data.buckets as IRawBuckets)[0].items[0].filters.filter(
                (filter: IBucketItemMetricFilter) => filter.attribute === DATE_DATASET_ATTRIBUTE,
            ) as IBucketItemMetricFilter[];

        it("keeps the first metric date filter only while the improved metric date filter is off", () => {
            const state = openReport(
                initialState,
                buildOpenReportFinished(initialState, insightWithTwoMeasureDateFilters, emptyLoadedItems, 0),
            );

            const dateFilters = loadedMeasureDateFilters(state);
            expect(dateFilters).toHaveLength(1);
            expect(dateFilters[0].interval).toMatchObject({ interval: [-2, -2] });
        });

        it("keeps every metric date filter with the improved metric date filter on", () => {
            const withFlag = withRoot(initialState, {
                featureFlags: { enableImprovedMetricDateFilter: true },
            });
            const state = openReport(
                withFlag,
                buildOpenReportFinished(withFlag, insightWithTwoMeasureDateFilters, emptyLoadedItems, 0),
            );

            expect(loadedMeasureDateFilters(state)).toHaveLength(2);
        });

        it("takes the measure's date dataset from the primary date filter only", () => {
            // the primary filter's dataset is unknown to the meta, the second one's is known: the
            // selection stays unset rather than following the second filter
            const withFlagAndMeta = seedDateDatasetsMeta(
                withRoot(initialState, { featureFlags: { enableImprovedMetricDateFilter: true } }),
                {
                    items: [
                        {
                            identifier: "attr.datedataset.closed",
                            uri: CLOSED_URI,
                            ref: uriRef(CLOSED_URI),
                            attributes: [],
                            type: "date",
                            title: "Closed",
                            summary: "",
                        },
                    ],
                },
            );
            const state = openReport(
                withFlagAndMeta,
                buildOpenReportFinished(
                    withFlagAndMeta,
                    insightWithTwoMeasureDateFilters,
                    emptyLoadedItems,
                    0,
                ),
            );

            expect(getMeasureDateDatasetsState(state)["m1"]?.selectedDateDatasetUri).toBeUndefined();
        });

        it("gives every loaded metric date filter its own local identifier", () => {
            const loadedItems: ILoadedReportItems = {
                itemCache: {},
                filterItems: {},
                allDateDatasets: { available: [activityDateDataset, closedDateDataset], unavailable: 0 },
                availableDateDatasets: {
                    available: [activityDateDataset, closedDateDataset],
                    unavailable: 0,
                },
                parameterFilters: [],
                parameterWarnings: [],
            };
            const state = openReport(
                initialState,
                buildOpenReportFinished(
                    initialState,
                    insightWithMeasuresWithVariousTypesOfFilters,
                    loadedItems,
                    0,
                    false,
                ),
            );

            const dateFilterIds = (state.data.buckets as IRawBuckets).flatMap((bucket) =>
                (bucket.items ?? []).flatMap((item) =>
                    ((item.filters ?? []) as IBucketItemMetricFilter[])
                        .filter((filter) => filter.attribute === DATE_DATASET_ATTRIBUTE)
                        .map((filter) => filter.localIdentifier),
                ),
            );
            expect(dateFilterIds.length).toBeGreaterThan(1);
            expect(dateFilterIds.every((id) => typeof id === "string" && id.length > 0)).toBe(true);
            expect(new Set(dateFilterIds).size).toBe(dateFilterIds.length);
        });

        it("should set as modified only attribute and date filters", () => {
            const action = getOpenReportFinishedAction(initialState, undefined, true);
            const state = openReport(initialState, action);
            expect(state.data.bucketsMeta.modified).toEqual({
                "attribute.id": true,
                "attr.datedataset": true,
            });
        });
    });

    describe("getSelectedDateDataset", () => {
        it("should return undefined when dataset is not defined in categories, in filters nor in measures", () => {
            // `undefined` rather than `null` — the value never leaves the
            // operation (it only gates the dateDatasets write), so only this pin sees it
            expect(getSelectedDateDataset([], [], dateDatasetsAvailable)).toBeUndefined();
        });

        it("should return correct dataset when it is defined only in categories", () => {
            // bear-era fixture (string displayForm/uri) — the lookup only reads `type` and `uri`
            const buckets = [
                {
                    localIdentifier: "view",
                    items: metadataBucketCategoriesWithDate,
                },
            ] as unknown as IRawBuckets;

            expect(getSelectedDateDataset(buckets, [], dateDatasetsAvailable)).toEqual(
                dateDatasetsAvailable[0],
            );
        });

        it("should return correct dataset when it is defined only in categories and if stacks present", () => {
            // bear-era fixture (string displayForm/uri) — the lookup only reads `type` and `uri`
            const buckets = [
                {
                    localIdentifier: "view",
                    items: metadataBucketCategoriesWithDate,
                },
                {
                    localIdentifier: "stacks",
                    items: metadataBucketStacksItems,
                },
            ] as unknown as IRawBuckets;

            expect(getSelectedDateDataset(buckets, [], dateDatasetsAvailable)).toEqual(
                dateDatasetsAvailable[0],
            );
        });

        it("should return correct dataset when it is defined only in filters", () => {
            const filters = [newRelativeDateFilter(idRef("activity.dataset.dt"), "GDC.time.year", 0, 0)];

            expect(getSelectedDateDataset([], filters, dateDatasetsAvailable)).toEqual(
                dateDatasetsAvailable[0],
            );
        });

        it("should return correct dataset when it is defined only in measures", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: measuresWithDateFilter,
                },
            ];

            expect(getSelectedDateDataset(buckets, [], dateDatasetsAvailable)).toEqual(
                dateDatasetsAvailable[0],
            );
        });

        it("should return correct dataset when it is defined in categories, in filters and also in measures", () => {
            const buckets = [
                {
                    localIdentifier: "measures",
                    items: measuresWithDateFilter,
                },
                {
                    localIdentifier: "view",
                    items: metadataBucketCategoriesWithDate,
                },
            ];

            const filters = [
                newRelativeDateFilter(uriRef("/gdc/md/TeamOneGoodSales1/obj/727"), "GDC.time.year", 0, 0),
            ];

            expect(getSelectedDateDataset(buckets, filters, dateDatasetsAvailable)).toEqual(
                dateDatasetsAvailable[0],
            );
        });
    });
});
