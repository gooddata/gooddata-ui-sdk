// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { idRef, newInsightDefinition, newMeasure, uriRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { type IBucketItem } from "@gooddata/sdk-ui-ext/internal";

import { bootstrapData } from "../../actions/app_context_actions.js";
import {
    removeBucketDerivedItems,
    setAllBucketsDateDataset,
    setBucketDateDataset,
    setBucketItemDateDataset,
} from "../../actions/buckets_actions.js";
import {
    dateDatasetsUpdated,
    setDateDatasetsDropdownLoaded,
    setDateDatasetsMeta,
} from "../../actions/data_actions.js";
import { MeasureDateDatasetsActions } from "../../actions/measure_date_datasets_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { LOCAL_BAR, LOCAL_TABLE } from "../../constants/visualization_types.js";
import { type IDateDatasetsMeta } from "../../models/date_datasets_meta.js";
import { GRANULARITY } from "../../models/granularity.js";
import { buildInitialState } from "../../reducers/initial_state.js";
import {
    changeBucketItemDateDataset,
    updateDateFilter as createUpdateDateFilterAction,
} from "../../sagas/date_datasets/date_datasets_actions.js";
import { supportsNonProductionDatasets } from "../../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { getDateBucketItems } from "../../selectors/buckets_selector.js";
import {
    getInsightWithFilteredExpandedDate,
    getInsightWithoutDates,
} from "../../selectors/date_datasets_selector.js";
import { isPoPSetup } from "../../selectors/date_filter_selector.js";
import { enableUnavailableItemsVisibility } from "../../selectors/feature_flag_selector.js";
import { getInsightWithBucketsViaMd } from "../../selectors/insight_selectors.js";
import { getDatasetIdentifier, getTagsConfiguration } from "../../selectors/route_selector.js";
import {
    isSynchronizedDatesPreferred,
    visualizationAllowsMultipleDateDatasets,
} from "../../selectors/ui_config_selector.js";
import { getBucketIdentifierByItemId } from "../../services/buckets_service.js";
import { storeUpdateDateFilterDateDataset } from "../../store/bucket_filters/bucket_filters_actions.js";
import { bucketsDateDatasetChanged } from "../../store/buckets/buckets_operation_events.js";
import { getDateFilters, getFirstDateFilter } from "../../store/filter_bar/filter_bar_selector.js";
import { type IDateFilterConfig } from "../../store/filter_bar/filter_bar_types.js";
import { getMeasureDateDatasetStatus } from "../../store/measure_date_datasets/measure_date_datasets_selectors.js";
import { type IAppState } from "../../store/types.js";
import { activityDateDataset } from "../../tests/constants.test.helpers.js";
import { dateFilter6YearsSply } from "../../tests/filter.test.helpers.js";
import { type IDateDatasets } from "../../typings/datasets.js";
import { type ILoadDateDatasetsOptions, loadCachedDateDatasets, loadDateDatasets } from "../../utils/api.js";
import { updateSelectedDataset } from "../datasets_sagas.js";

import { type ILoadDateDatasetsToDateDropdown } from "./date_datasets_actions.js";
import {
    handleBucketDerivedItemsWithDateFilter,
    initializeDateDatasetsMeta,
    isGranularitySupportedByDataset,
    loadDateDatasetsDropdown,
    loadDateDatasetsWithAllDates,
    loadDateDatasetsWithReducedDates,
    loadDateHierarchies,
    updateDateDataSets,
    watchDateDatasets,
} from "./date_datasets_sagas.js";

