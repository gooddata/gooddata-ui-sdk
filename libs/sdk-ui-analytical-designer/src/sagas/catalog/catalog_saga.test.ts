// (C) 2019-2026 GoodData Corporation

import { createMockTask } from "@redux-saga/testing-utils";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { dynamic, throwError } from "redux-saga-test-plan/providers";
import { call, fork, put, select } from "redux-saga/effects";
import { describe, expect, it, vi } from "vitest";

import { type IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type ICatalogAttributeHierarchy,
    type IInsightDefinition,
    type IParameterMetadataObject,
    idRef,
    newInsightDefinition,
    newMeasure,
    uriRef,
} from "@gooddata/sdk-model";

import { dataSourceError } from "../../actions/messages_actions.js";
import { MEASURES } from "../../constants/bucket.js";
import { LOCAL_BAR } from "../../constants/visualization_types.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { enableParameters, enableStringParameters } from "../../selectors/feature_flag_selector.js";
import { getInsightWithBucketsViaMd } from "../../selectors/insight_selectors.js";
import { getIntlMessagesForLocale, getLocale } from "../../selectors/intl_selector.js";
import { getTagsConfiguration, isTagsConfigurationChanged } from "../../selectors/route_selector.js";
import { extendedReferencePointApplied } from "../../store/buckets/buckets_operation_events.js";
import {
    getAttributeHierarchies,
    hasAvailabilityError,
    hasCatalogFirstLoaded,
} from "../../store/catalog/catalog_selector.js";
import {
    setAttributeHierarchies,
    setAttributeHierarchiesChanged,
    setAvailabilityError,
    setCatalogItemsAvailability,
    setCatalogParameters,
    setItemTooltipDetails,
    setLoadingAvailability,
} from "../../store/catalog/catalog_store_actions.js";
import { routeParamsChanged } from "../../store/router/router_actions.js";
import { getCatalogMeasure } from "../../tests/catalog.test.helpers.js";
import { buildAttributeHierarchyMock } from "../../tests/catalog_attribute_hierarchy.test.helpers.js";
import { type IOrganizedCatalogItem } from "../../typings/catalog.js";
import { loadDetailParts } from "../../utils/catalog_details_loader_api.js";
import { getRouteParams } from "../../utils/location.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES, createIntl } from "../../utils/translations.js";
import { updateSelectedDataset } from "../datasets_sagas.js";
import { loadDateDatasetsWithAllDates } from "../date_datasets/date_datasets_sagas.js";

import {
    fetchAvailableItemsUris,
    fetchCatalog,
    fetchItemDetails,
    handleDeleteCatalogAttributeHierarchy,
    handleUpdateCatalogAttributeHierarchy,
    loadCatalog,
    loadCatalogItemsAndGroups,
    loadCatalogItemsAvailability,
    loadIsWorkspaceEmpty,
    loadParameters,
    setTooltipDetailPart,
    updateCatalogItemsAvailability,
    watchCatalog,
    watchExtendedReferencePointChange,
} from "./catalog_saga.js";
import { catalogLoadSucceeded } from "./catalog_saga_actions.js";
import {
    attributeHierarchyModified,
    deleteCatalogAttributeHierarchy,
    requestCatalogItemTooltipDetails,
    updateCatalogAttributeHierarchy,
} from "./catalog_ui_actions.js";

/**
 * The availability flow keys on the APPLIED EVENT, not on the EXTENDED_REFERENCE_POINT_CHANGED
 * trigger: it reads `getInsightWithBucketsViaMd`, which reads state the trigger does not write.
 * This builds an event whose payload is irrelevant to these specs — every value the handler reads is
 * `provide`d — so only the TYPE matters here.
 */
const extendedReferencePointAppliedEvent = (extendedReferencePoint: unknown) =>
    extendedReferencePointApplied({
        extendedReferencePoint: extendedReferencePoint as never,
        buckets: [],
        sortItems: undefined,
        filterBar: undefined,
        referencePoint: undefined,
        isVisualizationMdObjectValid: true,
    });

