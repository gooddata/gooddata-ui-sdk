// (C) 2020-2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { throwError } from "redux-saga-test-plan/providers";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import {
    type AdRemoveFilterContextCommandData,
    type FilterItem,
    GdcAdCommandType,
    GdcProductName,
    type IRankingFilter as IRankingFilterEmbed,
    type IRemoveFilterContextContent,
    type IRemoveRankingFilterItem,
    type RemoveFilterItem,
} from "@gooddata/sdk-embedding";
import { idRef, uriRef } from "@gooddata/sdk-model";

import { ATTRIBUTE, MEASURES, STACK, VIEW } from "../../constants/bucket.js";
import { GRANULARITY } from "../../models/granularity.js";
import { buildInitialState } from "../../reducers/initial_state.js";
import {
    isElementUrisSupported,
    selectSupportsMultipleDateFilters,
    supportsTimeGranularities,
} from "../../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import {
    getAllMeasureBucketItems,
    getAllSlicingAttributeBucketItems,
    getAttributeBucketItems,
    getDateBucketItem,
} from "../../selectors/buckets_selector.js";
import { isReportOpening, isReportSaving } from "../../selectors/export_selector.js";
import {
    enableComputedAttributes,
    enableSecondGranularities,
} from "../../selectors/feature_flag_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { bucketsHaveCategoriesWithDateItem } from "../../services/buckets_service.js";
import {
    type ICommandUpdateFilterItemsActionPayload,
    type IUpdateArbitraryFilterActionPayload,
    type IUpdateAttributeFilterActionPayload,
    type IUpdateMatchFilterActionPayload,
} from "../../store/bucket_filters/bucket_filters_actions.js";
import {
    dateFilterExists,
    getFilterItems,
    getRankingFilter,
} from "../../store/filter_bar/filter_bar_selector.js";
import { setFilterBarState } from "../../store/filter_bar/filter_bar_service.js";
import { type IFilterBarState } from "../../store/filter_bar/filter_bar_state.js";
import {
    type IAttributeElement,
    type IAttributeFilter,
    type IFilter,
    type IRankingFilter,
} from "../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../store/types.js";
import { buildBucketItemMock } from "../../tests/bucket_item.test.helpers.js";
import { dateFilterBarItem, setupAppStateWithDateDatasetMeta } from "../../tests/constants.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type IRawBucketItem, type IRawBucketItems } from "../../typings/buckets.js";
import { type ICatalogEntries } from "../../typings/state_objects.js";
import { getAttributeDisplayForms, loadValidElementsData } from "../../utils/api.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type ISetFilterContextRequestedAction,
    type ITransformedAttributeFilterItem,
    removeFilterContextFailedAction,
    removeFilterContextFinishedAction,
    removeFilterContextRequested,
    removeFilterItemsFromState,
    setFilterContextFailedAction,
} from "../actions/control_filtering_actions.js";
import { CONTROL_FILTERING_ERRORS } from "../outgoing/control_filtering_events.js";

import {
    getValidExternalAttributeFilters,
    handleRemoveFilterContextRequested,
    handleSetFilterContextRequested,
    isOverLimitFilterBarItems,
    mappingDfsFromItemCached,
    validateExternalAttributeFilterValues,
    validateExternalAttributeFilters,
} from "./control_filtering_saga.js";