describe("Date datasets sagas", () => {
    const projectId = "xyz12345";
    const measure = newMeasure(uriRef("uri1"), (m) => m.localId("m1"));
    const insight = newInsightDefinition(LOCAL_TABLE, (i) =>
        i
            .buckets([
                {
                    localIdentifier: "measures",
                    items: [measure, newMeasure(uriRef("uri2"), (m) => m.localId("m2"))],
                },
            ])
            .title("testObject"),
    );
    const dateItem: IBucketItem = {
        localIdentifier: "bucketItemLocalIdentifier",
        type: "date",
        attribute: "attr.datedataset",
        dateDatasetRef: {
            uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
        },
        aggregation: null,
        showInPercent: null,
    };

    const loadedDateDatasets: IDateDatasets = {
        available: [
            {
                attributes: [],
                id: "activity.dataset.dt",
                ref: {
                    identifier: "activity.dataset.dt",
                },
                identifier: "activity.dataset.dt",
                uri: "/gdc/md/TeamOneGoodSales1/obj/727",
                type: "dateDataset",
                title: "Date (Activity)",
                summary: "DataSet Date",
                isAvailable: true,
                relevance: 0,
            },
        ],
        allItems: [
            {
                attributes: [],
                id: "activity.dataset.dt",
                ref: {
                    identifier: "activity.dataset.dt",
                },
                identifier: "activity.dataset.dt",
                uri: "/gdc/md/TeamOneGoodSales1/obj/727",
                type: "dateDataset",
                title: "Date (Activity)",
                summary: "DataSet Date",
                isAvailable: true,
                relevance: 0,
            },
            {
                attributes: [],
                id: "closed.dataset.dt",
                ref: {
                    identifier: "closed.dataset.dt",
                },
                identifier: "closed.dataset.dt",
                uri: "/gdc/md/TeamOneGoodSales1/obj/727",
                type: "dateDataset",
                title: "Date (closed)",
                summary: "DataSet Date",
                isAvailable: false,
                relevance: 0,
            },
        ],
        unavailable: 0,
    };
    const activeDatasetId = "active.dataset.id";
    const activeDatasetRef = idRef(activeDatasetId);

    describe("updateDateDataSets", () => {
        it("should update dataSets in state", () => {
            return expectSaga(updateDateDataSets, projectId, activeDatasetId, insight)
                .provide([
                    [call(updateSelectedDataset), false],
                    [call(loadDateHierarchies, loadedDateDatasets), undefined],
                    [select(getTagsConfiguration), {}],
                    [
                        call(loadCachedDateDatasets, projectId, {
                            insight,
                            dataSetIdentifier: activeDatasetRef,
                            production: false,
                        }),
                        loadedDateDatasets,
                    ],
                ])
                .put(dateDatasetsUpdated(loadedDateDatasets))
                .run();
        });

        it("should update dataSets with specified tags configuration", () => {
            const tagsConfiguration = {
                includeObjectsWithTags: [idRef("include")],
                excludeObjectsWithTags: [idRef("exclude")],
            };

            return expectSaga(updateDateDataSets, projectId, activeDatasetId, insight)
                .provide([
                    [call(updateSelectedDataset), false],
                    [call(loadDateHierarchies, loadedDateDatasets), undefined],
                    [select(getTagsConfiguration), tagsConfiguration],
                    [
                        call(loadCachedDateDatasets, projectId, {
                            insight,
                            dataSetIdentifier: activeDatasetRef,
                            production: false,
                            ...tagsConfiguration,
                        }),
                        loadedDateDatasets,
                    ],
                ])
                .put(dateDatasetsUpdated(loadedDateDatasets))
                .run();
        });
    });

    describe("watchDateDatasets", () => {
        describe("MEASURE_DATE_DATASETS_REQUESTED action", () => {
            const loadDateDatasetsOptions: ILoadDateDatasetsOptions = {
                items: [measure],
                dataSetIdentifier: undefined,
                production: true,
            };
            const loadDateDatasetsOptionsWithDatasetId: ILoadDateDatasetsOptions = {
                ...loadDateDatasetsOptions,
                dataSetIdentifier: activeDatasetRef,
                production: false,
            };

            it("should load date datasets for given measure", () => {
                const measureLocalIdentifier = "m1";
                const action =
                    MeasureDateDatasetsActions.measureDateDatasetsRequested(measureLocalIdentifier);

                return expectSaga(watchDateDatasets)
                    .provide([
                        [
                            select(getMeasureDateDatasetStatus, measureLocalIdentifier),
                            {
                                isLoading: false,
                            },
                        ],
                        [select(getProjectId), projectId],
                        [select(getInsightWithBucketsViaMd), insight],
                        [select(getDatasetIdentifier), undefined],
                        [select(getTagsConfiguration), {}],
                        [call(loadDateDatasets, projectId, loadDateDatasetsOptions), loadedDateDatasets],
                        [select(enableUnavailableItemsVisibility), false],
                    ])
                    .put(MeasureDateDatasetsActions.measureDateDatasetsStarted(measureLocalIdentifier))
                    .put(
                        MeasureDateDatasetsActions.measureDateDatasetsFinished(
                            measureLocalIdentifier,
                            loadedDateDatasets.available,
                            loadedDateDatasets.unavailable,
                        ),
                    )
                    .dispatch(action)
                    .silentRun(0);
            });

            it("should NOT start loading of date datasets for given measure when loading is already in progress", () => {
                const measureLocalIdentifier = "m1";
                const action =
                    MeasureDateDatasetsActions.measureDateDatasetsRequested(measureLocalIdentifier);

                return expectSaga(watchDateDatasets)
                    .provide([
                        [
                            select(getMeasureDateDatasetStatus, measureLocalIdentifier),
                            {
                                isLoading: true,
                            },
                        ],
                    ])
                    .dispatch(action)
                    .silentRun(0);
            });

            it("should load date datasets based on activeDatasetId for custom data", () => {
                const measureLocalIdentifier = "m1";
                const action =
                    MeasureDateDatasetsActions.measureDateDatasetsRequested(measureLocalIdentifier);

                return expectSaga(watchDateDatasets)
                    .provide([
                        [
                            select(getMeasureDateDatasetStatus, measureLocalIdentifier),
                            {
                                isLoading: false,
                            },
                        ],
                        [select(getProjectId), projectId],
                        [select(getInsightWithBucketsViaMd), insight],
                        [select(getDatasetIdentifier), activeDatasetId],
                        [select(getTagsConfiguration), {}],
                        [
                            call(loadDateDatasets, projectId, loadDateDatasetsOptionsWithDatasetId),
                            loadedDateDatasets,
                        ],
                        [select(enableUnavailableItemsVisibility), false],
                    ])
                    .put(MeasureDateDatasetsActions.measureDateDatasetsStarted(measureLocalIdentifier))
                    .put(
                        MeasureDateDatasetsActions.measureDateDatasetsFinished(
                            measureLocalIdentifier,
                            loadedDateDatasets.available,
                            loadedDateDatasets.unavailable,
                        ),
                    )
                    .dispatch(action)
                    .silentRun(0);
            });

            it("should load date datasets based on tags configuration", () => {
                const measureLocalIdentifier = "m1";
                const action =
                    MeasureDateDatasetsActions.measureDateDatasetsRequested(measureLocalIdentifier);

                const tagsConfiguration = {
                    includeObjectsWithTags: [idRef("include")],
                    excludeObjectsWithTags: [idRef("exclude")],
                };

                const loadDateDatasetsOptionsWithTags = {
                    ...loadDateDatasetsOptions,
                    ...tagsConfiguration,
                };

                return expectSaga(watchDateDatasets)
                    .provide([
                        [
                            select(getMeasureDateDatasetStatus, measureLocalIdentifier),
                            {
                                isLoading: false,
                            },
                        ],
                        [select(getProjectId), projectId],
                        [select(getInsightWithBucketsViaMd), insight],
                        [select(getDatasetIdentifier), undefined],
                        [select(getTagsConfiguration), tagsConfiguration],
                        [
                            call(loadDateDatasets, projectId, loadDateDatasetsOptionsWithTags),
                            loadedDateDatasets,
                        ],
                        [select(enableUnavailableItemsVisibility), false],
                    ])
                    .put(MeasureDateDatasetsActions.measureDateDatasetsStarted(measureLocalIdentifier))
                    .put(
                        MeasureDateDatasetsActions.measureDateDatasetsFinished(
                            measureLocalIdentifier,
                            loadedDateDatasets.available,
                            loadedDateDatasets.unavailable,
                        ),
                    )
                    .dispatch(action)
                    .silentRun(0);
            });

            it("should load all date datasets when enableUnavailableItemsVisibility is enabled", () => {
                const measureLocalIdentifier = "m1";
                const action =
                    MeasureDateDatasetsActions.measureDateDatasetsRequested(measureLocalIdentifier);

                return expectSaga(watchDateDatasets)
                    .provide([
                        [
                            select(getMeasureDateDatasetStatus, measureLocalIdentifier),
                            {
                                isLoading: false,
                            },
                        ],
                        [select(getProjectId), projectId],
                        [select(getInsightWithBucketsViaMd), insight],
                        [select(getDatasetIdentifier), undefined],
                        [select(getTagsConfiguration), {}],
                        [call(loadDateDatasets, projectId, loadDateDatasetsOptions), loadedDateDatasets],
                        [select(enableUnavailableItemsVisibility), true],
                    ])
                    .put(MeasureDateDatasetsActions.measureDateDatasetsStarted(measureLocalIdentifier))
                    .put(
                        MeasureDateDatasetsActions.measureDateDatasetsFinished(
                            measureLocalIdentifier,
                            loadedDateDatasets.allItems,
                            loadedDateDatasets.unavailable,
                        ),
                    )
                    .dispatch(action)
                    .silentRun(0);
            });

            it("should dispatch error action when loading date datasets failed", () => {
                const measureLocalIdentifier = "m1";
                const action =
                    MeasureDateDatasetsActions.measureDateDatasetsRequested(measureLocalIdentifier);
                const error = new Error("error");

                return expectSaga(watchDateDatasets)
                    .provide([
                        [
                            select(getMeasureDateDatasetStatus, measureLocalIdentifier),
                            {
                                isLoading: false,
                            },
                        ],
                        [select(getProjectId), projectId],
                        [select(getInsightWithBucketsViaMd), insight],
                        [select(getDatasetIdentifier), undefined],
                        [select(getTagsConfiguration), {}],
                        [call(loadDateDatasets, projectId, loadDateDatasetsOptions), throwError(error)],
                    ])
                    .put(MeasureDateDatasetsActions.measureDateDatasetsStarted(measureLocalIdentifier))
                    .put(MeasureDateDatasetsActions.measureDateDatasetsError(measureLocalIdentifier, error))
                    .dispatch(action)
                    .silentRun(0);
            });
        });

        describe("initializeDateDatasetsMeta (called by the bootstrap saga)", () => {
            it("should load dateDatasets meta", async () => {
                const dateDatasetItem = loadedDateDatasets.available[0];
                const expectedDateDatasetsMeta: IDateDatasetsMeta = {
                    items: [
                        {
                            ref: dateDatasetItem.ref,
                            identifier: dateDatasetItem.identifier,
                            title: dateDatasetItem.title,
                            uri: dateDatasetItem.uri,
                            type: dateDatasetItem.type,
                            summary: dateDatasetItem.summary,
                            attributes: [],
                        },
                    ],
                };
                const mockedState: IAppState = buildInitialState();

                const { effects } = await expectSaga(initializeDateDatasetsMeta)
                    .withState(mockedState)
                    .provide([
                        [select(getProjectId), projectId],
                        [call(loadDateDatasets, projectId), loadedDateDatasets],
                        [select(supportsNonProductionDatasets), true],
                    ])
                    .silentRun(0);

                expect(effects.select).toEqual([select(getProjectId), select(supportsNonProductionDatasets)]);
                expect(effects.call).toEqual([call(loadDateDatasets, projectId)]);
                expect(effects.put).toEqual([put(setDateDatasetsMeta(expectedDateDatasetsMeta))]);
            });

            it("should load dateDatasets meta on tiger", async () => {
                const dateDatasetItem = loadedDateDatasets.available[0];
                const expectedDateDatasetsMeta: IDateDatasetsMeta = {
                    items: [
                        {
                            ref: dateDatasetItem.ref,
                            identifier: dateDatasetItem.identifier,
                            title: dateDatasetItem.title,
                            uri: dateDatasetItem.uri,
                            type: dateDatasetItem.type,
                            summary: dateDatasetItem.summary,
                            attributes: [],
                        },
                    ],
                };
                const mockedState: IAppState = buildInitialState();

                const { effects } = await expectSaga(initializeDateDatasetsMeta)
                    .withState(mockedState)
                    .provide([
                        [select(supportsNonProductionDatasets), false],
                        [select(getProjectId), projectId],
                        [call(loadDateDatasets, projectId, { production: true }), loadedDateDatasets],
                    ])
                    .silentRun(0);

                expect(effects.select).toEqual([select(getProjectId), select(supportsNonProductionDatasets)]);
                expect(effects.call).toEqual([call(loadDateDatasets, projectId, { production: true })]);
                expect(effects.put).toEqual([put(setDateDatasetsMeta(expectedDateDatasetsMeta))]);
            });

            it("should load empty dateDatasets meta", async () => {
                const emptyDateDatasets: IDateDatasets = {
                    available: [],
                    unavailable: 0,
                };

                const expectedDateDatasetsMeta: IDateDatasetsMeta = {
                    items: [],
                };
                const mockedState: IAppState = buildInitialState();

                const { effects } = await expectSaga(initializeDateDatasetsMeta)
                    .withState(mockedState)
                    .provide([
                        [select(getProjectId), projectId],
                        [select(supportsNonProductionDatasets), true],
                        [call(loadDateDatasets, projectId), emptyDateDatasets],
                    ])
                    .silentRun(0);

                expect(effects.select).toEqual([select(getProjectId), select(supportsNonProductionDatasets)]);
                expect(effects.call).toEqual([call(loadDateDatasets, projectId)]);

                expect(effects.put).toEqual([put(setDateDatasetsMeta(expectedDateDatasetsMeta))]);
            });

            it("should keep the meta untouched and not throw when the load fails", async () => {
                const mockedState: IAppState = buildInitialState();

                const { effects } = await expectSaga(initializeDateDatasetsMeta)
                    .withState(mockedState)
                    .provide([
                        [select(getProjectId), projectId],
                        [select(supportsNonProductionDatasets), true],
                        [call(loadDateDatasets, projectId), throwError(new Error("boom"))],
                    ])
                    .silentRun(0);

                expect(effects.put).toBeUndefined();
            });

            it("is not triggered by the watcher on BOOTSTRAP_DATA", async () => {
                const mockedState: IAppState = buildInitialState();

                const { effects } = await expectSaga(watchDateDatasets)
                    .withState(mockedState)
                    .dispatch(bootstrapData(null))
                    .silentRun(0);

                expect(effects.put).toBeUndefined();
            });
        });

        describe("UI_UPDATE_DATE_FILTER action", () => {
            const testFilterConfig: IDateFilterConfig = {
                granularity: "GDC.time.year",
                interval: [0, 1],
            };

            const action = createUpdateDateFilterAction({
                localIdentifier: "id",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                overTimeComparisonMeasures: [],
                filterConfig: testFilterConfig,
                dateDatasetRef: activityDateDataset.ref,
            });

            it("should not put action to sync dimension in buckets", async () => {
                const mockedState: IAppState = buildInitialState();

                const { effects } = await expectSaga(watchDateDatasets)
                    .withState(mockedState)
                    .dispatch(action)
                    .silentRun(0);

                expect(effects.put).toBeUndefined();
            });
        });

        describe("UI_BUCKETS_SET_BUCKET_ITEM_DATE_DATASET action", () => {
            const action = changeBucketItemDateDataset(activityDateDataset.ref, "bucketItemLocalIdentifier");

            /**
             * The commit of the date-dataset change. The three `setBucket*DateDataset` triggers
             * write nothing themselves — `buckets_operations_saga.ts` computes the change and
             * commits it with this event — so `syncBucketItemsDateDataset` waits for it before
             * reading the buckets back. The tests below that assert a put made AFTER that read have
             * to deliver it.
             */
            const commit = bucketsDateDatasetChanged({
                buckets: [],
                referencePoint: undefined,
                isVisualizationMdObjectValid: true,
            });

            it("should sync dimension to specified bucket item only when visualization allows different dimensions", () => {
                const mockedState: IAppState = buildInitialState();

                return expectSaga(watchDateDatasets)
                    .withState(mockedState)
                    .provide([
                        [select(visualizationAllowsMultipleDateDatasets), true],
                        [select(getDateBucketItems), []],
                        [select(isPoPSetup), true],
                    ])
                    .dispatch(action)
                    .put(
                        setBucketItemDateDataset(
                            activityDateDataset.ref,
                            action.payload.bucketItemLocalIdentifier,
                        ),
                    )
                    .silentRun(0);
            });

            it("should sync dimension to all items when FF is true but visualization does not support multiple date items", () => {
                const mockedState: IAppState = buildInitialState();

                return expectSaga(watchDateDatasets)
                    .withState(mockedState)
                    .provide([
                        [select(visualizationAllowsMultipleDateDatasets), false],
                        [select(getDateBucketItems), []],
                        [select(isPoPSetup), true],
                        [
                            call(isGranularitySupportedByDataset, GRANULARITY.YEAR, activityDateDataset.ref),
                            true,
                        ],
                    ])
                    .dispatch(action)
                    .put(setAllBucketsDateDataset(activityDateDataset.ref))
                    .silentRun(0);
            });

            it("should sync dimension to date filter when FF is false and there is exactly one date bucket item", () => {
                const mockedState: IAppState = buildInitialState();

                return expectSaga(watchDateDatasets)
                    .withState(mockedState)
                    .provide([
                        [select(visualizationAllowsMultipleDateDatasets), false],
                        [select(getDateBucketItems), [dateItem]],
                        [select(getFirstDateFilter), dateFilter6YearsSply],
                        [select(getDateFilters), [dateFilter6YearsSply]],
                        [select(isPoPSetup), true],
                        [
                            call(isGranularitySupportedByDataset, GRANULARITY.YEAR, activityDateDataset.ref),
                            true,
                        ],
                    ])
                    .dispatch(action)
                    .dispatch(commit)
                    .put(
                        storeUpdateDateFilterDateDataset(
                            dateFilter6YearsSply.localIdentifier,
                            activityDateDataset.ref,
                        ),
                    )
                    .silentRun(0);
            });

            it("should sync dimension to date filter when FF is true, there is exactly one date bucket item and matches filter dimension", () => {
                const mockedState: IAppState = buildInitialState();
                return expectSaga(watchDateDatasets)
                    .withState(mockedState)
                    .provide([
                        [select(visualizationAllowsMultipleDateDatasets), false],
                        [select(getDateBucketItems), [dateItem]],
                        [select(getFirstDateFilter), dateFilter6YearsSply],
                        [select(getDateFilters), [dateFilter6YearsSply]],
                        [select(isPoPSetup), true],
                        [
                            call(isGranularitySupportedByDataset, GRANULARITY.YEAR, activityDateDataset.ref),
                            true,
                        ],
                    ])
                    .dispatch(action)
                    .dispatch(commit)
                    .put(
                        storeUpdateDateFilterDateDataset(
                            dateFilter6YearsSply.localIdentifier,
                            activityDateDataset.ref,
                        ),
                    )
                    .silentRun(0);
            });

            it("should sync dimension in all items in a bucket if bucketLocalIdentifier specified", () => {
                const mockedState: IAppState = buildInitialState();
                const itemBucketIdentifier = "bucketId";
                const { bucketItemLocalIdentifier } = action.payload;

                return expectSaga(watchDateDatasets)
                    .withState(mockedState)
                    .provide([
                        [select(visualizationAllowsMultipleDateDatasets), true],
                        [select(getDateBucketItems), [dateItem]],
                        [
                            select(getBucketIdentifierByItemId, bucketItemLocalIdentifier),
                            itemBucketIdentifier,
                        ],
                        [select(isSynchronizedDatesPreferred, itemBucketIdentifier), true],
                        [select(isPoPSetup), true],
                    ])
                    .dispatch(action)
                    .put(
                        setBucketDateDataset(
                            activityDateDataset.ref,
                            bucketItemLocalIdentifier,
                            itemBucketIdentifier,
                        ),
                    )
                    .silentRun(0);
            });
        });
    });

    describe("handleBucketDerivedItemsWithDateFilter", () => {
        const mockedState: IAppState = buildInitialState();

        it("should put removeBucketDerivedItems action in case that PoP is not available", () => {
            return expectSaga(handleBucketDerivedItemsWithDateFilter)
                .withState(mockedState)
                .provide([[select(isPoPSetup), false]])
                .put(removeBucketDerivedItems())
                .run();
        });

        it("should not put removeBucketDerivedItems action in case that PoP is available", () => {
            return expectSaga(handleBucketDerivedItemsWithDateFilter)
                .withState(mockedState)
                .provide([[select(isPoPSetup), true]])
                .not.put(removeBucketDerivedItems())
                .run();
        });
    });

    describe("loadDateDatasetsWithAllDates", () => {
        it("should call updateDateDataSets with proper parameters", async () => {
            const projectId = "projectID";
            const insight = newInsightDefinition(LOCAL_BAR);
            const activeDatasetId = "datasetId";

            await expectSaga(loadDateDatasetsWithAllDates)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getDatasetIdentifier), activeDatasetId],
                    [select(getInsightWithoutDates), insight],
                ])
                .call(updateDateDataSets, projectId, activeDatasetId, insight)
                .silentRun(0);
        });
    });

    describe("loadDateDatasetsWithReducedDates", () => {
        const projectId = "projectID";
        const activeDatasetId = "datasetId";
        const insight = newInsightDefinition(LOCAL_BAR);

        it("should call updateDateDataSets and select insight without dates", async () => {
            const ignoreDateDataset = true;
            const action: ILoadDateDatasetsToDateDropdown = {
                type: ActionTypeKeys.UI_LOAD_DATE_DATASETS_TO_DATE_DROPDOWN,
                payload: {
                    ignoreDateDataset,
                },
            };
            await expectSaga(loadDateDatasetsWithReducedDates, action)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getDatasetIdentifier), activeDatasetId],
                    [select(getInsightWithoutDates), insight],
                ])
                .call(updateDateDataSets, projectId, activeDatasetId, insight)
                .silentRun(0);
        });

        it("should call updateDateDataSets and select insight with reduced dates", async () => {
            const ignoreDateDataset = false;
            const action: ILoadDateDatasetsToDateDropdown = {
                type: ActionTypeKeys.UI_LOAD_DATE_DATASETS_TO_DATE_DROPDOWN,
                payload: {
                    ignoreDateDataset,
                },
            };
            await expectSaga(loadDateDatasetsWithReducedDates, action)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getDatasetIdentifier), activeDatasetId],
                    [select(getInsightWithFilteredExpandedDate), insight],
                ])
                .call(updateDateDataSets, projectId, activeDatasetId, insight)
                .silentRun(0);
        });
    });

    describe("loadDateDatasetsDropdown", () => {
        const ignoreDateDataset = false;
        const action: ILoadDateDatasetsToDateDropdown = {
            type: ActionTypeKeys.UI_LOAD_DATE_DATASETS_TO_DATE_DROPDOWN,
            payload: {
                ignoreDateDataset,
            },
        };

        it("should call loadDateDatasetsWithReducedDates", async () => {
            await expectSaga(loadDateDatasetsDropdown, action)
                .put(setDateDatasetsDropdownLoaded(false))
                .call(loadDateDatasetsWithReducedDates, action)
                .put(setDateDatasetsDropdownLoaded(true))
                .silentRun(0);
        });
    });
});