describe("Catalog sagas", () => {
    describe("watchCatalog", () => {
        it("should refresh items availability and date datasets when reference point changes", async () => {
            const mockedReferencePoint = { properties: "abc" };

            const insight = newInsightDefinition(LOCAL_BAR);

            const { effects } = await expectSaga(watchCatalog)
                .provide([
                    [select(getInsightWithBucketsViaMd), insight],
                    [select(hasAvailabilityError), false],
                    [fork(updateCatalogItemsAvailability, insight), createMockTask()],
                ])
                .dispatch(extendedReferencePointAppliedEvent(mockedReferencePoint))
                .silentRun(0);

            expect(effects.fork).toContainEqual(fork(updateCatalogItemsAvailability, insight));
        });

        describe("SAGA_ROUTE_PARAMS_CHANGED action", () => {
            it("should reload catalog when tags configuration has changed", async () => {
                const { effects } = await expectSaga(watchCatalog)
                    .provide([
                        [call(updateSelectedDataset), false],
                        [select(isTagsConfigurationChanged), true],
                        [select(hasCatalogFirstLoaded), true],
                        [call(loadCatalog), () => {}],
                    ])
                    .dispatch(routeParamsChanged())
                    .silentRun(0);

                expect(effects.call).toContainEqual(call(loadCatalog, false));
            });

            it("should NOT reload catalog when tags configuration and dataset has NOT changed and firstLoaded flag has changed", async () => {
                const { effects } = await expectSaga(watchCatalog)
                    .provide([
                        [call(updateSelectedDataset), false],
                        [select(isTagsConfigurationChanged), false],
                        [select(hasCatalogFirstLoaded), true],
                    ])
                    .dispatch(routeParamsChanged())
                    .not.call(loadCatalog)
                    .silentRun(0);

                expect(effects.call).toEqual([call(updateSelectedDataset)]);
            });

            it("should reload catalog when dataset has changed", async () => {
                const { effects } = await expectSaga(watchCatalog)
                    .provide([
                        [call(updateSelectedDataset), true],
                        [select(isTagsConfigurationChanged), false],
                        [select(hasCatalogFirstLoaded), true],
                        [call(loadCatalog, true), () => {}],
                    ])
                    .dispatch(routeParamsChanged())
                    .silentRun(0);

                expect(effects.call).toContainEqual(call(loadCatalog, true));
            });

            it("should reload catalog when firstLoaded flag has not changed", async () => {
                const { effects } = await expectSaga(watchCatalog)
                    .provide([
                        [call(updateSelectedDataset), false],
                        [select(isTagsConfigurationChanged), false],
                        [select(hasCatalogFirstLoaded), false],
                        [call(loadCatalog), () => {}],
                    ])
                    .dispatch(routeParamsChanged())
                    .silentRun(0);

                expect(effects.call).toContainEqual(call(loadCatalog, false));
            });
        });
    });

    describe("loadCatalog", () => {
        const projectId = "projectID";

        const catalogOptions: IWorkspaceCatalogFactoryOptions = {
            includeTags: [{ identifier: "include" }],
            excludeTags: [{ identifier: "exclude" }],
            dataset: { identifier: "dataset" },
            production: false,
            types: ["attribute", "fact", "measure"],
        };

        it("should call relevant sagas", async () => {
            await expectSaga(loadCatalog)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getRouteParams), { dataset: catalogOptions.dataset }],
                    [
                        select(getTagsConfiguration),
                        {
                            includeObjectsWithTags: catalogOptions.includeTags,
                            excludeObjectsWithTags: catalogOptions.excludeTags,
                        },
                    ],
                    [call(loadCatalogItemsAndGroups), undefined],
                    [call(loadDateDatasetsWithAllDates), undefined],
                    [call(loadParameters), undefined],
                ])
                .call(loadCatalogItemsAndGroups)
                .call(loadDateDatasetsWithAllDates)
                .call(loadParameters)
                .put(catalogLoadSucceeded())
                .silentRun(0);
        });

        it("should call action SHOW_ERROR_MESSAGE when loading items and groups request fail", async () => {
            await expectSaga(loadCatalog)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getRouteParams), { dataset: catalogOptions.dataset }],
                    [
                        select(getTagsConfiguration),
                        {
                            includeObjectsWithTags: catalogOptions.includeTags,
                            excludeObjectsWithTags: catalogOptions.excludeTags,
                        },
                    ],
                    [call(loadCatalogItemsAndGroups), throwError(new Error("error"))],
                    [call(loadDateDatasetsWithAllDates), undefined],
                    [call(loadParameters), undefined],
                ])
                .put(dataSourceError(new Error("error")))
                .not.put(catalogLoadSucceeded())
                .silentRun(0);
        });

        it("should fail catalog load when parameter fetch fails", async () => {
            await expectSaga(loadCatalog)
                .provide([
                    [select(getProjectId), projectId],
                    [select(getRouteParams), { dataset: catalogOptions.dataset }],
                    [
                        select(getTagsConfiguration),
                        {
                            includeObjectsWithTags: catalogOptions.includeTags,
                            excludeObjectsWithTags: catalogOptions.excludeTags,
                        },
                    ],
                    [call(loadCatalogItemsAndGroups), undefined],
                    [call(loadDateDatasetsWithAllDates), undefined],
                    [call(loadParameters), throwError(new Error("parameters boom"))],
                ])
                .put(dataSourceError(new Error("parameters boom")))
                .silentRun(0);
        });
    });

    describe("loadParameters", () => {
        const topN: IParameterMetadataObject = {
            type: "parameter",
            id: "topN",
            uri: "/topN",
            ref: idRef("topN", "parameter"),
            title: "Top N",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            definition: { type: "NUMBER", defaultValue: 10 },
        };

        const scenario: IParameterMetadataObject = {
            ...topN,
            id: "scenario",
            uri: "/scenario",
            ref: idRef("scenario", "parameter"),
            title: "Scenario",
            definition: { type: "STRING", defaultValue: "Actual" },
        };

        it("sets an empty parameter catalog when parameters are disabled", () => {
            testSaga(loadParameters)
                .next()
                .select(enableParameters)
                .next(false)
                .put(setCatalogParameters([]))
                .next()
                .isDone();
        });

        it("stores only NUMBER parameters when enableStringParameters is off", () => {
            const iterator = loadParameters() as Generator<unknown, void, unknown>;

            expect(iterator.next().value).toEqual(select(enableParameters));
            expect(iterator.next(true).value).toEqual(select(enableStringParameters));
            expect(iterator.next(false).value).toEqual(select(getProjectId));
            expect(iterator.next("projectID").value).toMatchObject({ type: "CALL" });
            expect(iterator.next([topN, scenario]).value).toEqual(put(setCatalogParameters([topN])));
            expect(iterator.next().done).toBe(true);
        });

        it("stores STRING parameters when enableStringParameters is on", () => {
            const iterator = loadParameters() as Generator<unknown, void, unknown>;

            expect(iterator.next().value).toEqual(select(enableParameters));
            expect(iterator.next(true).value).toEqual(select(enableStringParameters));
            expect(iterator.next(true).value).toEqual(select(getProjectId));
            expect(iterator.next("projectID").value).toMatchObject({ type: "CALL" });
            expect(iterator.next([topN, scenario]).value).toEqual(
                put(setCatalogParameters([topN, scenario])),
            );
            expect(iterator.next().done).toBe(true);
        });
    });

    describe("loadCatalogItemsAvailability", () => {
        const projectId = "projectID";
        const insight = newInsightDefinition(LOCAL_BAR, (i) =>
            i.buckets([{ items: [], localIdentifier: MEASURES }]),
        );
        const insightWithNoBuckets = newInsightDefinition(LOCAL_BAR);

        it("should reset catalog items availability without setting loading flag and calling API when there are no bucket items", async () => {
            const { effects } = await expectSaga(loadCatalogItemsAvailability, insightWithNoBuckets)
                .provide([[select(getProjectId), projectId]])
                .not.call.fn(setLoadingAvailability)
                .not.call.fn(setCatalogItemsAvailability)
                .silentRun(0);

            expect(effects.put).toEqual([
                put(setCatalogItemsAvailability(null)),
                put(setLoadingAvailability(false)),
            ]);
        });

        it("should update catalog items availability", async () => {
            const catalogAvailabilityResponse = ["item/uri"];

            const { effects } = await expectSaga(loadCatalogItemsAvailability, insight)
                .provide([
                    [select(getProjectId), projectId],
                    [call(fetchAvailableItemsUris, insight), catalogAvailabilityResponse],
                ])
                .silentRun(0);

            expect(effects.put).toEqual([
                put(setLoadingAvailability(true)),
                put(setAvailabilityError(null)),
                put(setCatalogItemsAvailability(catalogAvailabilityResponse)),
                put(setLoadingAvailability(false)),
            ]);
        });

        it("should call action SHOW_ERROR_MESSAGE when loading catalog items availability request fail", async () => {
            const { effects } = await expectSaga(loadCatalogItemsAvailability, insight)
                .provide([
                    [select(getProjectId), projectId],
                    [call(fetchAvailableItemsUris, insight), throwError(new Error("error"))],
                ])
                .silentRun(0);

            expect(effects.put).toEqual([
                put(setLoadingAvailability(true)),
                put(setAvailabilityError(null)),
                put(setLoadingAvailability(false)),
                put(setAvailabilityError(new Error("error"))),
                put(dataSourceError(new Error("error"))),
            ]);
        });
    });

    describe("updateCatalogItemsAvailability", () => {
        it("should load catalog available items and dateDatasets in parallel", () => {
            const insight = newInsightDefinition(LOCAL_BAR);
            testSaga(updateCatalogItemsAvailability, insight)
                .next()
                .all([call(loadCatalogItemsAvailability, insight), call(loadDateDatasetsWithAllDates)])
                .next()
                .isDone();
        });
    });

    describe("watchExtendedReferencePointChange", () => {
        const insightWithOneMeasure = newInsightDefinition(LOCAL_BAR, (i) =>
            i.buckets([
                { localIdentifier: MEASURES, items: [newMeasure(uriRef("/md/123"), (m) => m.localId("m1"))] },
            ]),
        );

        const insightWithTwoMeasures = newInsightDefinition(LOCAL_BAR, (i) =>
            i.buckets([
                {
                    localIdentifier: MEASURES,
                    items: [
                        newMeasure(uriRef("/md/123"), (m) => m.localId("m1")),
                        newMeasure(uriRef("/md/abc"), (m) => m.localId("m2")),
                    ],
                },
            ]),
        );

        function* insightGenerator(insights: IInsightDefinition[]) {
            for (const insight of insights) {
                yield insight;
            }
        }

        it("should start task on the first reference point change", async () => {
            const cancel = vi.fn();
            const mockTask = { ...createMockTask(), cancel };
            const mockedReferencePoint = { properties: "abc" };
            const { effects } = await expectSaga(watchExtendedReferencePointChange)
                .provide([
                    [select(getInsightWithBucketsViaMd), insightWithOneMeasure],
                    [select(hasAvailabilityError), false],
                    [fork(updateCatalogItemsAvailability, insightWithOneMeasure), mockTask],
                ])
                .dispatch(extendedReferencePointAppliedEvent(mockedReferencePoint))
                .silentRun(0);

            expect(effects.fork).toEqual([fork(updateCatalogItemsAvailability, insightWithOneMeasure)]);
            expect(cancel).not.toHaveBeenCalled();
        });

        it("should start task on the next run when relevant part of MD object is different", async () => {
            const currentInsight = insightGenerator([insightWithOneMeasure, insightWithTwoMeasures]);

            const cancel = vi.fn();
            const mockTask = { ...createMockTask(), cancel };
            const mockedReferencePoint = { properties: "abc" };
            const { effects } = await expectSaga(watchExtendedReferencePointChange)
                .provide([
                    [select(getInsightWithBucketsViaMd), dynamic(() => currentInsight.next().value)],
                    [select(hasAvailabilityError), false],
                    [fork(updateCatalogItemsAvailability, insightWithOneMeasure), mockTask],
                    [fork(updateCatalogItemsAvailability, insightWithTwoMeasures), mockTask],
                ])
                .dispatch(extendedReferencePointAppliedEvent(mockedReferencePoint))
                .dispatch(extendedReferencePointAppliedEvent(mockedReferencePoint))
                .silentRun(0);

            expect(effects.fork).toEqual([
                fork(updateCatalogItemsAvailability, insightWithOneMeasure),
                fork(updateCatalogItemsAvailability, insightWithTwoMeasures),
            ]);
            expect(cancel).toHaveBeenCalled();
        });

        it("should start task on the next run when relevant part of MD object is the same but previous call did not succeed", async () => {
            const cancel = vi.fn();
            const mockTask = { ...createMockTask(), cancel };
            const mockedReferencePoint = { properties: "abc" };
            const { effects } = await expectSaga(watchExtendedReferencePointChange)
                .provide([
                    [select(getInsightWithBucketsViaMd), insightWithOneMeasure],
                    [select(hasAvailabilityError), true],
                    [fork(updateCatalogItemsAvailability, insightWithOneMeasure), mockTask],
                ])
                .dispatch(extendedReferencePointAppliedEvent(mockedReferencePoint))
                .dispatch(extendedReferencePointAppliedEvent(mockedReferencePoint))
                .silentRun(0);

            expect(effects.fork).toEqual([
                fork(updateCatalogItemsAvailability, insightWithOneMeasure),
                fork(updateCatalogItemsAvailability, insightWithOneMeasure),
            ]);
            expect(cancel).toHaveBeenCalled();
        });
    });

    describe("itemDetailsSaga", () => {
        const projectId = "my-project-id";
        const item: IOrganizedCatalogItem = {
            type: "date",
            identifier: "my-item-id",
            ref: { identifier: "my-item-id" },
            title: "Date",
        };
        // Two independent detail parts (e.g. an attribute's dataset and its value samples) that
        // resolve at different times; each is dispatched on its own as soon as it resolves.
        const parts: Parameters<typeof setTooltipDetailPart>[1][] = [
            Promise.resolve({ dataset: { title: "test" } }),
            Promise.resolve({ attrElements: [], attrElementsTotalCount: 0 }),
        ];

        const intl = { intl: "my intl" };

        const action = requestCatalogItemTooltipDetails(item);

        it("should load and dispatch each item detail part independently", () => {
            const saga = testSaga(fetchItemDetails, action);
            saga.next()

                .select(getLocale)
                .next(DEFAULT_LANGUAGE)

                .select(getIntlMessagesForLocale)
                .next(DEFAULT_MESSAGES[DEFAULT_LANGUAGE])

                .call(createIntl, DEFAULT_LANGUAGE, DEFAULT_MESSAGES[DEFAULT_LANGUAGE])
                .next(intl)

                .select(getProjectId)
                .next(projectId)

                .call(loadDetailParts, item, projectId, intl)
                .next(parts)

                .all(parts.map((part) => call(setTooltipDetailPart, item.identifier, part)))
                .next()

                .isDone();
        });

        it("should put data source error action if the loaded function thrown an error", () => {
            const requestError = new Error("request failed");
            const saga = testSaga(fetchItemDetails, action);
            saga.next()

                .select(getLocale)
                .next(DEFAULT_LANGUAGE)

                .select(getIntlMessagesForLocale)
                .next(DEFAULT_MESSAGES[DEFAULT_LANGUAGE])

                .call(createIntl, DEFAULT_LANGUAGE, DEFAULT_MESSAGES[DEFAULT_LANGUAGE])
                .next(intl)

                .select(getProjectId)
                .next(projectId)

                .call(loadDetailParts, item, projectId, intl)
                .throw(requestError)

                .put(dataSourceError(requestError))
                .next()

                .isDone();
        });

        it("should dispatch tooltip details for a resolved part", () => {
            const details = { dataset: { title: "test" } };
            const part: Parameters<typeof setTooltipDetailPart>[1] = Promise.resolve(details);
            const saga = testSaga(setTooltipDetailPart, item.identifier, part);
            saga.next()
                .next(details)

                .put(setItemTooltipDetails(item.identifier, details))
                .next()

                .isDone();
        });

        it("should report an error for a rejected part without affecting its siblings", () => {
            const requestError = new Error("part failed");
            // testSaga does not await the promise; the rejection is simulated with .throw() below,
            // so a placeholder avoids an unhandled promise rejection in the test run.
            const part: Parameters<typeof setTooltipDetailPart>[1] = Promise.resolve({
                dataset: { title: "placeholder" },
            });
            const saga = testSaga(setTooltipDetailPart, item.identifier, part);
            saga.next()

                // the awaited part rejects
                .throw(requestError)

                .put(dataSourceError(requestError))
                .next()

                .isDone();
        });
    });

    describe("loadIsWorkspaceEmpty", () => {
        const withoutTags: Partial<IWorkspaceCatalogFactoryOptions> = {
            excludeTags: [],
            includeTags: [],
        };

        it("should call fetchCatalog if there are no items with included/excluded objects by tags loaded", async () => {
            await expectSaga(loadIsWorkspaceEmpty, [])
                .provide([[call(fetchCatalog, withoutTags), { allItems: (): CatalogItem[] => [] }]])
                .call(fetchCatalog, withoutTags)
                .silentRun(0);
        });

        it("should not call fetchCatalog if there are some items loaded", async () => {
            const items: CatalogItem[] = [
                {
                    ...getCatalogMeasure(1),
                },
                {
                    ...getCatalogMeasure(2),
                },
            ];

            await expectSaga(loadIsWorkspaceEmpty, items).not.call(fetchCatalog, withoutTags).silentRun(0);
        });
    });

    describe("handleDeleteCatalogAttributeHierarchy", () => {
        const attributeHierarchies: ICatalogAttributeHierarchy[] = [buildAttributeHierarchyMock()];

        it("should update the catalog items and display the delete message", async () => {
            const action = deleteCatalogAttributeHierarchy(attributeHierarchies[0].attributeHierarchy.id);
            const { effects } = await expectSaga(handleDeleteCatalogAttributeHierarchy, action)
                .provide([[select(getAttributeHierarchies), attributeHierarchies]])
                .silentRun(0);

            expect(effects.put).toEqual([
                put(setAttributeHierarchies([])),
                put(setAttributeHierarchiesChanged(true)),
                put(attributeHierarchyModified(undefined)),
            ]);
        });
    });

    describe("handleUpdateCatalogAttributeHierarchy", () => {
        const attributeHierarchies: ICatalogAttributeHierarchy[] = [buildAttributeHierarchyMock()];

        it("should update the catalog items and display the update message", async () => {
            const updatedAttributeHierarchy = buildAttributeHierarchyMock({
                attributes: [
                    {
                        identifier: "country_id",
                        type: "attribute",
                    },
                ],
            });
            const action = updateCatalogAttributeHierarchy(updatedAttributeHierarchy);
            const { effects } = await expectSaga(handleUpdateCatalogAttributeHierarchy, action)
                .provide([[select(getAttributeHierarchies), attributeHierarchies]])
                .silentRun(0);

            expect(effects.put).toEqual([
                put(setAttributeHierarchies([updatedAttributeHierarchy])),
                put(setAttributeHierarchiesChanged(true)),
                put(attributeHierarchyModified(undefined)),
            ]);
        });
    });
});