describe("control filtering saga", () => {
    const projectId = "projectId";
    const contextId = "contextId";
    const appState: IAppState = buildInitialState();
    const measures: IRawBucketItems = [];
    const attributes: IRawBucketItems = [];
    const buckets = [
        {
            localIdentifier: MEASURES,
            items: measures,
        },
        {
            localIdentifier: VIEW,
            items: attributes,
        },
        {
            localIdentifier: STACK,
            items: attributes,
        },
    ];
    const positiveAttributeFilter: FilterItem = {
        positiveAttributeFilter: {
            displayForm: {
                identifier: "label.activity",
            },
            in: ["/gdc/md/projectId/obj/1251/elements?id=1"],
        },
    };
    const dateFilter: FilterItem = {
        absoluteDateFilter: {
            dataSet: {
                identifier: "date.id",
            },
            from: "2017-02-08",
            to: "2017-12-31",
        },
    };

    const dfIdRef = idRef("attr1.id", "displayForm");
    const dfUriRef = uriRef("dfUri1");

    describe("handleSetFilterContextRequested", () => {
        const bucketItems: ReadonlyArray<IRawBucketItem> = [
            buildBucketItemMock({
                identifier: "attr.country.id",
                title: "Country",
                type: ATTRIBUTE,
                attribute: "attr.country.id",
                localIdentifier: "countryAttributeLocalId",
                dfUri: "/gdc/md/projectId/obj/1252/elements?id=1",
            }),
        ];

        function createExternalAttributeFilter(numberItem: number) {
            const externalAttributeFilters = [];
            for (let i = 1; i <= numberItem; i++) {
                const attributeFilter = {
                    positiveAttributeFilter: {
                        displayForm: {
                            identifier: `label.activity${i}`,
                        },
                        in: [`/gdc/md/projectId/obj/1251/elements?id=${i}`],
                    },
                };
                externalAttributeFilters.push(attributeFilter);
            }
            return externalAttributeFilters;
        }

        function createTransformedAttributeFilter(numberItem: number): ITransformedAttributeFilterItem[] {
            const transformedAttFilters: ITransformedAttributeFilterItem[] = [];
            for (let i = 1; i <= numberItem; i++) {
                transformedAttFilters.push({
                    negativeSelection: false,
                    attributeElements: [`/gdc/md/projectId/obj/1251/elements?id=${i}`],
                    dfIdentifier: `label.activity${i}`,
                    dfType: "displayForm",
                    dfUri: undefined,
                });
            }
            return transformedAttFilters;
        }

        function createValidAttributeFilter(numberItem: number): IUpdateAttributeFilterActionPayload[] {
            const validAttFilters = [];
            for (let i = 1; i <= numberItem; i++) {
                validAttFilters.push({
                    filterLocalIdentifier: `filterLocalIdentifier${i}`,
                    selectedElements: [
                        {
                            title: `title${i}`,
                            uri: `/gdc/md/projectId/obj/1251/elements?id=${i}`,
                        },
                    ],
                    isInverted: false,
                });
            }
            return validAttFilters;
        }

        const initState = withRoot(withData(appState, { itemCache: {} }), {
            data: {
                ...withData(appState, { itemCache: {} }).data,
                filterBar: {
                    // PARTIAL filter items: the saga only reads the keys named here, hence the cast
                    items: [
                        // attribute filter
                        {
                            cacheItemIdentifier: "attr.comp.KbYY5eU",
                            filterConfig: {
                                isInverted: true,
                                selectedElements: [] as IAttributeElement[],
                                totalElementsCount: 0,
                            },
                            localIdentifier: "a9c817176dd345729cd055e67c67a61b",
                            type: "attribute",
                        },
                        // date filter
                        {
                            cacheItemIdentifier: "attr.datedataset",
                            filterConfig: {
                                name: "all_time",
                            },
                            localIdentifier: "a9f86ecb258f4a27aca01f61b64b2f9b",
                            type: "date",
                        },
                        // measure value filter
                        {
                            localIdentifier: "543907bcee8e41259041e9ffe43b5317",
                            measureLocalIdentifier: "0a93b07156fd4b94819501cbcae5e223",
                            type: "measure",
                        },
                    ] as unknown as IFilter[],
                } as unknown as IFilterBarState,
            },
        });

        it("should dispatch setFilterContextFailedAction when report is saving or opening", async () => {
            const setFilterContextAction: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [positiveAttributeFilter, dateFilter],
                    postMessageContext: { contextId },
                },
            };

            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, setFilterContextAction)
                .provide([
                    [select(isReportSaving), true],
                    [select(isReportOpening), true],
                    [select(enableSecondGranularities), false],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(
                        CONTROL_FILTERING_ERRORS.invalidStateSetFilterContext,
                        contextId,
                    ),
                ),
            ]);
        });

        it("should dispatch setFilterContextFailedAction when external filters have invalid structure", async () => {
            // an arbitrary action object — the payload is deliberately NOT the command envelope
            const wrongFormatAction: UnknownAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            wrongFormatAttribute: {
                                displayForm: {
                                    uri: "/123",
                                },
                                in: ["/uri1"],
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };

            const saga: RunResult = await expectSaga(
                handleSetFilterContextRequested,
                wrongFormatAction as ISetFilterContextRequestedAction,
            )
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(CONTROL_FILTERING_ERRORS.invalidFilterDataFormat, contextId),
                ),
            ]);
        });

        it("should reject absolute date filters with seconds when second granularities are disabled", async () => {
            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            absoluteDateFilter: {
                                dataSet: { identifier: "date.id" },
                                from: "2020-01-01 00:00:00",
                                to: "2020-01-31 23:59:59",
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };

            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(supportsTimeGranularities), true],
                    [select(enableSecondGranularities), false],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(CONTROL_FILTERING_ERRORS.invalidFilterDataFormat, contextId),
                ),
            ]);
        });

        it("should return setFilterContextFailedAction when relative date has invalid granularity", async () => {
            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            relativeDateFilter: {
                                dataSet: { uri: "/dataset/uri1" },
                                granularity: "GDC.time.wrong",
                                from: 0,
                                to: 0,
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(
                        CONTROL_FILTERING_ERRORS.invalidDateFilterGranularity,
                        contextId,
                    ),
                ),
            ]);
        });

        it("should dispatch setFilterContextFailedAction when date has from > to", async () => {
            let action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            absoluteDateFilter: {
                                dataSet: {
                                    identifier: "date.id",
                                },
                                from: "2017-02-08",
                                to: "2017-02-07",
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            let saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                ])
                .run();
            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(
                        CONTROL_FILTERING_ERRORS.invalidDateFilterFromToValue,
                        contextId,
                    ),
                ),
            ]);

            action = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            relativeDateFilter: {
                                dataSet: {
                                    identifier: "date.id",
                                },
                                granularity: GRANULARITY.DATE,
                                from: -1,
                                to: -2,
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            saga = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                ])
                .run();
            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(
                        CONTROL_FILTERING_ERRORS.invalidDateFilterFromToValue,
                        contextId,
                    ),
                ),
            ]);
        });

        const stateWithoutDatasets = withData(
            withData(setupAppStateWithDateDatasetMeta(appState), {
                dateDatasets: {
                    ...setupAppStateWithDateDatasetMeta(appState).data.dateDatasets,
                    available: [],
                },
            }),
            { buckets: buckets },
        );

        it("should dispatch setFilterContextFailedAction if there is no dataset in project", async () => {
            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            absoluteDateFilter: {
                                dataSet: { identifier: "date.id.invalid" },
                                from: "2017-02-08",
                                to: "2017-02-09",
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                    [select(getDateBucketItem), true],
                    [select(dateFilterExists), false],
                    [select(), stateWithoutDatasets],
                    [call(bucketsHaveCategoriesWithDateItem, stateWithoutDatasets), false],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(setFilterContextFailedAction(CONTROL_FILTERING_ERRORS.noDateDatasetInProject, contextId)),
            ]);
        });

        it("should dispatch setFilterContextFailedAction when date datasets are not loaded yet and the filter bar already holds a date filter (multiple date filters supported)", async () => {
            // SetFilterContext can arrive right after the insight opened (embedded explore mode),
            // before the date datasets query settles. The date-dataset lookup must fall through to
            // the retriable noDateDatasetInProject failure instead of crashing on the empty lookup.
            const stateWithDateFilterOnBar = setFilterBarState(stateWithoutDatasets, {
                items: [dateFilterBarItem],
                parameterItems: [],
                isMultiline: false,
                migratedAdditionalFilters: [],
                filterBarDropdownOpen: false,
                attributeFilterConfigs: {},
            } as IFilterBarState);

            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            absoluteDateFilter: {
                                dataSet: { identifier: "date.id" },
                                from: "2017-02-08",
                                to: "2017-02-09",
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                    [select(selectSupportsMultipleDateFilters), true],
                    [select(), stateWithDateFilterOnBar],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(setFilterContextFailedAction(CONTROL_FILTERING_ERRORS.noDateDatasetInProject, contextId)),
            ]);
        });

        it("should dispatch setFilterContextFailedAction if there is invalid attribute identifier", async () => {
            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            positiveAttributeFilter: {
                                displayForm: {
                                    identifier: "att.identifier.wrong",
                                },
                                in: ["/gdc/md/projectId/obj/1251/elements?id=1"],
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                    [select(), initState],
                    [select(getItemCache), {}],
                    [select(getProjectId), projectId],
                    [
                        call(getAttributeDisplayForms, projectId, [idRef("att.identifier.wrong")]),
                        throwError(new Error("REFERENCED_OBJECT_NOT_FOUND")),
                    ],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(setFilterContextFailedAction(CONTROL_FILTERING_ERRORS.invalidAttFilterId, contextId)),
            ]);
        });

        it("should dispatch setFilterContextFailedAction when a computed attribute is referenced but the feature is off", async () => {
            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            positiveAttributeFilter: {
                                displayForm: { identifier: "ca.id", type: "computedAttribute" },
                                in: ["High"],
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                    [select(enableComputedAttributes), false],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(
                        CONTROL_FILTERING_ERRORS.computedAttributesDisabled,
                        contextId,
                    ),
                ),
            ]);
        });

        it("should dispatch setFilterContextFailedAction if there is invalid attribute uri", async () => {
            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: [
                        {
                            positiveAttributeFilter: {
                                displayForm: {
                                    uri: "wrong/dfUri",
                                },
                                in: ["/gdc/md/projectId/obj/1251/elements?id=1"],
                            },
                        },
                    ],
                    postMessageContext: { contextId },
                },
            };
            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                    [select(), initState],
                    [select(getItemCache), {}],
                    [select(getProjectId), projectId],
                    [call(getAttributeDisplayForms, projectId, [uriRef("wrong/dfUri")]), []],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(setFilterContextFailedAction(CONTROL_FILTERING_ERRORS.invalidAttFilterDfUri, contextId)),
            ]);
        });

        it("should dispatch setFilterContextFailedAction if there is invalid filter items count", async () => {
            const action: ISetFilterContextRequestedAction = {
                type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                payload: {
                    filters: createExternalAttributeFilter(21),
                    postMessageContext: { contextId },
                },
            };
            const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), false],
                    [select(isReportOpening), false],
                    [select(enableSecondGranularities), false],
                    [
                        call(validateExternalAttributeFilters, createTransformedAttributeFilter(21)),
                        createValidAttributeFilter(21),
                    ],
                    [select(), initState],
                    [select(getAttributeBucketItems), bucketItems],
                ])
                .run();

            expect(saga.effects.put).toEqual([
                put(
                    setFilterContextFailedAction(CONTROL_FILTERING_ERRORS.invalidFilterItemsCount, contextId),
                ),
            ]);
        });

        describe("ranking filter", () => {
            const rankingFilter: IRankingFilterEmbed = {
                rankingFilter: {
                    measure: { localIdentifier: "m1" },
                    attributes: [{ localIdentifier: "a1" }, { localIdentifier: "a2" }],
                    operator: "TOP",
                    value: 10,
                },
            };

            describe("given invalid", () => {
                it("should dispatch ERROR_INVALID_RANKING_FILTER_MEASURE if measure is not present in insight", () => {
                    const action: ISetFilterContextRequestedAction = {
                        type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                        payload: {
                            filters: [rankingFilter],
                            postMessageContext: { contextId },
                        },
                    };

                    return expectSaga(handleSetFilterContextRequested, action)
                        .provide([
                            [select(isReportSaving), false],
                            [select(isReportOpening), false],
                            [select(enableSecondGranularities), false],
                            [select(getAllMeasureBucketItems), []],
                            [select(getAllSlicingAttributeBucketItems), []],
                        ])
                        .put(
                            setFilterContextFailedAction(
                                CONTROL_FILTERING_ERRORS.invalidRankingFilterMeasure,
                                contextId,
                            ),
                        )
                        .run();
                });

                it("should dispatch ERROR_INVALID_RANKING_FILTER_ATTRIBUTES if some attributes are not valid", () => {
                    const action: ISetFilterContextRequestedAction = {
                        type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                        payload: {
                            filters: [rankingFilter],
                            postMessageContext: { contextId },
                        },
                    };

                    return expectSaga(handleSetFilterContextRequested, action)
                        .provide([
                            [select(isReportSaving), false],
                            [select(isReportOpening), false],
                            [select(enableSecondGranularities), false],
                            [select(getAllMeasureBucketItems), [{ localIdentifier: "m1" }]],
                            [select(getAllSlicingAttributeBucketItems), []],
                        ])
                        .put(
                            setFilterContextFailedAction(
                                CONTROL_FILTERING_ERRORS.invalidRankingFilterAttributes,
                                contextId,
                            ),
                        )
                        .run();
                });

                it("should dispatch ERROR_DUPLICATED_RANKING_FILTER_ATTRIBUTES if attributes are duplicates", () => {
                    const duplicateAttributesRankingFilter: IRankingFilterEmbed = {
                        rankingFilter: {
                            measure: { localIdentifier: "m1" },
                            attributes: [{ localIdentifier: "a1" }, { localIdentifier: "a1" }],
                            operator: "TOP",
                            value: 10,
                        },
                    };
                    const action: ISetFilterContextRequestedAction = {
                        type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                        payload: {
                            filters: [duplicateAttributesRankingFilter],
                            postMessageContext: { contextId },
                        },
                    };

                    return expectSaga(handleSetFilterContextRequested, action)
                        .provide([
                            [select(isReportSaving), false],
                            [select(isReportOpening), false],
                            [select(enableSecondGranularities), false],
                            [select(getAllMeasureBucketItems), [{ localIdentifier: "m1" }]],
                            [
                                select(getAllSlicingAttributeBucketItems),
                                [{ localIdentifier: "a1" }, { localIdentifier: "a2" }],
                            ],
                        ])
                        .put(
                            setFilterContextFailedAction(
                                CONTROL_FILTERING_ERRORS.duplicateRankingFilterAttributes,
                                contextId,
                            ),
                        )
                        .run();
                });
            });
        });

        describe("measure value filter", () => {
            const measureValueFilterItem: FilterItem = {
                measureValueFilter: {
                    measure: { identifier: "metric.revenue" },
                    conditions: [
                        {
                            comparison: {
                                operator: "GREATER_THAN",
                                value: 1000,
                            },
                        },
                    ],
                },
            };

            it("should dispatch commandAddOrUpdateFilterItems with measureValueFilters when MVF is in the setFilterContext payload", async () => {
                const action: ISetFilterContextRequestedAction = {
                    type: PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
                    payload: {
                        filters: [measureValueFilterItem],
                        postMessageContext: { contextId },
                    },
                };

                const saga: RunResult = await expectSaga(handleSetFilterContextRequested, action)
                    .provide([
                        [select(isReportSaving), false],
                        [select(isReportOpening), false],
                        [select(enableSecondGranularities), false],
                        [select(supportsTimeGranularities), false],
                        [select(selectSupportsMultipleDateFilters), false],
                        [select(getAttributeBucketItems), []],
                        [select(), initState],
                        [select(getFilterItems), []],
                    ])
                    .run();

                const dispatchedPutEffects = saga.effects.put ?? [];
                const filterContextPut = dispatchedPutEffects.find(
                    (effect) => effect?.payload?.action?.type === "STORE/ADD_OR_UPDATE_FILTER_ITEMS",
                );

                expect(filterContextPut).toBeDefined();
                expect(filterContextPut?.payload?.action?.payload?.measureValueFilters).toEqual([
                    {
                        measureIdentifier: "metric.revenue",
                        conditions: [
                            {
                                comparison: {
                                    operator: "GREATER_THAN",
                                    value: 1000,
                                },
                            },
                        ],
                    },
                ]);
            });
        });
    });

    describe("handleRemoveFilterContextRequested", () => {
        // `filters` is whatever the host posted — the invalid-format scenario depends on that
        function generateRemoveFilterCommandData(filters: unknown): AdRemoveFilterContextCommandData {
            return {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.RemoveFilterContext,
                        data: { filters } as IRemoveFilterContextContent,
                        contextId,
                    },
                },
            };
        }

        const attr1Item: IAttributeFilter = {
            localIdentifier: "attr1.localIdentifier",
            type: "attribute",
            cacheItemIdentifier: "attr1.id",
            displayFormRef: uriRef("attr/df/uri"),
            filterConfig: {
                selectedElements: [] as IAttributeElement[],
                totalElementsCount: 0,
                isInverted: true,
            },
        };
        const pristine = getInitializedState();
        const mockedState: IAppState = {
            ...pristine,
            projectId,
            data: {
                ...pristine.data,
                filterBar: { ...pristine.data.filterBar, items: [attr1Item] },
                dateDatasets: {
                    ...pristine.data.dateDatasets,
                    available: [
                        {
                            summary: "DataSet Date",
                            identifier: "date.created",
                            uri: "date/created/uri",
                            title: "Date (Created)",
                            ref: {
                                uri: "date/created/uri",
                            },
                            attributes: [],
                            id: "date.created",
                            isAvailable: true,
                            relevance: 0,
                            type: "dateDataset",
                        },
                    ],
                },
            },
            report: { ...pristine.report, saving: false, opening: false },
        };
        const removeDateFilterItem = {
            dataSet: {
                identifier: "date.created",
            },
        };

        const rankingFilter: IRankingFilter = {
            localIdentifier: "rankingFilterId",
            measureLocalIdentifier: "m1",
            operator: "TOP",
            type: "ranking",
            value: 10,
        };

        const removeAttrFilterItemWithUri = {
            displayForm: {
                uri: "dfUri1",
            },
        };
        const removedAttrFilterItemWithId = {
            displayForm: {
                identifier: "attr1.id",
            },
        };
        const removeRankingFilter: IRemoveRankingFilterItem = {
            removeRankingFilter: {},
        };
        const filters: RemoveFilterItem[] = [removeAttrFilterItemWithUri];
        const itemsCachedState = {
            "attr1.id": {
                identifier: "attr1.id",
                dfUri: "dfUri1",
                uri: "att1Uri",
                type: "attribute",
                summary: "",
                format: "#,##0.00",
                displayForms: [{ uri: "dfUri1", id: "attr1.id" }],
            },
        };

        it("should dispatch removeFilterContextFailedAction if try to remove when saving or loading the insight", async () => {
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .provide([
                    [select(isReportSaving), true],
                    [select(isReportOpening), true],
                    [select(enableSecondGranularities), false],
                ])
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.invalidStateRemoveFilterContext;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if there are no filter to remove", async () => {
            const action = removeFilterContextRequested(generateRemoveFilterCommandData([]));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(
                    withData(mockedState, {
                        filterBar: { ...mockedState.data.filterBar, items: [] },
                    }),
                )
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.invalidRemoveFilterItemsCount;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if there is invalid filter data format", async () => {
            const action = removeFilterContextRequested(
                generateRemoveFilterCommandData([{ displayFormInvalid: { uri: "dfUri1" } }]),
            );
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(mockedState)
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.invalidFilterDataFormat;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if try to remove more than one date filter", async () => {
            const filters = [removeDateFilterItem, removeDateFilterItem];
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(mockedState)
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.invalidDateFilterCountError;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if there is no date dataset in project", async () => {
            const filters = [removeDateFilterItem];
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const updatedMockedState = withData(withData(mockedState, { buckets: buckets }), {
                dateDatasets: {
                    ...mockedState.data.dateDatasets,
                    available: [],
                },
            });
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(updatedMockedState)
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.noDateDatasetInProject;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if try to remove nonexistent date filter id", async () => {
            const filters = [
                {
                    dataSet: {
                        identifier: "date.created.invalid",
                    },
                },
            ];
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const updatedMockedState = withData(
                withData(mockedState, {
                    filterBar: {
                        ...mockedState.data.filterBar,
                        items: [dateFilterBarItem],
                    },
                }),
                { buckets: buckets },
            );
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(updatedMockedState)
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.removeNonExistentFilterError;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if try to remove nonexistent date filter uri", async () => {
            const filters = [{ dataSet: { uri: "date/created/uri/invalid" } }];
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const updatedMockedState = withData(
                withData(mockedState, {
                    filterBar: {
                        ...mockedState.data.filterBar,
                        items: [dateFilterBarItem],
                    },
                }),
                { buckets: buckets },
            );
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(updatedMockedState)
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.removeNonExistentFilterError;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if there is duplicated attribute filter uri", async () => {
            const filters = [removeAttrFilterItemWithUri, removeAttrFilterItemWithUri];
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(mockedState)
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.duplicatedAttributeUris;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if there is duplicated attribute filter identifiers", async () => {
            const filters = [removedAttrFilterItemWithId, removedAttrFilterItemWithId];
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(mockedState)
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.duplicatedAttributeIdentifiers;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if duplicate attribute filters", async () => {
            const filters = [removeAttrFilterItemWithUri, removedAttrFilterItemWithId];
            const updatedMockedState = withData(mockedState, {
                itemCache: itemsCachedState as unknown as ICatalogEntries,
            });
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(updatedMockedState)
                .provide([
                    [
                        call(getAttributeDisplayForms, projectId, [dfIdRef, dfUriRef]),
                        [
                            {
                                type: "displayForm",
                                ref: uriRef("dfUri1"),
                                attribute: uriRef("attUri1"),
                                title: "",
                                description: "",
                                id: "attr1.id",
                                uri: "dfUri1",
                                default: 0,
                            },
                        ],
                    ],
                ])
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.invalidAttFilterDfUri;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if there is invalid attribute filters", async () => {
            const filters = [removedAttrFilterItemWithId];
            const updatedMockedState = withData(mockedState, {
                itemCache: itemsCachedState as unknown as ICatalogEntries,
            });
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(updatedMockedState)
                .provide([[call(getAttributeDisplayForms, projectId, [dfIdRef]), []]])
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.invalidAttFilterDfUri;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should dispatch removeFilterContextFailedAction if try to remove nonexistent attribute filters identifiers", async () => {
            const filters = [removedAttrFilterItemWithId];
            const updatedMockedState = withData(
                withData(mockedState, {
                    itemCache: itemsCachedState as unknown as ICatalogEntries,
                }),
                {
                    filterBar: {
                        items: [
                            {
                                localIdentifier: "attr2.localIdentifier",
                                type: "attribute",
                                cacheItemIdentifier: "attr2.id",
                                filterConfig: {
                                    selectedElements: [] as IAttributeElement[],
                                    totalElementsCount: 0,
                                    isInverted: true,
                                },
                            } as unknown as IFilter,
                        ],
                    } as unknown as IFilterBarState,
                },
            );
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            const saga: RunResult = await expectSaga(handleRemoveFilterContextRequested, action)
                .withState(updatedMockedState)
                .provide([
                    [
                        call(getAttributeDisplayForms, projectId, [dfIdRef]),
                        [
                            {
                                type: "displayForm",
                                ref: uriRef("dfUri1"),
                                attribute: uriRef("attUri1"),
                                title: "",
                                description: "",
                                id: "attr1.id",
                                uri: "dfUri1",
                                default: 1,
                            },
                        ],
                    ],
                    [select(isElementUrisSupported), false],
                ])
                .run();

            const errorBody = CONTROL_FILTERING_ERRORS.removeNonExistentFilterError;
            expect(saga.effects.put).toEqual([put(removeFilterContextFailedAction(errorBody, contextId))]);
        });

        it("should remove filters", () => {
            const filters = [removedAttrFilterItemWithId, removeRankingFilter];
            const updatedMockedState = withData(mockedState, {
                itemCache: itemsCachedState as unknown as ICatalogEntries,
            });
            const action = removeFilterContextRequested(generateRemoveFilterCommandData(filters));
            return expectSaga(handleRemoveFilterContextRequested, action)
                .withState(updatedMockedState)
                .provide([
                    [
                        call(getAttributeDisplayForms, projectId, [dfIdRef]),
                        [
                            {
                                type: "displayForm",
                                ref: uriRef("dfUri1"),
                                attribute: uriRef("att1Uri"),
                                title: "",
                                description: "",
                                id: "attr1.id",
                                uri: "dfUri1",
                            },
                        ],
                    ],
                    [select(isElementUrisSupported), false],
                    [select(getRankingFilter), rankingFilter],
                ])
                .put(
                    removeFilterItemsFromState(
                        ["attr1.localIdentifier", rankingFilter.localIdentifier],
                        false,
                    ),
                )
                .put(removeFilterContextFinishedAction(contextId, 1, false, true))
                .run();
        });
    });

    describe("validate external filters", () => {
        const defaultDfUri = "/dfUri1";
        const nonDefaultDfUri = "/dfUri2";

        const initialState: IAppState = buildInitialState();
        const itemCache = {
            item1: {
                identifier: "item1",
                dfUri: defaultDfUri,
                dfIdentifier: "df1",
                displayForms: [{ uri: defaultDfUri }, { uri: nonDefaultDfUri }],
            },
        };

        const elementsForFilter = ["/gdc/md/projectId/obj/1251/elements?id=1"];
        const externalFilter: ITransformedAttributeFilterItem = {
            cacheItemIdentifier: "item1",
            negativeSelection: true,
            attributeElements: elementsForFilter,
            dfUri: nonDefaultDfUri,
        };

        const validExternalFilter: ITransformedAttributeFilterItem = {
            cacheItemIdentifier: "item1",
            localIdentifier: undefined,
            negativeSelection: true,
            attributeElements: elementsForFilter,
            dfUri: nonDefaultDfUri,
            dfIdentifier: "df1",
        };

        const idExtFilter: ITransformedAttributeFilterItem = {
            cacheItemIdentifier: "item1",
            negativeSelection: false,
            attributeElements: ["a", "b"],
            dfIdentifier: "missing",
        };

        const idValidExtFilter: ITransformedAttributeFilterItem = {
            cacheItemIdentifier: "item1",
            negativeSelection: false,
            attributeElements: ["a", "b"],
            dfIdentifier: "df1",
        };

        const idItemCache = {
            item1: {
                identifier: "item1",
                dfIdentifier: "df1",
                displayForms: [{ id: "df1" }, { id: "df2" }],
            },
        };

        describe("mappingDfsFromItemCached", () => {
            describe("when identifiers are used", () => {
                it("should add item to externalObjRefs when not exists in cache", () => {
                    const result = mappingDfsFromItemCached(
                        initialState,
                        [idExtFilter],
                        idItemCache as unknown as ICatalogEntries,
                    );

                    expect(result).toEqual({
                        externalObjRefs: [{ identifier: "missing" }],
                        externalFiltersFromCached: [],
                    });
                });

                it("should add item to externalFiltersFromCached when not exists in cache", () => {
                    const result = mappingDfsFromItemCached(
                        initialState,
                        [idValidExtFilter],
                        idItemCache as unknown as ICatalogEntries,
                    );

                    expect(result).toEqual({
                        externalObjRefs: [],
                        externalFiltersFromCached: [idValidExtFilter],
                    });
                });
            });

            describe("when a computed attribute is referenced", () => {
                const computedAttributeItemCache = {
                    "attribute.shared": {
                        identifier: "shared",
                        type: "attribute",
                        dfIdentifier: "shared",
                        displayForms: [{ id: "shared" }],
                    },
                    "computedAttribute.shared": {
                        identifier: "shared",
                        type: "computedAttribute",
                        dfIdentifier: "shared",
                        displayForms: [{ id: "shared" }],
                    },
                } as unknown as ICatalogEntries;

                const computedAttributeExtFilter: ITransformedAttributeFilterItem = {
                    negativeSelection: false,
                    attributeElements: ["a"],
                    dfIdentifier: "shared",
                    dfType: "computedAttribute",
                };

                it("should resolve the computed attribute and not the label sharing its identifier", () => {
                    const result = mappingDfsFromItemCached(
                        initialState,
                        [computedAttributeExtFilter],
                        computedAttributeItemCache,
                    );

                    expect(result).toEqual({
                        externalObjRefs: [],
                        externalFiltersFromCached: [
                            {
                                ...computedAttributeExtFilter,
                                dfUri: undefined,
                                cacheItemIdentifier: "shared",
                                localIdentifier: undefined,
                            },
                        ],
                    });
                });

                it("should keep the computed attribute type on the ref of an uncached item", () => {
                    const result = mappingDfsFromItemCached(
                        initialState,
                        [
                            {
                                ...computedAttributeExtFilter,
                                dfIdentifier: "missing",
                            },
                        ],
                        computedAttributeItemCache,
                    );

                    expect(result).toEqual({
                        externalObjRefs: [idRef("missing", "computedAttribute")],
                        externalFiltersFromCached: [],
                    });
                });
            });

            it("should return obj with no external refs and one valid attribute filter with passed non-default DF uri and display form is non-default", () => {
                const result = mappingDfsFromItemCached(
                    initialState,
                    [externalFilter],
                    itemCache as unknown as ICatalogEntries,
                );

                expect(result).toEqual({
                    externalObjRefs: [],
                    externalFiltersFromCached: [validExternalFilter],
                });
            });
        });

        describe("getValidExternalAttributeFilters", () => {
            it("should return valid attribute filter with passed non-default DF uri", async () => {
                return expectSaga(getValidExternalAttributeFilters, [externalFilter])
                    .provide([
                        [select(), initialState],
                        [select(getItemCache), itemCache],
                        [select(getProjectId), projectId],
                    ])
                    .returns([validExternalFilter])
                    .silentRun();
            });
        });

        describe("isOverLimitFilterBarItems", () => {
            function createFilterBarItems(count: number): IAttributeFilter[] {
                return Array.from({ length: count }, (_, i) => ({
                    cacheItemIdentifier: `attr.${i}`,
                    displayFormRef: idRef(`attr.${i}`, "displayForm"),
                    filterConfig: {
                        isInverted: false,
                        selectedElements: [] as IAttributeElement[],
                        totalElementsCount: 0,
                    },
                    localIdentifier: `filter-${i}`,
                    type: "attribute" as const,
                }));
            }

            function createStateWithFilterCount(count: number): IAppState {
                const filterBarState: IFilterBarState = {
                    items: createFilterBarItems(count),
                    isMultiline: false,
                    migratedAdditionalFilters: [] as string[],
                    parameterItems: [],
                    filterBarDropdownOpen: false,
                    attributeFilterConfigs: {},
                };
                return setFilterBarState(getInitializedState(), filterBarState);
            }

            it("should return true when arbitrary filters would exceed the 20-filter limit", () => {
                const stateWith18Filters = createStateWithFilterCount(18);
                const validFilterItems: ICommandUpdateFilterItemsActionPayload = {
                    attributeFilters: [] as IUpdateAttributeFilterActionPayload[],
                    arbitraryFilters: [
                        {
                            values: ["a"],
                            negativeSelection: false,
                            dfIdentifier: "df1",
                        },
                        {
                            values: ["b"],
                            negativeSelection: false,
                            dfIdentifier: "df2",
                        },
                        {
                            values: ["c"],
                            negativeSelection: false,
                            dfIdentifier: "df3",
                        },
                    ] as IUpdateArbitraryFilterActionPayload[],
                    matchFilters: [] as IUpdateMatchFilterActionPayload[],
                };
                const result = isOverLimitFilterBarItems(stateWith18Filters, [], validFilterItems, false);
                expect(result).toBe(true);
            });

            it("should return true when match filters would exceed the 20-filter limit", () => {
                const stateWith18Filters = createStateWithFilterCount(18);
                const validFilterItems: ICommandUpdateFilterItemsActionPayload = {
                    attributeFilters: [] as IUpdateAttributeFilterActionPayload[],
                    arbitraryFilters: [] as IUpdateArbitraryFilterActionPayload[],
                    matchFilters: [
                        {
                            operator: "contains" as const,
                            literal: "x",
                            negativeSelection: false,
                            dfIdentifier: "df1",
                        },
                        {
                            operator: "contains" as const,
                            literal: "y",
                            negativeSelection: false,
                            dfIdentifier: "df2",
                        },
                        {
                            operator: "contains" as const,
                            literal: "z",
                            negativeSelection: false,
                            dfIdentifier: "df3",
                        },
                    ] as IUpdateMatchFilterActionPayload[],
                };
                const result = isOverLimitFilterBarItems(stateWith18Filters, [], validFilterItems, false);
                expect(result).toBe(true);
            });

            it("should not count arbitrary/match filters with filterLocalIdentifier as new filters", () => {
                const stateWith18Filters = createStateWithFilterCount(18);
                const validFilterItems: ICommandUpdateFilterItemsActionPayload = {
                    attributeFilters: [] as IUpdateAttributeFilterActionPayload[],
                    arbitraryFilters: [
                        {
                            filterLocalIdentifier: "filter-0",
                            values: ["updated"],
                            negativeSelection: false,
                            dfIdentifier: "df1",
                        },
                    ],
                    matchFilters: [
                        {
                            filterLocalIdentifier: "filter-1",
                            operator: "contains" as const,
                            literal: "updated",
                            negativeSelection: false,
                            dfIdentifier: "df2",
                        },
                    ] as IUpdateMatchFilterActionPayload[],
                };
                const result = isOverLimitFilterBarItems(stateWith18Filters, [], validFilterItems, false);
                expect(result).toBe(false);
            });
        });

        describe("validateExternalAttributeFilterValues", () => {
            it("should correctly prepare validated filter values based on given elements", () => {
                const expectedElements = [
                    { title: "a", uri: "a" },
                    { title: "b", uri: "b" },
                ];
                return expectSaga(validateExternalAttributeFilterValues, idValidExtFilter)
                    .provide([
                        [select(getProjectId), projectId],
                        [select(isElementUrisSupported), false],
                    ])
                    .returns({
                        dfUri: undefined,
                        dfIdentifier: idValidExtFilter.dfIdentifier,
                        cacheItemIdentifier: idValidExtFilter.cacheItemIdentifier,
                        selectedElements: expectedElements,
                        filterLocalIdentifier: undefined,
                        isInverted: false,
                        totalElementsCount: expectedElements.length,
                    })
                    .silentRun();
            });

            it("should prepare valid elements and not touch uris when isElementUrisSupported=true", () => {
                const filterDfRef = { uri: validExternalFilter.dfUri };
                const elements = [
                    {
                        title: "a",
                        uri: "/gdc/a",
                    },
                ];
                return expectSaga(validateExternalAttributeFilterValues, validExternalFilter)
                    .provide([
                        [select(getProjectId), projectId],
                        [select(isElementUrisSupported), true],
                        [
                            call(loadValidElementsData, projectId, filterDfRef, elementsForFilter),
                            {
                                items: elements,
                                totalCount: 1,
                            },
                        ],
                    ])
                    .returns({
                        dfUri: validExternalFilter.dfUri,
                        dfIdentifier: validExternalFilter.dfIdentifier,
                        cacheItemIdentifier: validExternalFilter.cacheItemIdentifier,
                        selectedElements: elements,
                        filterLocalIdentifier: undefined,
                        isInverted: true,
                        totalElementsCount: 1,
                    })
                    .silentRun();
            });
        });
    });
});
