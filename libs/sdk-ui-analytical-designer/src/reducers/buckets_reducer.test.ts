// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITotal, idRef, uriRef } from "@gooddata/sdk-model";

import {
    selectVisualizationType,
    setBucketItemAggregation,
    setBucketItemDateDataset,
    setBucketItemFormat,
    setBucketItemGranularity,
    setBucketItemTitle,
    setRenamingBucketItemEnded,
    setRenamingBucketItemStarted,
    storeBucketItemDisplayForm,
    storeSetBucketItemShowInPercent,
    toggleBucketItemExpanded,
} from "../actions/buckets_actions.js";
import { removeBucketItem, reorderBucketItem } from "../actions/dnd_actions.js";
import { ATTRIBUTE, DATE, MEASURES, METRIC, VIEW } from "../constants/bucket.js";
import { DEFAULT_DECIMAL_FORMAT, DEFAULT_PERCENTAGE_FORMAT } from "../constants/formats.js";
import { LOCAL_BAR } from "../constants/visualization_types.js";
import { INITIAL_MODEL, buildBucketItem } from "../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { getPrimaryDateDataset } from "../services/buckets_service.js";
import { setCatalogItems } from "../store/catalog/catalog_store_actions.js";
import { defaultFilterBarState } from "../store/filter_bar/filter_bar_state.js";
import { type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IReferencePointState } from "../store/reference_point/reference_point_state.js";
import { type IAppState } from "../store/types.js";
import { withBucketItems } from "../tests/buckets_builder.test.helpers.js";
import { tableVisualizationClass } from "../tests/constants.test.helpers.js";
import { dispatchBucketsTrigger } from "../tests/dispatch_buckets_trigger.test.utils.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withAppState, withData } from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import { type IRawBucketItem, type IRawBucketItems } from "../typings/buckets.js";
import { type IDateDataset } from "../typings/datasets.js";

import { rootReducer } from "./root_reducer.js";

