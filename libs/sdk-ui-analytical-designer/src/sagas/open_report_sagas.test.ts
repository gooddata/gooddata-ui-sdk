// (C) 2007-2026 GoodData Corporation

import { type RunResult, expectSaga, testSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import {
    type ICatalogAttribute,
    type ICatalogFact,
    type ICatalogMeasure,
    type IInsight,
    type IInsightParameterValue,
    type IMetadataObject,
    type VisualizationProperties,
    idRef,
    insightVisualizationUrl,
    newAttributeSort,
    newNegativeAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";

import { changeDataset, updateInsightUsageOnDashboards } from "../actions/data_actions.js";
import { addMessage, showWarningMessage } from "../actions/messages_actions.js";
import {
    openReport,
    openReportConfirmation,
    openReportFailed,
    openReportFinished,
    openReportStarted,
} from "../actions/open_actions.js";
import { ATTRIBUTE } from "../constants/bucket.js";
import { combinedRootReducer } from "../reducers/combined_root_reducer.js";
import { buildInitialState } from "../reducers/initial_state.js";
import {
    enableAnalyticalDesignerCatalogSideload,
    enableParameters,
    enableStringParameters,
} from "../selectors/feature_flag_selector.js";
import { getTagsConfiguration } from "../selectors/route_selector.js";
import { isSaveDisabledSelector, isSavedReportCurrentReport } from "../selectors/save_report_selector.js";
import { logVisualizationOpen } from "../services/telemetry/tracking_events.js";
import {
    getVisualizationClassType,
    isVisualizationClassDeletedOrDeprecated,
} from "../services/visualization_class_service.js";
import { setRemovedItems } from "../store/bucket_notifications/bucket_notifications_actions.js";
import { getRemovedItems } from "../store/bucket_notifications/bucket_notifications_selector.js";
import { getCatalogParameters, hasCatalogFirstLoaded } from "../store/catalog/catalog_selector.js";
import { storeAppliedChartSort } from "../store/chart_sort/chart_sort_actions.js";
import { getDateDatasetsMeta } from "../store/date_datasets_meta/date_datasets_meta_selectors.js";
import { type IParameterWarning } from "../store/filter_bar/parameter_filter_service.js";
import { type IOpenReportResult } from "../store/report/open_report_operation.js";
import { type IAppState } from "../store/types.js";
import {
    bucketFiltersWithSelection,
    createAnalyticalDashboard,
    dateCreated,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";
import { publicDashboards } from "../tests/dashboard.test.helpers.js";
import { newInsight } from "../tests/insightMocking.test.helpers.js";
import { buildParameter } from "../tests/parameter.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IApplicationResetCarrier } from "../typings/application_reset.js";
import { type ILoadedReportItems } from "../typings/report.js";
import { getItemCacheItems } from "../utils/api.js";
import { dispatchAction } from "../utils/dispatch_action.js";
import { getInsightRef } from "../utils/insight_ref.js";
import { getRouteParams, getRouteUri, setLocation } from "../utils/location.js";
import { buildOpenReportFinished } from "../utils/open_report_actions.js";

import { CatalogSagaActionTypeKeys } from "./catalog/catalog_saga_actions.js";
import {
    buildOpenReportResult,
    ensureDominantDatasetSelected,
    fetchDashboards,
    fetchDraftReport,
    fetchReport,
    getDuration,
    getInsight,
    getObjectsReferencing,
    getReferencedObjects,
    getStartTime,
    openReportRequested,
    restoreInsightParameterFilters,
    selectOpenReportFailureReset,
    showOpenReportMessage,
    updateCatalogWithExtras,
} from "./open_report_sagas.js";

// the boundary computation is stubbed in the orchestration specs — the operation itself is
// pinned by store/report/test/open_report_operation.test.ts against the real chain
// an opaque stand-in — the sagas forward it by identity and never look inside
const stubOpenReportResult = {} as IOpenReportResult;

const resetWarning: IParameterWarning = {
    kind: "reset",
    ref: idRef("threshold", "parameter"),
    name: "Threshold",
};

const reportId = "12345";
const projectId = "projectid";
const dummyReportUri = `/gdc/md/${projectId}/obj/${reportId}`;
const dummyReportUriRef = uriRef(dummyReportUri);
const dummySorts = [newAttributeSort("a1", "asc")];

const dummyInsight = newInsight("foo", `foo_${reportId}`, `/gdc/md/${projectId}/obj/${reportId}`, (insight) =>
    insight
        .title("report")
        .sorts(dummySorts)
        .buckets([
            {
                localIdentifier: ATTRIBUTE,
                items: [{ attribute: { localIdentifier: "a1", displayForm: idRef("attr") } }],
            },
        ]),
);

// an additional date filter on a granularity the date dataset no longer has
const orphanedDateFilterInsight = newInsight(
    "foo",
    `foo_${reportId}`,
    `/gdc/md/${projectId}/obj/${reportId}`,
    (insight) =>
        insight.filters([
            newNegativeAttributeFilter(idRef("delivery_date.minuteOfHour", "displayForm"), [], "orphan"),
        ]),
);
const deliveryDateMetaWithoutMinutes = {
    items: [
        {
            identifier: "delivery_date",
            title: "Delivery date",
            ref: idRef("delivery_date", "dataSet"),
            attributes: [],
        },
    ],
} as unknown as ReturnType<typeof getDateDatasetsMeta>;
const missingDeliveryMinuteOfHour = {
    datasetTitle: "Delivery date",
    identifier: "delivery_date.minuteOfHour",
    granularity: "GDC.time.minute_in_hour",
};
const stubFailureReset = { stub: "reset" } as unknown as IApplicationResetCarrier;

const uri = `/analyze/#/${projectId}/obj/${reportId}`;

const loadedItems: ILoadedReportItems = {
    itemCache: {},
    filterItems: {},
    allDateDatasets: { available: [], unavailable: 0 },
    availableDateDatasets: { available: [], unavailable: 0 },
    parameterFilters: [],
    parameterWarnings: [],
};
const loadedItemsWithParams: ILoadedReportItems = { ...loadedItems, parameterFilters: [] };
const loadedItemsWithWarning: ILoadedReportItems = {
    ...loadedItemsWithParams,
    parameterWarnings: [resetWarning],
};

describe("Open report sagas", () => {
    describe("openReportRequested", () => {
        it("should ask for a confirmation by default", () => {
            const action = openReport(dummyReportUriRef, false);
            const saga = testSaga(openReportRequested, action);

            saga.next()

                .select(isSaveDisabledSelector)
                .next()

                .put(openReportConfirmation(dummyReportUriRef))
                .next()

                .isDone();
        });

        it("should redirect to location with new project", () => {
            const action = openReport(dummyReportUriRef, true);

            const saga = testSaga(openReportRequested, action);

            saga.next()

                .select(isSaveDisabledSelector)
                .next(true)

                .select(getRouteUri, { reportId })
                .next(uri)

                .select(getRouteUri)
                .next(`/analyze/#/${projectId}/obj/54321`)

                .call(setLocation, uri)
                .next()

                .isDone();
        });

        it("should refresh report if redirecting to same uri", () => {
            const action = openReport(dummyReportUriRef, true);

            const saga = testSaga(openReportRequested, action);

            saga.next()

                .select(isSaveDisabledSelector)
                .next(true)

                .select(getRouteUri, { reportId })
                .next(uri)

                .select(getRouteUri)
                .next(uri)

                .call(setLocation, `${uri}/reload`)
                .next()

                .isDone();

            const saga2 = testSaga(openReportRequested, action);

            const datasetFragment = "?dataset=dataset.csv_death_stars";
            const uri2 = uri + datasetFragment;

            saga2
                .next()

                .select(isSaveDisabledSelector)
                .next(true)

                .select(getRouteUri, { reportId })
                .next(uri2)

                .select(getRouteUri)
                .next(uri2)

                .call(setLocation, `${uri}/reload${datasetFragment}`)
                .next()

                .isDone();
        });
    });

    describe("viewOpenReportMessage", () => {
        it("should finish when report has proper visualization class", () => {
            const action = openReportFinished(
                dummyInsight,
                loadedItems,
                10,
                false,
                {} as Parameters<typeof openReportFinished>[4],
            );

            const saga = testSaga(showOpenReportMessage, action);

            saga.next().isDone();
        });

        it("shows one toast per parameter warning", async () => {
            const action = openReportFinished(
                dummyInsight,
                {
                    ...loadedItemsWithParams,
                    parameterWarnings: [
                        { kind: "removed", ref: idRef("deleted_param", "parameter"), name: "deleted_param" },
                        { kind: "incompatible", ref: idRef("threshold", "parameter"), name: "Threshold" },
                        { kind: "reset", ref: idRef("scenario", "parameter"), name: "Scenario" },
                    ],
                },
                10,
                false,
                stubOpenReportResult,
            );

            const { effects } = await expectSaga(showOpenReportMessage, action).run();

            expect(effects.put).toEqual([
                put(
                    addMessage({
                        id: expect.stringMatching(/^messages\.parameterRemoved:/),
                        type: "warning",
                        translationKey: "messages.parameterRemoved",
                        values: { name: "deleted_param" },
                        durationInMs: 8000,
                    }),
                ),
                put(
                    addMessage({
                        id: expect.stringMatching(/^messages\.parameterIncompatible:/),
                        type: "warning",
                        translationKey: "messages.parameterIncompatible",
                        values: { name: "Threshold" },
                        durationInMs: 8000,
                    }),
                ),
                put(
                    addMessage({
                        id: expect.stringMatching(/^messages\.parameterReset:/),
                        type: "warning",
                        translationKey: "messages.parameterReset",
                        values: { name: "Scenario" },
                        durationInMs: 8000,
                    }),
                ),
            ]);
        });

        it("should show warning message when report has no proper visualization class and use default class", () => {
            const action = openReportFinished(
                dummyInsight,
                loadedItems,
                10,
                true,
                {} as Parameters<typeof openReportFinished>[4],
            );

            const state: IAppState = buildInitialState();
            const saga = testSaga(showOpenReportMessage, action);

            saga.next()
                .select()
                .next(state)
                .call(getVisualizationClassType, state.data.visualizationClass)
                .next("table")
                .put(showWarningMessage("messages.defaultTable"))
                .next()
                .isDone();

            const saga2 = testSaga(showOpenReportMessage, action);

            saga2
                .next()
                .select()
                .next(state)
                .call(getVisualizationClassType, state.data.visualizationClass)
                .next("pie")
                .put(showWarningMessage("messages.defaultOther"))
                .next()
                .isDone();
        });

        it("should not put showWarningMessage when isDraft is true", async () => {
            const action = openReportFinished(
                dummyInsight,
                loadedItems,
                10,
                false,
                {} as Parameters<typeof openReportFinished>[4],
                true,
            );
            const saga: RunResult = await expectSaga(showOpenReportMessage, action).run();

            expect(saga.effects.put).toBe(undefined);
        });
    });

    describe("fetchReport", () => {
        it.each([true, false])(
            "should fetch given saga and call open report for useDefaultClass: %p",
            async (useDefaultClass) => {
                const startTime = 10;
                const duration = 25;
                const state: IAppState = buildInitialState();
                const analyticalDashboards = [createAnalyticalDashboard("Sales", "Bee", 123)];

                const saga: RunResult = await expectSaga(fetchReport, projectId, reportId)
                    .provide([
                        [select(), state],
                        [select(hasCatalogFirstLoaded), true],
                        [select(getDateDatasetsMeta), { items: [] }],
                        [
                            select(getTagsConfiguration),
                            { includeObjectsWithTags: [], excludeObjectsWithTags: [] },
                        ],
                        [select(enableAnalyticalDesignerCatalogSideload), false],
                        [call(getStartTime), startTime],
                        [call(getInsight, projectId, reportId, false), { insight: dummyInsight }],
                        [call(getObjectsReferencing, projectId, dummyInsight), analyticalDashboards],
                        [call(getItemCacheItems, dummyInsight, state), loadedItems],
                        [
                            call(restoreInsightParameterFilters, dummyInsight),
                            { filters: [], warnings: [resetWarning] },
                        ],
                        [call(getDuration, startTime), duration],
                        [call(fetchDashboards, projectId), publicDashboards],
                        [call(logVisualizationOpen, { time: duration, state }), {}],
                        [
                            call(
                                isVisualizationClassDeletedOrDeprecated,
                                state,
                                insightVisualizationUrl(dummyInsight),
                            ),
                            useDefaultClass,
                        ],
                        [
                            call(
                                buildOpenReportResult,
                                dummyInsight,
                                loadedItemsWithWarning,
                                useDefaultClass,
                            ),
                            stubOpenReportResult,
                        ],
                    ])
                    .run();

                expect(saga.effects.put).toEqual([
                    put(openReportStarted(projectId, reportId)),
                    put(updateInsightUsageOnDashboards(analyticalDashboards, publicDashboards)),
                    put(storeAppliedChartSort(dummySorts)),
                    put(
                        openReportFinished(
                            dummyInsight,
                            loadedItemsWithWarning,
                            duration,
                            useDefaultClass,
                            stubOpenReportResult,
                        ),
                    ),
                ]);
            },
        );

        it("should fetch related catalog items and update extras if ff enabled and include/exclude present", async () => {
            const startTime = 10;
            const duration = 25;
            const state: IAppState = buildInitialState();
            const analyticalDashboards = [createAnalyticalDashboard("Sales", "Bee", 123)];
            const catalogItems: Array<ICatalogFact | ICatalogMeasure | ICatalogAttribute> = [];

            const saga: RunResult = await expectSaga(fetchReport, projectId, reportId)
                .provide([
                    [select(), state],
                    [select(hasCatalogFirstLoaded), true],
                    [select(getDateDatasetsMeta), { items: [] }],
                    [
                        select(getTagsConfiguration),
                        { includeObjectsWithTags: ["Activity"], excludeObjectsWithTags: [] },
                    ],
                    [select(enableAnalyticalDesignerCatalogSideload), true],
                    [call(getStartTime), startTime],
                    [call(getInsight, projectId, reportId, true), { insight: dummyInsight, catalogItems }],
                    [call(updateCatalogWithExtras, { catalogItems }), {}],
                    [call(getObjectsReferencing, projectId, dummyInsight), analyticalDashboards],
                    [call(getItemCacheItems, dummyInsight, state), loadedItems],
                    [call(restoreInsightParameterFilters, dummyInsight), { filters: [], warnings: [] }],
                    [call(getDuration, startTime), duration],
                    [call(fetchDashboards, projectId), publicDashboards],
                    [call(logVisualizationOpen, { time: duration, state }), {}],
                    [
                        call(
                            isVisualizationClassDeletedOrDeprecated,
                            state,
                            insightVisualizationUrl(dummyInsight),
                        ),
                        true,
                    ],
                    [
                        call(buildOpenReportResult, dummyInsight, loadedItemsWithParams, true),
                        stubOpenReportResult,
                    ],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(openReportStarted(projectId, reportId)),
                put(updateInsightUsageOnDashboards(analyticalDashboards, publicDashboards)),
                put(storeAppliedChartSort(dummySorts)),
                put(
                    openReportFinished(
                        dummyInsight,
                        loadedItemsWithParams,
                        duration,
                        true,
                        stubOpenReportResult,
                    ),
                ),
            ]);

            expect(saga.effects.call).toContainEqual(call(updateCatalogWithExtras, { catalogItems }));
        });

        it("should fail the open as not found, naming the date filter items the workspace no longer has", async () => {
            const state: IAppState = buildInitialState();

            const saga: RunResult = await expectSaga(fetchReport, projectId, reportId)
                .provide([
                    [select(), state],
                    [select(hasCatalogFirstLoaded), true],
                    [select(getDateDatasetsMeta), deliveryDateMetaWithoutMinutes],
                    [
                        select(getTagsConfiguration),
                        { includeObjectsWithTags: [], excludeObjectsWithTags: [] },
                    ],
                    [select(enableAnalyticalDesignerCatalogSideload), false],
                    [call(getStartTime), 10],
                    [call(getInsight, projectId, reportId, false), { insight: orphanedDateFilterInsight }],
                    [call(getObjectsReferencing, projectId, orphanedDateFilterInsight), []],
                    [call(selectOpenReportFailureReset), stubFailureReset],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(openReportStarted(projectId, reportId)),
                put(openReportFailed(stubFailureReset, false, undefined, [missingDeliveryMinuteOfHour])),
            ]);
            // the failure happens before anything sends the filters to the backend
            expect(saga.effects.call).not.toContainEqual(
                call(getItemCacheItems, orphanedDateFilterInsight, state),
            );
        });
    });

    describe("fetchDraftReport", () => {
        it.each([true, false])(
            "should fetch given saga and call open report for useDefaultClass: %p",
            async (useDefaultClass) => {
                const state: IAppState = buildInitialState();

                const saga: RunResult = await expectSaga(fetchDraftReport, projectId, reportId)
                    .provide([
                        [select(), state],
                        [select(hasCatalogFirstLoaded), true],
                        [select(getDateDatasetsMeta), { items: [] }],
                        [select(enableAnalyticalDesignerCatalogSideload), false],
                        [
                            select(getTagsConfiguration),
                            { includeObjectsWithTags: [], excludeObjectsWithTags: [] },
                        ],
                        [call(getInsight, projectId, reportId, false), { insight: dummyInsight }],
                        [call(getItemCacheItems, dummyInsight, state), loadedItems],
                        [call(restoreInsightParameterFilters, dummyInsight), { filters: [], warnings: [] }],
                        [
                            call(
                                isVisualizationClassDeletedOrDeprecated,
                                state,
                                insightVisualizationUrl(dummyInsight),
                            ),
                            useDefaultClass,
                        ],
                        [
                            call(buildOpenReportResult, dummyInsight, loadedItemsWithParams, useDefaultClass),
                            stubOpenReportResult,
                        ],
                    ])
                    .run();

                expect(saga.effects.put).toEqual([
                    put(openReportStarted(projectId, reportId)),
                    put(storeAppliedChartSort(dummySorts)),
                    put(
                        openReportFinished(
                            dummyInsight,
                            loadedItemsWithParams,
                            0,
                            useDefaultClass,
                            stubOpenReportResult,
                            true,
                        ),
                    ),
                ]);
            },
        );

        it("should fail the draft open as not found, naming the date filter items the workspace no longer has", async () => {
            const state: IAppState = buildInitialState();

            const saga: RunResult = await expectSaga(fetchDraftReport, projectId, reportId)
                .provide([
                    [select(), state],
                    [select(hasCatalogFirstLoaded), true],
                    [select(getDateDatasetsMeta), deliveryDateMetaWithoutMinutes],
                    [select(enableAnalyticalDesignerCatalogSideload), false],
                    [
                        select(getTagsConfiguration),
                        { includeObjectsWithTags: [], excludeObjectsWithTags: [] },
                    ],
                    [call(getInsight, projectId, reportId, false), { insight: orphanedDateFilterInsight }],
                    [call(selectOpenReportFailureReset), stubFailureReset],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(openReportStarted(projectId, reportId)),
                put(openReportFailed(stubFailureReset, true, undefined, [missingDeliveryMinuteOfHour])),
            ]);
        });
    });

    describe("restoreInsightParameterFilters", () => {
        const threshold = buildParameter("threshold", "Threshold", {
            type: "NUMBER",
            defaultValue: 10,
            constraints: { min: 0, max: 100 },
        });
        const scenario = buildParameter("scenario", "Scenario", {
            type: "STRING",
            defaultValue: "Actual",
            constraints: { allowedValues: [{ value: "Actual" }, { value: "Pessimistic" }] },
        });
        const markup = buildParameter("markup", "Markup", { type: "NUMBER", defaultValue: 0.15 });
        const catalogParameters = [threshold, scenario, markup];

        function runWithParameters(
            parameters: IInsightParameterValue[],
            parametersEnabled = true,
            stringParametersEnabled = true,
            catalogLoaded = true,
        ) {
            const insight: IInsight = { ...dummyInsight, insight: { ...dummyInsight.insight, parameters } };
            return expectSaga(restoreInsightParameterFilters, insight)
                .provide([
                    [select(enableParameters), parametersEnabled],
                    [select(enableStringParameters), stringParametersEnabled],
                    [select(hasCatalogFirstLoaded), catalogLoaded],
                    [select(getCatalogParameters), catalogParameters],
                ])
                .run();
        }

        it("returns no filters and no warning when parameters are disabled", async () => {
            const { returnValue } = await runWithParameters(
                [{ ref: idRef("deleted_param", "parameter"), value: 1 }],
                false,
            );

            expect(returnValue).toEqual({ filters: [], warnings: [] });
        });

        it("returns no filters and no warning when the catalog did not load", async () => {
            const { returnValue } = await runWithParameters(
                [{ ref: threshold.ref, value: 50 }],
                true,
                true,
                false,
            );

            expect(returnValue).toEqual({ filters: [], warnings: [] });
        });

        it("skips string values without a warning when string parameters are disabled", async () => {
            const { returnValue } = await runWithParameters(
                [
                    { ref: scenario.ref, value: "Optimistic" },
                    { ref: idRef("deleted_param", "parameter"), value: "Budget" },
                    { ref: threshold.ref, value: 50 },
                ],
                true,
                false,
            );

            expect(returnValue).toMatchObject({
                filters: [{ parameterRef: threshold.ref, value: 50 }],
                warnings: [],
            });
        });

        it("drops removed and incompatible values and returns one warning per parameter", async () => {
            const { returnValue } = await runWithParameters([
                { ref: idRef("deleted_param", "parameter"), value: 1 },
                { ref: threshold.ref, value: "Budget" },
                { ref: scenario.ref, value: "Optimistic" },
            ]);

            expect(returnValue).toMatchObject({
                filters: [{ parameterRef: scenario.ref, value: "Optimistic" }],
                warnings: [
                    { kind: "removed", ref: idRef("deleted_param", "parameter"), name: "deleted_param" },
                    { kind: "incompatible", ref: threshold.ref, name: "Threshold" },
                    { kind: "reset", ref: scenario.ref, name: "Scenario" },
                ],
            });
        });

        it("keeps the opened insight unchanged when a stored value is out of range", async () => {
            const parameters = [{ ref: threshold.ref, value: 500 }];
            const {
                returnValue: { filters: parameterFilters },
            } = await runWithParameters(parameters);
            const emptyInsight = newInsight("local:table", "foo", "/gdc/md/vo1");
            const insight: IInsight = { ...emptyInsight, insight: { ...emptyInsight.insight, parameters } };
            const initializedState = withData(getInitializedState(), {
                visualizationClasses: [tableVisualizationClass],
            });
            const openedItems: ILoadedReportItems = {
                itemCache: {},
                filterItems: {},
                allDateDatasets: { available: [], unavailable: 0 },
                availableDateDatasets: { available: [], unavailable: 0 },
                parameterFilters,
                parameterWarnings: [],
            };

            const state = combinedRootReducer(
                initializedState,
                buildOpenReportFinished(initializedState, insight, openedItems, 123, false),
            );

            expect(isSavedReportCurrentReport(state)).toBe(true);
        });
    });

    describe("getInsightRef", () => {
        it("should return idRef for identifier", () => {
            const identifier = "identifier";

            const actual = getInsightRef(projectId, identifier);
            const expected = idRef(identifier);

            expect(actual).toEqual(expected);
        });

        it("should return uriRef for objectId", () => {
            const objectId = "12345";

            const actual = getInsightRef(projectId, objectId);
            const expected = uriRef(`/gdc/md/${projectId}/obj/${objectId}`);

            expect(actual).toEqual(expected);
        });

        it("should return idRef for GUID starting with numbers", () => {
            const identifier = "34c7cb35-2041-4c60-8187-e4ee596f4641";

            const actual = getInsightRef(projectId, identifier);
            const expected = idRef(identifier);

            expect(actual).toEqual(expected);
        });
    });

    describe("ensureDominantDatasetSelected", () => {
        const notMatchingDatasetId = "anotherDataset";

        const mockNonProductionDataset: IMetadataObject = {
            description: "",
            id: "nonproductionDataset",
            production: false,
            ref: idRef("nonproductionDataset"),
            title: "Foo",
            type: "dataSet",
            uri: "/gdc/md/foo",
            deprecated: false,
            unlisted: false,
        };

        const mockProductionDataset: IMetadataObject = {
            description: "",
            id: "productionDataset",
            production: true,
            ref: idRef("productionDataset"),
            title: "Foo",
            type: "dataSet",
            uri: "/gdc/md/foo",
            deprecated: false,
            unlisted: false,
        };

        it("should change dataset if desired dataset id is not matching and production is false", async () => {
            await expectSaga(ensureDominantDatasetSelected, [mockNonProductionDataset])
                .provide([
                    [select(getRouteParams), { dataset: notMatchingDatasetId }],
                    [call(getReferencedObjects, projectId, dummyInsight), [mockNonProductionDataset]],
                ])
                .put(changeDataset(mockNonProductionDataset.id))
                .take(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_FINISHED)
                .silentRun();
        });

        it("should not change dataset if desired dataset id is not matching and production is true", async () => {
            await expectSaga(ensureDominantDatasetSelected, [mockNonProductionDataset])
                .provide([
                    [select(getRouteParams), {}],
                    [call(getReferencedObjects, projectId, dummyInsight), [mockProductionDataset]],
                ])
                .not.put(changeDataset(mockProductionDataset.id))
                .silentRun();
        });

        it("should change dataset if desired production flag is false and not matching", async () => {
            await expectSaga(ensureDominantDatasetSelected, [mockNonProductionDataset])
                .provide([
                    [select(getRouteParams), {}],
                    [call(getReferencedObjects, projectId, dummyInsight), [mockNonProductionDataset]],
                ])
                .put(changeDataset(mockNonProductionDataset.id))
                .take(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_FINISHED)
                .silentRun();
        });

        it("should not change dataset if desired production flag is false and matching", async () => {
            await expectSaga(ensureDominantDatasetSelected, [mockNonProductionDataset])
                .provide([
                    [select(getRouteParams), { dataset: mockNonProductionDataset.id }],
                    [call(getReferencedObjects, projectId, dummyInsight), [mockNonProductionDataset]],
                ])
                .not.put(changeDataset(mockNonProductionDataset.id))
                .silentRun();
        });

        it("should change dataset if desired production flag is true and not matching", async () => {
            await expectSaga(ensureDominantDatasetSelected, [mockProductionDataset])
                .provide([
                    [select(getRouteParams), { dataset: mockNonProductionDataset.id }],
                    [call(getReferencedObjects, projectId, dummyInsight), [mockProductionDataset]],
                ])
                .put(changeDataset(""))
                .take(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_FINISHED)
                .silentRun();
        });

        it("should not change dataset if desired production flag is true and matching", async () => {
            await expectSaga(ensureDominantDatasetSelected, [mockProductionDataset])
                .provide([
                    [select(getRouteParams), {}],
                    [call(getReferencedObjects, projectId, dummyInsight), [mockProductionDataset]],
                ])
                .not.put(changeDataset(""))
                .silentRun();
        });
    });

    describe("resetBucketNotifications", () => {
        function getOpenReportFinishedAction(properties?: VisualizationProperties, useDefaultClass = false) {
            const loadedItems: ILoadedReportItems = {
                itemCache: {
                    "attribute.id": {
                        identifier: "attribute.id",
                        dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
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
                availableDateDatasets: { available: [], unavailable: 0 },
                parameterFilters: [],
                parameterWarnings: [],
            };

            const insight = newInsight("/gdc/md/v1", "foo", "/gdc/md/obj/foo", (i) =>
                i.filters(bucketFiltersWithSelection).properties(properties),
            );

            const time = 123;
            return buildOpenReportFinished(
                getInitializedState(),
                insight,
                loadedItems,
                time,
                useDefaultClass,
            );
        }

        describe("OPEN_REPORT_STARTED", () => {
            it("should reset removed items in state", async () => {
                let state = getInitializedState();
                const setRemovedItemsAction = setRemovedItems({
                    measures: 1,
                    measureValueFilters: 2,
                    rankingFilter: true,
                });
                state = combinedRootReducer(state, setRemovedItemsAction);
                const openReportStartedAction = getOpenReportFinishedAction();

                const reducedState = await dispatchAction(state, openReportStartedAction);
                expect(getRemovedItems(reducedState)).toBeNull();
            });
        });

        describe("OPEN_REPORT_FINISHED", () => {
            it("should reset removed items in state", async () => {
                let state = getInitializedState();
                const setRemovedItemsAction = setRemovedItems({
                    measures: 1,
                    measureValueFilters: 2,
                    rankingFilter: true,
                });
                state = combinedRootReducer(state, setRemovedItemsAction);
                const openReportFinishedAction = getOpenReportFinishedAction();

                const reducedState = await dispatchAction(state, openReportFinishedAction);
                expect(getRemovedItems(reducedState)).toBeNull();
            });
        });
    });
});