describe("Buckets Reducer tests", () => {
    function setVisualizationClass(state: IAppState, url: string) {
        return withData(state, {
            visualizationClass: visualizationClassMock(url),
        });
    }

    function setSomeBuckets(state: IAppState) {
        return withData(state, {
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ],
        });
    }

    const MEASURES_INDEX = 0;
    const VIEW_INDEX = 1;
    const ATTRIBUTE_INDEX = 2;

    describe("BUCKETS_SELECT_VISUALIZATION_TYPE", () => {
        function getInitialState() {
            const withBuckets = withData(getInitializedState(), { buckets: INITIAL_MODEL });
            return setVisualizationClass(withBuckets, LOCAL_BAR);
        }

        const visualizationClass = tableVisualizationClass;

        it("should not modify reference point when changing visualization class", () => {
            const newReferencePoint: IReferencePointState = {
                buckets: [{ localIdentifier: MEASURES, items: [] }],
            };
            const state = withData(getInitialState(), { referencePoint: newReferencePoint });
            const action = selectVisualizationType(visualizationClass);

            const newState = dispatchBucketsTrigger(state, action);

            // IDENTITY, not equality: `visualizationTypeSelected` names three domains and the
            // reference point is not one of them, so its slice has no case for the event and answers the
            // SAME object. A `toEqual` here would also pass on a rebuilt-but-equal value.
            expect(newState.data.referencePoint).toBe(newReferencePoint);
        });

        it("should set the specified visualization class", () => {
            const initState = getInitialState();
            const action = selectVisualizationType(visualizationClass);

            const newState = dispatchBucketsTrigger(initState, action);

            expect(newState.data.visualizationClass).toEqual(visualizationClass);
        });

        it("should reset extended reference point", () => {
            const initState = getInitialState();
            const action = selectVisualizationType(visualizationClass);

            const state = dispatchBucketsTrigger(initState, action);

            const extendedReferencePoint = state.data.extendedReferencePoint;
            expect(extendedReferencePoint).toBeNull();
        });
    });

    describe("bucket item actions", () => {
        function getInitialState() {
            const metrics: IRawBucketItems = [
                {
                    attribute: "m1",
                    localIdentifier: "m1",
                    filters: [],
                    aggregation: "sum",
                    type: METRIC,
                },
                {
                    attribute: "m2",
                    localIdentifier: "m2",
                    filters: [],
                    showInPercent: true,
                    type: METRIC,
                },
            ];

            const dates: IRawBucketItems = [
                {
                    attribute: "attr.datedataset",
                    localIdentifier: "d1",
                    dateDatasetRef: {
                        uri: "test",
                    },
                    filters: [],
                    type: DATE,
                },
            ];

            const attributes: IRawBucketItems = [
                {
                    attribute: "attribute1",
                    localIdentifier: "a1",
                    filters: [],
                    type: ATTRIBUTE,
                },
            ];

            const base = setSomeBuckets(setVisualizationClass(getInitializedState(), LOCAL_BAR));

            // seeded IN THIS ORDER: measures, then the view date, then the attribute — the order is
            // observable, because a bucket the seed does not have yet is materialized on the way
            let buckets = withBucketItems(base.data.buckets, MEASURES_INDEX, metrics);
            buckets = withBucketItems(buckets, VIEW_INDEX, dates);
            buckets = withBucketItems(buckets, ATTRIBUTE_INDEX, attributes);

            return withData(base, { buckets });
        }

        function getItem(state: IAppState, bucketIndex: number, itemIndex: number) {
            return state.data.buckets[bucketIndex].items[itemIndex];
        }

        // STORE_CONFIGURATION_PANEL_COLLAPSED moved to
        // store/configuration_panel/test/configuration_panel_store.test.ts.

        describe("BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED test", () => {
            it.each([
                ["measure", MEASURES_INDEX, "measureExpanded" as const, "m1"],
                ["attribute", ATTRIBUTE_INDEX, "attributeExpanded" as const, "a1"],
                ["date", VIEW_INDEX, "attributeExpanded" as const, "d1"],
            ])(
                "should set collapsed state of %s bucket item",
                (
                    _type: string,
                    bucketIndex: number,
                    marker: "measureExpanded" | "attributeExpanded",
                    localIdentifier: string,
                ) => {
                    const initState = getInitialState();
                    const item = getItem(initState, bucketIndex, 0);
                    const toggleExpandedAction = toggleBucketItemExpanded(item);

                    const expandedState = dispatchBucketsTrigger(initState, toggleExpandedAction);

                    expect(expandedState.data.bucketsMeta[marker]).toBe(localIdentifier);

                    // yet another collapse on the same item
                    const nonCollapsedState = dispatchBucketsTrigger(expandedState, toggleExpandedAction);

                    expect(nonCollapsedState.data.bucketsMeta[marker]).toBeUndefined();
                },
            );

            it("should set other measure item as collapsed if bucket is NOT being renamed", () => {
                const initState = getInitialState();
                const initItem = getItem(initState, MEASURES_INDEX, 0);
                const toggleItemAction = toggleBucketItemExpanded(initItem);

                const expandedState = dispatchBucketsTrigger(initState, toggleItemAction);

                // collapse on different item
                const switchToItem = getItem(initState, MEASURES_INDEX, 1);
                const toggleOtherItemAction = toggleBucketItemExpanded(switchToItem);

                const otherCollapsedState = dispatchBucketsTrigger(expandedState, toggleOtherItemAction);

                expect(otherCollapsedState.data.bucketsMeta.measureExpanded).toEqual("m2");
            });
        });

        describe("BUCKETS_SET_BUCKET_ITEM_AGGREGATION test", () => {
            it("should set aggregation of bucket item", () => {
                const initState = getInitialState();
                const action = setBucketItemAggregation(getItem(initState, MEASURES_INDEX, 0), "abc");

                const state = dispatchBucketsTrigger(initState, action);

                expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
                expect(state.data.buckets[MEASURES_INDEX].items[0].aggregation).toEqual("abc");
            });

            it("should set aggregation also for derived measure item in the same bucket", () => {
                const initState = getInitialState();
                const firstMeasureItem = initState.data.buckets[MEASURES_INDEX].items[0];
                const derivedMeasureItem = {
                    ...firstMeasureItem,
                    masterLocalIdentifier: firstMeasureItem.localIdentifier,
                    localIdentifier: "m1_pop",
                };

                const state = withData(initState, {
                    buckets: withBucketItems(initState.data.buckets, MEASURES_INDEX, [
                        firstMeasureItem,
                        derivedMeasureItem,
                    ]),
                });
                const action = setBucketItemAggregation(firstMeasureItem, "abc");

                const newState = dispatchBucketsTrigger(state, action);

                expect(newState.data.referencePoint.buckets).toEqual(newState.data.buckets);
                expect(newState.data.buckets[MEASURES_INDEX].items[0].aggregation).toEqual("abc");
                expect(newState.data.buckets[MEASURES_INDEX].items[1].aggregation).toEqual("abc");
            });

            it("should set aggregation for derived measure item in different bucket than master measure", () => {
                const initState = getInitialState();
                const firstMeasureItem = initState.data.buckets[0].items[0];
                const derivedMeasureItem = {
                    ...firstMeasureItem,
                    masterLocalIdentifier: firstMeasureItem.localIdentifier,
                    localIdentifier: "m1_pop",
                };

                const state = withData(initState, {
                    buckets: withBucketItems(initState.data.buckets, 1, [derivedMeasureItem]),
                });
                const action = setBucketItemAggregation(firstMeasureItem, "abc");

                const newState = dispatchBucketsTrigger(state, action);

                expect(newState.data.referencePoint.buckets).toEqual(newState.data.buckets);
                expect(newState.data.buckets[0].items[0].aggregation).toEqual("abc");
                expect(newState.data.buckets[1].items[0].aggregation).toEqual("abc");
            });
        });

        describe("STORE_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT test", () => {
            it("should set showInPercent of bucket item", () => {
                const category = { attribute: "attribute" };
                const item = getItem(getInitialState(), MEASURES_INDEX, 0);
                const initState = withData(
                    withData(getInitialState(), {
                        buckets: withBucketItems(getInitialState().data.buckets, VIEW_INDEX, [category]),
                    }),
                    {
                        buckets: withBucketItems(
                            withData(getInitialState(), {
                                buckets: withBucketItems(getInitialState().data.buckets, VIEW_INDEX, [
                                    category,
                                ]),
                            }).data.buckets,
                            MEASURES_INDEX,
                            [item],
                        ),
                    },
                );
                const action = storeSetBucketItemShowInPercent("m1", true);

                const state = dispatchBucketsTrigger(initState, action);

                expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
                expect(state.data.buckets[MEASURES_INDEX].items[0].showInPercent).toEqual(true);
            });

            it("should set showInPercent to derived measures", () => {
                const category = { attribute: "attribute" };
                const item = getItem(getInitialState(), MEASURES_INDEX, 0);
                const derivedItem = { ...item, masterLocalIdentifier: item.localIdentifier };
                const initState = withData(
                    withData(getInitialState(), {
                        buckets: withBucketItems(getInitialState().data.buckets, VIEW_INDEX, [category]),
                    }),
                    {
                        buckets: withBucketItems(
                            withData(getInitialState(), {
                                buckets: withBucketItems(getInitialState().data.buckets, VIEW_INDEX, [
                                    category,
                                ]),
                            }).data.buckets,
                            MEASURES_INDEX,
                            [item, derivedItem],
                        ),
                    },
                );
                const action = storeSetBucketItemShowInPercent("m1", true);

                const state = dispatchBucketsTrigger(initState, action);

                expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
                expect(state.data.buckets[MEASURES_INDEX].items[0].showInPercent).toEqual(true);
                expect(state.data.buckets[MEASURES_INDEX].items[1].showInPercent).toEqual(true);
            });

            describe("changing format when toggling Show in %", () => {
                // more cases tested by testing sanitizeMeasureFormat
                it.each`
                    previousFormat | showInPercent | expectedFormat
                    ${null}        | ${true}       | ${DEFAULT_PERCENTAGE_FORMAT}
                    ${null}        | ${false}      | ${DEFAULT_DECIMAL_FORMAT}
                    ${"whatever"}  | ${true}       | ${"whatever"}
                    ${"whatever"}  | ${false}      | ${"whatever"}
                `(
                    "should set format to $expectedFormat for $measureType when Show in % switched to $showInPercent and custom formatting is $customFormatting",
                    ({ previousFormat, showInPercent, expectedFormat }) => {
                        const item = buildBucketItem({
                            attribute: "identifier1",
                            format: previousFormat,
                            showInPercent: !showInPercent,
                        });
                        let initState = withData(getInitializedState(), {
                            buckets: withBucketItems(getInitializedState().data.buckets, MEASURES_INDEX, [
                                item,
                            ]),
                        });

                        const setShowInPercentAction = storeSetBucketItemShowInPercent(
                            item.localIdentifier,
                            showInPercent,
                        );
                        const setCatalogItemsAction = setCatalogItems([
                            {
                                fact: {
                                    title: "title",
                                    id: "identifier1",
                                    uri: "uri/1",
                                    ref: idRef("identifier1"),
                                    deprecated: false,
                                    description: "",
                                    production: true,
                                    unlisted: false,
                                    type: "fact",
                                },
                                groups: [],
                                type: "fact",
                            },
                        ]);
                        initState = rootReducer(initState, setCatalogItemsAction);

                        const state = dispatchBucketsTrigger(initState, setShowInPercentAction);

                        expect(state.data.buckets[MEASURES_INDEX].items[0].format).toBe(expectedFormat);
                    },
                );
            });
        });

        describe("BUCKETS_SET_BUCKET_ITEM_DATE_DATASET", () => {
            const bucketItem: IRawBucketItem = {
                dateDataset: { uri: "test" },
                granularity: null,
                alias: null,
                masterLocalIdentifier: null,
                ref: null,
                localIdentifier: "e1fb7636ae644b8299caf624cc162aac",
                type: "date",
                filters: [],
                attribute: "attr.datedataset",
            } as unknown as IRawBucketItem;
            it("should set selected date dataset", () => {
                const dateDataset = {
                    identifier: "abc",
                    title: "Date (Abc)",
                    uri: "test",
                    ref: { uri: "test" },
                    attributes: [] as const,
                };

                const initState = withData(getInitialState(), {
                    dateDatasets: {
                        ...getInitialState().data.dateDatasets,
                        available: [dateDataset] as unknown as IDateDataset[],
                    },
                });

                const action = setBucketItemDateDataset({ uri: "test" }, bucketItem.localIdentifier);
                const state = dispatchBucketsTrigger(initState, action);

                const result = getPrimaryDateDataset(state);

                expect(result).toEqual(dateDataset);
            });
        });

        describe("STORE_BUCKETS_SET_BUCKET_ITEM_GRANULARITY test", () => {
            it("should set granularity of bucket item", () => {
                const date = { attribute: DATE_DATASET_ATTRIBUTE, localIdentifier: "abc" };
                const initState = withData(getInitialState(), {
                    buckets: withBucketItems(getInitialState().data.buckets, VIEW_INDEX, [date]),
                });
                const action = setBucketItemGranularity("abc", "GDC.time.year");

                const state = dispatchBucketsTrigger(initState, action);

                expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
                expect(state.data.buckets[VIEW_INDEX].items[0].granularity).toEqual("GDC.time.year");
            });
        });

        describe("BUCKETS_SET_BUCKET_ITEM_TITLE test", () => {
            it("should set alias into bucket (if not empty string) and mark bucket item as NOT being renamed anymore", () => {
                const localIdentifier = "m1";
                const title = "My Alias";
                const bucketItem = { localIdentifier };
                const initState = withData(getInitialState(), {
                    buckets: withBucketItems(getInitialState().data.buckets, MEASURES_INDEX, [bucketItem]),
                });
                const action = setBucketItemTitle(localIdentifier, title);

                const state = dispatchBucketsTrigger(initState, action);

                expect(state.data.buckets[MEASURES_INDEX].items[0].alias).toEqual(title);
                expect(state.appState.renamingBucketItem).toBe(false);
            });

            it("should delete alias from bucket (when empty string) and mark bucket item as NOT being renamed any more", () => {
                const localIdentifier = "m1";
                const bucketItem = { localIdentifier };
                const title = "";
                const initState = withData(getInitialState(), {
                    buckets: withBucketItems(getInitialState().data.buckets, MEASURES_INDEX, [bucketItem]),
                });
                const action = setBucketItemTitle(localIdentifier, title);

                const state = dispatchBucketsTrigger(initState, action);

                expect(state.data.buckets[MEASURES_INDEX].items[0].alias).toBeUndefined();
                expect(state.appState.renamingBucketItem).toBe(false);
            });
        });

        describe("BUCKETS_SET_RENAMING_BUCKET_ITEM_STARTED test", () => {
            it("should set bucket item as being renamed", () => {
                const action = setRenamingBucketItemStarted();

                const state = dispatchBucketsTrigger(getInitialState(), action);

                expect(state.appState.renamingBucketItem).toBe(true);
            });
        });

        describe("BUCKETS_SET_RENAMING_BUCKET_ITEM_ENDED test", () => {
            it("should set bucket item as NOT being renamed", () => {
                const state = withAppState(getInitialState(), { renamingBucketItem: true });
                const action = setRenamingBucketItemEnded();

                const updatedState = dispatchBucketsTrigger(state, action);
                expect(updatedState.appState.renamingBucketItem).toBe(false);
            });
        });

        describe("BUCKETS_SET_BUCKET_ITEM_FORMAT test", () => {
            it("should set bucket item format property", () => {
                const localIdentifier = "m1";
                const format = "format#";
                const bucketItem = { localIdentifier };
                const initState = withData(getInitialState(), {
                    buckets: withBucketItems(getInitialState().data.buckets, MEASURES_INDEX, [bucketItem]),
                });
                const action = setBucketItemFormat(localIdentifier, format, "preset-id");

                const state = dispatchBucketsTrigger(initState, action);

                expect(state.data.buckets[MEASURES_INDEX].items[0].format).toEqual(format);
            });
        });
    });

    describe("action BUCKETS_DND_ITEM_REORDER", () => {
        const masterMeasure1: IRawBucketItem = {
            attribute: "m1",
            localIdentifier: "m1",
            filters: [],
            aggregation: "sum",
            type: METRIC,
        };
        const masterMeasure2: IRawBucketItem = {
            attribute: "m2",
            localIdentifier: "m2",
            filters: [],
            showInPercent: true,
            type: METRIC,
        };
        const derivedMeasure1: IRawBucketItem = {
            attribute: "m3",
            localIdentifier: "m3",
            isDerived: true,
            masterLocalIdentifier: "m1",
            filters: [],
            showInPercent: true,
            type: METRIC,
        };
        const attribute1: IRawBucketItem = {
            localIdentifier: "a1",
            filters: [],
            type: ATTRIBUTE,
        };
        const attribute2: IRawBucketItem = {
            localIdentifier: "a2",
            filters: [],
            type: ATTRIBUTE,
        };
        const attribute3: IRawBucketItem = {
            localIdentifier: "a3",
            filters: [],
            type: ATTRIBUTE,
        };
        const grandTotal: ITotal = {
            measureIdentifier: "m1",
            type: "sum",
            attributeIdentifier: "a1",
        };

        function getInitialState() {
            return withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [derivedMeasure1, masterMeasure1, masterMeasure2],
                    },
                    {
                        localIdentifier: ATTRIBUTE,
                        items: [attribute1, attribute2, attribute3],
                        totals: [grandTotal],
                    },
                ],
            });
        }

        it("should move bucket item to the first place in bucket", () => {
            const state = getInitialState();
            const action = reorderBucketItem(MEASURES, masterMeasure2, 2, 0);

            const updatedState = dispatchBucketsTrigger(state, action);
            expect(updatedState.data.buckets["0"].items).toEqual([
                masterMeasure2,
                derivedMeasure1,
                masterMeasure1,
            ]);
        });

        it("should move bucket item to the middle place in bucket", () => {
            const state = getInitialState();
            const action = reorderBucketItem(MEASURES, derivedMeasure1, 0, 1);

            const updatedState = dispatchBucketsTrigger(state, action);
            expect(updatedState.data.buckets["0"].items).toEqual([
                masterMeasure1,
                derivedMeasure1,
                masterMeasure2,
            ]);
        });

        it("should move bucket item to the last place in bucket", () => {
            const state = getInitialState();
            const action = reorderBucketItem(MEASURES, masterMeasure1, 1, 2);

            const updatedState = dispatchBucketsTrigger(state, action);
            expect(updatedState.data.buckets["0"].items).toEqual([
                derivedMeasure1,
                masterMeasure2,
                masterMeasure1,
            ]);
        });

        it("should apply changes to the totals when buckets are reordered", () => {
            const state = getInitialState();
            const action = reorderBucketItem(ATTRIBUTE, attribute1, 0, 1);

            const updatedState = dispatchBucketsTrigger(state, action);
            expect(updatedState.data.buckets["1"].totals).toEqual([
                {
                    measureIdentifier: "m1",
                    type: "sum",
                    attributeIdentifier: "a2",
                },
            ]);
        });
    });

    describe("action BUCKETS_DND_ITEM_REMOVE", () => {
        const masterMeasure1: IRawBucketItem = {
            attribute: "m1",
            localIdentifier: "m1",
            filters: [],
            aggregation: "sum",
            type: METRIC,
        };
        const masterMeasure2: IRawBucketItem = {
            attribute: "m2",
            localIdentifier: "m2",
            filters: [],
            showInPercent: true,
            type: METRIC,
        };
        const derivedMeasure1: IRawBucketItem = {
            attribute: "m3",
            localIdentifier: "m3",
            isDerived: true,
            masterLocalIdentifier: "m1",
            filters: [],
            showInPercent: true,
            type: METRIC,
        };
        const derivedMeasure2: IRawBucketItem = {
            attribute: "m4",
            localIdentifier: "m4",
            isDerived: true,
            masterLocalIdentifier: "m2",
            filters: [],
            showInPercent: true,
            type: METRIC,
        };
        const attribute1: IRawBucketItem = {
            localIdentifier: "a1",
            filters: [],
            type: ATTRIBUTE,
        };
        const date1: IRawBucketItem = {
            localIdentifier: "d1",
            filters: [],
            type: DATE,
            dateDatasetRef: {
                uri: "uri.1",
            },
        };

        function getInitialState(measureItems: IRawBucketItems, attributeItems: IRawBucketItems) {
            return withData(
                withData(getInitializedState(), {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: measureItems,
                        },
                        {
                            localIdentifier: ATTRIBUTE,
                            items: attributeItems,
                        },
                    ],
                }),
                {
                    filterBar: {
                        ...defaultFilterBarState,
                        items: [
                            {
                                type: DATE,
                                dateDatasetRef: {
                                    uri: "uri.1",
                                },
                            } as IFilter,
                        ],
                    },
                },
            );
        }

        const measures = [derivedMeasure1, derivedMeasure2, masterMeasure1, masterMeasure2];
        const state = getInitialState(measures, [attribute1, date1]);

        it("should keep all derived measures when last date is removed from buckets", () => {
            const action = removeBucketItem(date1, 1, ATTRIBUTE);
            const resultState = dispatchBucketsTrigger(state, action);
            expect(resultState.data.buckets["0"].items).toEqual(measures);
        });

        it("should remove all derived measures when date bucket still remains but date datasets are not same in date bucket and date filter", () => {
            const updatedState = withData(state, {
                filterBar: {
                    ...defaultFilterBarState,
                    items: [
                        {
                            type: DATE,
                            dateDatasetRef: {
                                uri: "uri.2",
                            },
                        } as IFilter,
                    ],
                },
            });
            const action = removeBucketItem(attribute1, 1, ATTRIBUTE);
            const resultState = dispatchBucketsTrigger(updatedState, action);
            expect(resultState.data.buckets["0"].items).toEqual([masterMeasure1, masterMeasure2]);
        });
    });

    describe("STORE_BUCKETS_SET_BUCKET_ITEM_DISPLAY_FORM", () => {
        const displayForm = uriRef("/gdc/md/TeamOneGoodSales1/obj/667");

        function getInitialState() {
            const buckets = getInitializedState().data.buckets;
            const bucketsWithAttribute = [
                ...(buckets ?? []),
                {
                    localIdentifier: ATTRIBUTE,
                    items: [
                        {
                            localIdentifier: "a1",
                            attribute: "attr.opportunity.id",
                            identifier: "attr.opportunity.id",
                            dfUri: "/gdc/md/TeamOneGoodSales1/obj/652",
                            dfIdentifier: "label.opportunity.id.name",
                            uri: "/gdc/md/TeamOneGoodSales1/obj/649",
                            ref: {
                                uri: "/gdc/md/TeamOneGoodSales1/obj/649",
                            },
                        },
                        {
                            localIdentifier: "d1",
                            attribute: "attr.datedataset",
                            dateDatasetRef: {
                                uri: "date/dataset/uri",
                            },
                        },
                    ],
                },
            ];
            return withData(withData(getInitializedState(), { buckets: bucketsWithAttribute }), {
                itemCache: {
                    "attribute.attr.opportunity.id": {
                        dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/648",
                        summary: "",
                        identifier: "attr.opportunity.id",
                        dfUri: "/gdc/md/TeamOneGoodSales1/obj/652",
                        dfIdentifier: "label.opportunity.id.name",
                        uri: "/gdc/md/TeamOneGoodSales1/obj/649",
                        ref: {
                            uri: "/gdc/md/TeamOneGoodSales1/obj/649",
                        },
                        granularity: "attr.opportunity.id",
                        elementsUri: "/gdc/md/TeamOneGoodSales1/obj/652/elements",
                        title: "Opportunity",
                        type: "attribute",
                        id: "attr.opportunity.id",
                        isAvailable: true,
                        displayForms: [
                            {
                                id: "attr.opportunity.text",
                                uri: "/md/attr.opportunity.text",
                                title: "Text display form",
                                ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/666"),
                                type: undefined,
                            },
                            {
                                id: "attr.opportunity.hyperlink",
                                uri: "/md/attr.opportunity.hyperlink",
                                title: "Hyperlink display form",
                                ref: displayForm,
                                type: "GDC.link",
                            },
                        ],
                    },
                },
            });
        }

        it("should change attribute display form", () => {
            const action = storeBucketItemDisplayForm("a1", displayForm);
            const updatedState = dispatchBucketsTrigger(getInitialState(), action);
            const updatedBucketItem = updatedState.data.buckets["0"].items[0];

            expect(updatedBucketItem.dfRef).toEqual(displayForm);
            expect(updatedBucketItem["displayForm"]).toEqual(displayForm);
            expect(updatedBucketItem["dfUri"]).toEqual("/md/attr.opportunity.hyperlink");
            expect(updatedBucketItem["dfIdentifier"]).toEqual("attr.opportunity.hyperlink");
        });

        it("should change date attribute display form", () => {
            const action = storeBucketItemDisplayForm("d1", displayForm);
            const updatedState = dispatchBucketsTrigger(getInitialState(), action);
            const updatedBucketItem = updatedState.data.buckets["0"].items[1];

            expect(updatedBucketItem.dfRef).toEqual(displayForm);
        });
    });
});
