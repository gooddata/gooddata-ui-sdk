// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import {
    type CatalogItem,
    type ICatalogAttribute,
    type ICatalogFact,
    type ICatalogMeasure,
    type ITotal,
    idRef,
} from "@gooddata/sdk-model";
import { BucketNames, type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import {
    type IBucketItem,
    type IExtendedReferencePoint,
    type IReferencePoint,
} from "@gooddata/sdk-ui-ext/internal";

import {
    dropCatalogItem,
    removeBucketItem,
    reorderBucketItem,
    replaceBucketItem,
    swapBucketItem,
} from "../actions/dnd_actions.js";
import { extendedReferencePointChanged, newDerivedBucketItemsPlaced } from "../actions/report_actions.js";
import {
    ATTRIBUTE,
    COLUMNS,
    DATE,
    FACT,
    FILTERS,
    MEASURES,
    METRIC,
    SECONDARY_MEASURES,
    STACK,
    VIEW,
} from "../constants/bucket.js";
import {
    DEFAULT_DECIMAL_FORMAT,
    DEFAULT_INTEGER_FORMAT,
    DEFAULT_PERCENTAGE_FORMAT,
} from "../constants/formats.js";
import { LOCAL_COLUMN, LOCAL_HEATMAP } from "../constants/visualization_types.js";
import { type IBucketItemProps, buildBucketItem } from "../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { bucketsSelector } from "../selectors/buckets_selector.js";
import { findBucketItemByLocalIdentifier, getBucketByLocalIdentifier } from "../services/buckets_service.js";
import { PluggableVisualizationService } from "../services/pluggable_visualization_service.js";
import {
    getRefPointDerivedMeasures,
    getRefPointNonDerivedMeasures,
} from "../services/reference_point_service.js";
import { getAllBucketItems } from "../store/buckets/buckets_selectors.js";
import { setCatalogItems } from "../store/catalog/catalog_store_actions.js";
import { filtersWereChanged } from "../store/filter_bar/filter_bar_actions.js";
import { getFilterItems } from "../store/filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../store/filter_bar/filter_bar_service.js";
import { FilterBar, type IDateFilter, type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import {
    withAddedBucketItems,
    withBucketItems,
    withBucketTotals,
} from "../tests/buckets_builder.test.helpers.js";
import { dateCreated, setupAppStateWithDateDatasetMeta } from "../tests/constants.test.helpers.js";
import { dispatchBucketsTrigger } from "../tests/dispatch_buckets_trigger.test.utils.js";
import { withBucketUiConfig, withUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../typings/buckets.js";
import { type ICacheItem, type ICatalogEntry } from "../typings/state_objects.js";

import { rootReducer } from "./root_reducer.js";

/**
 * The two buckets branches this suite drives, named instead of addressed: the branch is a value from
 * a closed union and the read/write pair is typed, so a typo is a compile error.
 */
type BucketsBranch = "buckets" | "referencePoint";

const readBranchBuckets = (s: IAppState, branch: BucketsBranch): IRawBuckets =>
    branch === "buckets" ? s.data.buckets : s.data.referencePoint.buckets;

const writeBranchBuckets = (s: IAppState, branch: BucketsBranch, buckets: IRawBuckets): IAppState =>
    branch === "buckets"
        ? withData(s, { buckets })
        : withData(s, { referencePoint: { ...s.data.referencePoint, buckets } });

function unwrapCacheItemIdentifier(filterItem: IFilter): string {
    if (FilterBar.isAttributeFilter(filterItem) || FilterBar.isDateFilter(filterItem)) {
        return filterItem.cacheItemIdentifier;
    }
    throw Error("filter items is neither attribute filter nor date filter");
}

describe("buckets_reducer", () => {
    const baseMeasureBucketUiConfig = {
        enabled: true,
        isShowInPercentEnabled: false,
        accepts: ["metric", "fact", "attribute"],
        canAddItems: true,
        allowsReordering: true,
        title: "Measures",
        itemsLimit: 20,
        allowsDuplicateItems: true,
    };
    let state: IAppState;

    function createCatalogItem(id: string, type = "fact", isLocationIconVisible?: boolean) {
        const item = { id, type, identifier: id, title: "", isLocationIconVisible };

        state = withData(state, { itemCache: { ...state.data.itemCache, [id]: item } });

        return item;
    }

    function createCatalogItemAcceptsDuplicated(
        id: string,
        identifier: string,
        type = "fact",
        isLocationIconVisible?: boolean,
    ) {
        const item = { id: identifier, type, identifier, title: "", isLocationIconVisible };

        state = withData(state, { itemCache: { ...state.data.itemCache, [id]: item } });

        return item;
    }

    function createBucketItem(id: string, customAttributes?: IBucketItemProps) {
        const bucketItem = buildBucketItem({
            attribute: id,
            type: "fact",
            identifier: id,
            ...customAttributes,
        });

        state = withData(state, { itemCache: { ...state.data.itemCache, [id]: bucketItem } });

        return bucketItem;
    }

    function addUiConfig(bucketName: string) {
        let uiConfig;
        switch (bucketName) {
            case MEASURES:
                uiConfig = baseMeasureBucketUiConfig;
                break;
            case SECONDARY_MEASURES: {
                uiConfig = {
                    ...baseMeasureBucketUiConfig,
                    allowShowOnSecondaryAxis: true,
                };
                break;
            }
            case STACK: {
                uiConfig = {
                    enabled: true,
                    isShowInPercentEnabled: false,
                    accepts: ["attribute"],
                    canAddItems: true,
                    allowsReordering: true,
                    title: "Stack by",
                    itemsLimit: 1,
                    allowsDuplicateItems: true,
                };
                break;
            }
            default: {
                uiConfig = {
                    enabled: true,
                    isShowInPercentEnabled: false,
                    accepts: ["attribute", "date"],
                    canAddItems: true,
                    allowsReordering: true,
                    title: "xxx",
                    itemsLimit: 20,
                    allowsDuplicateItems: true,
                };
            }
        }
        return withData(state, {
            extendedReferencePoint: withBucketUiConfig(
                state.data.extendedReferencePoint,
                bucketName,
                uiConfig,
            ),
        });
    }

    function addSupportedComparisonTypes() {
        return withData(state, {
            extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, {
                supportedOverTimeComparisonTypes: [
                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    OverTimeComparisonTypes.PREVIOUS_PERIOD,
                ],
            }),
        });
    }

    function addBucket(bucketName: string, bucketLocation: BucketsBranch = "buckets") {
        const b: IRawBucket = {
            localIdentifier: bucketName,
            items: [],
        };
        state = addUiConfig(bucketName);
        return writeBranchBuckets(state, bucketLocation, [
            ...(readBranchBuckets(state, bucketLocation) ?? []),
            b,
        ]);
    }

    function getBucketIndex(bucketName: string, bucketLocation: BucketsBranch = "buckets") {
        const buckets = readBranchBuckets(state, bucketLocation);
        return buckets.findIndex((b) => b?.localIdentifier === bucketName);
    }

    function addFilterItem(cacheItemIdentifier: string, type: ICacheItem["type"] = "attribute") {
        const cacheItem: ICacheItem = {
            ref: {
                identifier: cacheItemIdentifier,
            },
            identifier: cacheItemIdentifier,
            type,
            title: `filter.${cacheItemIdentifier}`,
            uri: `uri.${cacheItemIdentifier}`,
        };
        const newFilter = FilterBarService.createFilter(cacheItem);
        state = FilterBarService.addFilter(state, newFilter);
        state = withData(state, {
            itemCache: { ...state.data.itemCache, [cacheItemIdentifier]: cacheItem },
        });
    }

    function addBucketItem(bucketLocalIdentifier: string, bucketItem: IRawBucketItem) {
        let bucketIndex = getBucketIndex(bucketLocalIdentifier);
        if (bucketIndex < 0) {
            state = addBucket(bucketLocalIdentifier);
            // the index must be recomputed: a stale -1 would write a stray own property on the
            // array instead of addressing the freshly appended LAST bucket
            bucketIndex = getBucketIndex(bucketLocalIdentifier);
        }
        state = withData(state, {
            buckets: withAddedBucketItems(state.data.buckets, bucketIndex, bucketItem),
        });

        return bucketItem;
    }

    function addBucketItemToReferencePoint(bucketLocalIdentifier: string, bucketItem: IRawBucketItem) {
        let bucketIndex = getBucketIndex(bucketLocalIdentifier, "referencePoint");
        if (bucketIndex < 0) {
            state = addBucket(bucketLocalIdentifier, "referencePoint");
            bucketIndex = getBucketIndex(bucketLocalIdentifier, "referencePoint");
        }
        state = writeBranchBuckets(
            state,
            "referencePoint",
            withBucketItems(state.data.referencePoint.buckets, bucketIndex, [
                ...(state.data.referencePoint.buckets[bucketIndex]?.items ?? []),
                bucketItem,
            ]),
        );

        return bucketItem;
    }

    function getBucketAttributes(localIdentifier: string) {
        const bucketIndex = getBucketIndex(localIdentifier);
        return state.data.buckets[bucketIndex].items.map((item) => item?.attribute);
    }

    function getFilterAttributes() {
        const filters = getFilterItems(state);
        return filters.map((item) => unwrapCacheItemIdentifier(item));
    }

    function setVisualizationClass(visClassUrl: string) {
        state = withData(state, {
            visualizationClass: visualizationClassMock(visClassUrl),
        });
    }

    function addMasterMeasure() {
        const masterMeasureBucketItem = createBucketItem("master_measure", {
            type: METRIC,
            localIdentifier: "master-measure",
        });
        addBucketItem(MEASURES, masterMeasureBucketItem);
        addBucketItemToReferencePoint(MEASURES, masterMeasureBucketItem);
    }

    function addDerivedMeasure(overTimeComparisonType: OverTimeComparisonType) {
        const bucketItem = createBucketItem("derived_measure", {
            type: METRIC,
            localIdentifier: "derived-measure",
            masterLocalIdentifier: "master-measure",
            overTimeComparisonType,
        });
        addBucketItem(MEASURES, bucketItem);
        addBucketItemToReferencePoint(MEASURES, bucketItem);
    }

    beforeEach(() => {
        state = getInitializedState();
        state = addBucket(MEASURES);
        state = addBucket(SECONDARY_MEASURES);
        state = addBucket(VIEW);
        state = addBucket(STACK);
        state = addUiConfig(FILTERS);
        state = addSupportedComparisonTypes();
        state = setupAppStateWithDateDatasetMeta(state);
    });

    function addTotals(state: IAppState, bucketIdentifier: string, totals: ITotal[]) {
        const bucketIndex = getBucketIndex(bucketIdentifier);
        return withData(state, { buckets: withBucketTotals(state.data.buckets, bucketIndex, totals) });
    }

    function getTotals(state: IAppState, bucketIdentifier: string) {
        const bucketIndex = getBucketIndex(bucketIdentifier);
        return state.data.buckets?.[bucketIndex]?.totals ?? [];
    }

    describe("BUCKETS_DND_ITEM_INSERT", () => {
        it("should put bucket item with attribute sample_catalog_item to first bucket", () => {
            const CATALOG_ITEM_ID = "sample_catalog_item";
            const catalogItem = createCatalogItem(CATALOG_ITEM_ID);

            const action = dropCatalogItem(MEASURES, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(MEASURES)).toEqual([CATALOG_ITEM_ID]);
        });

        it("should add bucket item and delete CONFIGURATION_PANEL_COLLAPSED_BY_DRAGGING flag if it's set", () => {
            state = withData(state, {
                configurationPanel: { ...state.data.configurationPanel, collapsedByDragging: true },
            });
            const CATALOG_ITEM_ID = "sample_catalog_item";
            const catalogItem = createCatalogItem(CATALOG_ITEM_ID);

            const action = dropCatalogItem(MEASURES, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.configurationPanel.collapsedByDragging).toBeUndefined();
        });

        it("should add bucket item to the end of items of first bucket", () => {
            addBucketItem(MEASURES, createBucketItem("sample_catalog_item"));
            const CATALOG_ITEM_ID = "second";
            const catalogItem = createCatalogItem(CATALOG_ITEM_ID);

            const action = dropCatalogItem(MEASURES, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(MEASURES)).toEqual(["sample_catalog_item", CATALOG_ITEM_ID]);
        });

        it("should not create filter", () => {
            const CATEGORIES_BUCKET_ITEM_ID = "sample_categories_bucket_item";
            const catalogItem = createCatalogItem(CATEGORIES_BUCKET_ITEM_ID, "attribute");

            const action = dropCatalogItem(VIEW, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(getFilterAttributes()).toEqual([]);
        });

        it("should not add bucket item if already exists on buckets list", () => {
            const CATALOG_ITEM_ID = "dummy_catalog_item";
            addFilterItem(CATALOG_ITEM_ID);
            const catalogItem = createCatalogItem(CATALOG_ITEM_ID, "attribute");

            const action = dropCatalogItem(VIEW, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getFilterAttributes()).toEqual(["dummy_catalog_item"]);
        });

        it("should result in valid bucket item in terms of bucketsSelector", () => {
            const CATALOG_ITEM_ID = "sample_catalog_item";
            const catalogItem = createCatalogItemAcceptsDuplicated(
                `fact.${CATALOG_ITEM_ID}`,
                CATALOG_ITEM_ID,
            );

            const action = dropCatalogItem(MEASURES, catalogItem);
            state = dispatchBucketsTrigger(state, action);
            // no item is being renamed / inspected — the selector's own no-item branch
            const res = bucketsSelector(state, { bucketItem: undefined, localIdentifier: undefined });

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(res.buckets[0].items[0].attribute).toEqual(catalogItem);
        });

        it("should put item into bucket by localIdentifier", () => {
            const CATALOG_ITEM_ID = "sample_catalog_item";
            const catalogItem = createCatalogItem(CATALOG_ITEM_ID, "attribute");

            const action = dropCatalogItem(VIEW, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(VIEW)).toEqual([CATALOG_ITEM_ID]);
        });

        it("should read supported display forms from attribute item cache when dropping an attribute into measures", () => {
            const catalogItem = {
                id: "attr.hyper.id",
                type: "attribute",
                identifier: "attr.hyper.id",
                title: "",
            };

            state = withData(state, {
                itemCache: {
                    ...state.data.itemCache,
                    ["attribute.attr.hyper.id"]: {
                        identifier: "attr.hyper.id",
                        type: "attribute",
                        displayForms: [
                            {
                                id: "label.hyper.text",
                                uri: "/md/label.hyper.text",
                                ref: idRef("label.hyper.text"),
                                title: "Hyper attribute",
                            },
                            {
                                id: "label.hyper.hll",
                                uri: "/md/label.hyper.hll",
                                ref: idRef("label.hyper.hll"),
                                title: "Hyper attribute HLL",
                                type: "GDC.hyperloglog",
                            },
                        ],
                    } as ICatalogEntry,
                },
            });

            const action = dropCatalogItem(MEASURES, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items?.[0]?.displayForms).toEqual([
                {
                    id: "label.hyper.text",
                    uri: "/md/label.hyper.text",
                    ref: idRef("label.hyper.text"),
                    title: "Hyper attribute",
                },
            ]);
        });

        it("should put attribute date dataset in case of date dropped", () => {
            const catalogItem = createCatalogItem(DATE_DATASET_ATTRIBUTE, "date");
            const stateWithDateDataset = withData(state, {
                dateDatasets: { ...state.data.dateDatasets, available: [dateCreated] },
            });
            const action = dropCatalogItem(VIEW, catalogItem);
            state = dispatchBucketsTrigger(stateWithDateDataset, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(VIEW)).toEqual([DATE_DATASET_ATTRIBUTE]);
        });

        describe("add derived measure", () => {
            it("should add derived measure when comparison is enabled on all measures", () => {
                addMasterMeasure();
                addDerivedMeasure(OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);

                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(1);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(1);

                const CATALOG_ITEM_ID = "second";
                const catalogItem = createCatalogItem(CATALOG_ITEM_ID);
                const action = dropCatalogItem(MEASURES, catalogItem);
                state = dispatchBucketsTrigger(state, action);

                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(2);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(1);
                expect(PluggableVisualizationService.getNewDerivedBucketItems(state)).toHaveLength(1);
            });

            it("should add derived previous period measure when comparison is enabled on all measures", () => {
                addMasterMeasure();
                addDerivedMeasure(OverTimeComparisonTypes.PREVIOUS_PERIOD);

                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(1);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(1);

                const CATALOG_ITEM_ID = "second";
                const catalogItem = createCatalogItem(CATALOG_ITEM_ID);
                const action = dropCatalogItem(MEASURES, catalogItem);
                state = dispatchBucketsTrigger(state, action);

                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(2);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(1);
                expect(PluggableVisualizationService.getNewDerivedBucketItems(state)).toHaveLength(1);
            });

            it("should not add derived measure when comparison is enabled on all measures, but it's comparison type is not supported", () => {
                addMasterMeasure();
                addDerivedMeasure(OverTimeComparisonTypes.NOTHING);

                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(1);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(1);

                const CATALOG_ITEM_ID = "second";
                const catalogItem = createCatalogItem(CATALOG_ITEM_ID);
                const action = dropCatalogItem(MEASURES, catalogItem);
                state = dispatchBucketsTrigger(state, action);

                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(2);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(1);
            });

            it("should not add derived measure when comparison is not enabled on all measures", () => {
                addMasterMeasure();

                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(1);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(0);

                const CATALOG_ITEM_ID = "second";
                const catalogItem = createCatalogItem(CATALOG_ITEM_ID);
                const action = dropCatalogItem(MEASURES, catalogItem);
                state = dispatchBucketsTrigger(state, action);

                expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
                expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toBe(2);
                expect(getRefPointDerivedMeasures(state)?.length ?? 0).toBe(0);
            });
        });

        describe("totals handling", () => {
            function getDroppedMeasureLocalIdentifier() {
                const bucketIndex = getBucketIndex(MEASURES);
                const items = state.data.buckets[bucketIndex].items;
                return items?.at(-1)?.localIdentifier;
            }

            let droppedMeasure: IRawBucketItem;

            beforeEach(() => {
                state = addBucket(ATTRIBUTE);

                addBucketItem(
                    ATTRIBUTE,
                    createBucketItem("attribute1", {
                        type: "attribute",
                        localIdentifier: "a1",
                    }),
                );
                addBucketItem(
                    ATTRIBUTE,
                    createBucketItem("attribute2", {
                        type: "attribute",
                        localIdentifier: "a2",
                    }),
                );
                addBucketItem(
                    ATTRIBUTE,
                    createBucketItem("attribute3", {
                        type: "attribute",
                        localIdentifier: "a3",
                    }),
                );
                addBucketItem(
                    MEASURES,
                    createBucketItem("oranges", {
                        type: "metric",
                        localIdentifier: "m1",
                    }),
                );

                droppedMeasure = createCatalogItem("apples");
            });

            it("should not add total when no total is defined", () => {
                const action = dropCatalogItem(MEASURES, droppedMeasure);
                state = dispatchBucketsTrigger(state, action);

                expect(getTotals(state, ATTRIBUTE)).toEqual([]);
            });

            it("should add all totals when some totals are defined and pivot table next is disabled", () => {
                state = withRoot(state, { featureFlags: { enableNewPivotTable: false } });
                state = addTotals(state, ATTRIBUTE, [
                    { measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" },
                    { measureIdentifier: "m1", attributeIdentifier: "a2", type: "max" },
                ]);

                const action = dropCatalogItem(MEASURES, droppedMeasure);
                state = dispatchBucketsTrigger(state, action);

                const droppedMeasureLocalIdentifier = getDroppedMeasureLocalIdentifier();
                expect(getTotals(state, ATTRIBUTE)).toEqual([
                    { measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" },
                    { measureIdentifier: "m1", attributeIdentifier: "a2", type: "max" },
                    {
                        measureIdentifier: droppedMeasureLocalIdentifier,
                        attributeIdentifier: "a1",
                        type: "sum",
                    },
                    {
                        measureIdentifier: droppedMeasureLocalIdentifier,
                        attributeIdentifier: "a2",
                        type: "max",
                    },
                ]);
            });

            it("should add all totals when some totals are defined", () => {
                state = withRoot(state, { featureFlags: undefined });
                state = addTotals(state, ATTRIBUTE, [
                    { measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" },
                    { measureIdentifier: "m1", attributeIdentifier: "a2", type: "max" },
                ]);

                const action = dropCatalogItem(MEASURES, droppedMeasure);
                state = dispatchBucketsTrigger(state, action);

                const droppedMeasureLocalIdentifier = getDroppedMeasureLocalIdentifier();
                expect(getTotals(state, ATTRIBUTE)).toEqual([
                    { measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" },
                    {
                        measureIdentifier: droppedMeasureLocalIdentifier,
                        attributeIdentifier: "a1",
                        type: "sum",
                    },
                    { measureIdentifier: "m1", attributeIdentifier: "a2", type: "max" },
                    {
                        measureIdentifier: droppedMeasureLocalIdentifier,
                        attributeIdentifier: "a2",
                        type: "max",
                    },
                ]);
            });

            it('should return expected totals when row attribute is inserted after "within attribute"', () => {
                const measure = addBucketItem(
                    MEASURES,
                    createBucketItem("oranges", {
                        type: "metric",
                        localIdentifier: "m1",
                    }),
                );
                addBucketItemToReferencePoint(MEASURES, measure);

                state = addTotals(state, ATTRIBUTE, [
                    { measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" },
                    { measureIdentifier: "m1", attributeIdentifier: "a2", type: "min" },
                    { measureIdentifier: "m1", attributeIdentifier: "a3", type: "max" },
                ]);

                const attribute = createCatalogItem("some-attribute", ATTRIBUTE);
                const attributeBucketPosition = 1;
                const action = dropCatalogItem(ATTRIBUTE, attribute, attributeBucketPosition);

                state = dispatchBucketsTrigger(state, action);

                const attributeLocalIdentifier =
                    state.data.buckets?.[getBucketIndex(ATTRIBUTE)]?.items?.[attributeBucketPosition]
                        ?.localIdentifier;

                expect(getTotals(state, ATTRIBUTE)).toEqual([
                    { measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" },
                    { measureIdentifier: "m1", attributeIdentifier: attributeLocalIdentifier, type: "min" },
                    { measureIdentifier: "m1", attributeIdentifier: "a3", type: "max" },
                ]);
            });
        });
    });

    describe("BUCKETS_DND_ITEM_REMOVE", () => {
        it("should remove item from first bucket", () => {
            const BUCKET_ID = MEASURES;
            const item = addBucketItem(BUCKET_ID, createBucketItem("sample_catalog_item"));

            const action = removeBucketItem(item, undefined, undefined);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);

            expect(state.data.buckets?.[getBucketIndex(BUCKET_ID)]?.items).toHaveLength(0);
        });

        it("should remove item from second bucket", () => {
            const BUCKET_ID = VIEW;
            addBucketItem(MEASURES, createBucketItem("sample_catalog_item"));
            const item = addBucketItem(BUCKET_ID, createBucketItem("sample_catalog_item"));

            const action = removeBucketItem(item, undefined, undefined);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toHaveLength(1);
            expect(state.data.buckets?.[getBucketIndex(BUCKET_ID)]?.items).toHaveLength(0);
        });

        it("should remove first item from bucket", () => {
            const BUCKET_ID = MEASURES;
            const firstItem = addBucketItem(BUCKET_ID, createBucketItem("sample_catalog_item"));
            const secondItem = addBucketItem(BUCKET_ID, createBucketItem("other"));

            const action = removeBucketItem(firstItem, undefined, undefined);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(BUCKET_ID)]?.items?.[0]).toEqual(secondItem);
        });

        it("should remove first item from second bucket", () => {
            const FIRST_BUCKET_ID = MEASURES;
            const SECOND_BUCKET_ID = VIEW;

            addBucketItem(FIRST_BUCKET_ID, createBucketItem("sample_catalog_item"));
            const firstItem = addBucketItem(SECOND_BUCKET_ID, createBucketItem("sample_catalog_item"));
            const secondItem = addBucketItem(SECOND_BUCKET_ID, createBucketItem("other"));

            const action = removeBucketItem(firstItem, undefined, undefined);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(FIRST_BUCKET_ID)]?.items).toHaveLength(1);
            expect(state.data.buckets?.[getBucketIndex(SECOND_BUCKET_ID)]?.items).toHaveLength(1);

            expect(state.data.buckets?.[getBucketIndex(SECOND_BUCKET_ID)]?.items?.[0]).toEqual(secondItem);
        });

        it("should remove date from bucket", () => {
            const BUCKET_ID = VIEW;
            const firstItem = addBucketItem(
                BUCKET_ID,
                createBucketItem(DATE_DATASET_ATTRIBUTE, { type: "date" }),
            );
            const secondItem = addBucketItem(BUCKET_ID, createBucketItem("attribute"));

            const action = removeBucketItem(firstItem, undefined, undefined);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(BUCKET_ID)]?.items?.[0]).toEqual(secondItem);
        });

        it("should sanitize column totals when item is removed from columns", () => {
            const columnsBucketItem = addBucketItem(
                COLUMNS,
                createBucketItem("sample_attr", { type: "attribute" }),
            );

            state = addTotals(state, COLUMNS, [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: columnsBucketItem.localIdentifier,
                    type: "sum",
                },
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: columnsBucketItem.localIdentifier,
                    type: "max",
                },
            ]);

            const action = removeBucketItem(columnsBucketItem, 0, COLUMNS);
            state = dispatchBucketsTrigger(state, action);

            expect(getTotals(state, COLUMNS).length).toEqual(0);
        });

        it("should keep column totals intact when item is removed from attributes", () => {
            addBucketItem(
                MEASURES,
                createBucketItem("m1", {
                    type: "metric",
                    localIdentifier: "m1",
                }),
            );
            const columnsBucketItem = addBucketItem(
                COLUMNS,
                createBucketItem("colAttr", { type: "attribute" }),
            );
            const rowBucketItem = addBucketItem(
                ATTRIBUTE,
                createBucketItem("rowAttr", { type: "attribute" }),
            );

            state = addTotals(state, ATTRIBUTE, [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: rowBucketItem.localIdentifier,
                    type: "sum",
                },
            ]);

            state = addTotals(state, COLUMNS, [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: columnsBucketItem.localIdentifier,
                    type: "sum",
                },
            ]);

            const action = removeBucketItem(columnsBucketItem, 0, COLUMNS);
            state = dispatchBucketsTrigger(state, action);

            expect(getTotals(state, COLUMNS).length).toEqual(0);
            expect(getTotals(state, ATTRIBUTE).length).toEqual(1);
        });

        it("should remove derived measures together with master measure", () => {
            const firstMeasure = addBucketItem(MEASURES, createBucketItem("a"));
            const secondMeasure = addBucketItem(SECONDARY_MEASURES, createBucketItem("b"));

            const firstMeasureDerived = {
                ...firstMeasure,
                masterLocalIdentifier: firstMeasure.localIdentifier,
                localIdentifier: "sample_pop",
            };

            const thirdMeasure = addBucketItem(MEASURES, createBucketItem("c"));

            state = withData(state, {
                buckets: withBucketItems(state.data.buckets, getBucketIndex(SECONDARY_MEASURES), [
                    secondMeasure,
                    firstMeasureDerived,
                ]),
            });

            const action = removeBucketItem(firstMeasure, undefined, undefined);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toEqual([thirdMeasure]);
            expect(state.data.buckets?.[getBucketIndex(SECONDARY_MEASURES)]?.items).toEqual([secondMeasure]);
        });
    });

    describe("SAGA_FILTERS_WERE_CHANGED", () => {
        it("should set date dataset when date filter was added", () => {
            const newFilter = FilterBarService.createDateFilter({ uri: "selectedDateDatasetUri" });
            state = FilterBarService.addFilter(state, newFilter);

            const action = filtersWereChanged([newFilter], []);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.filters).toEqual({
                items: [
                    {
                        attribute: newFilter.cacheItemIdentifier,
                        autoCreated: false,
                        filters: [
                            {
                                attribute: newFilter.cacheItemIdentifier,
                                interval: {
                                    name: "all_time",
                                },
                                overTimeComparisonType: "nothing",
                            },
                        ],
                        localIdentifier: newFilter.localIdentifier,
                        dateDatasetRef: {
                            uri: "selectedDateDatasetUri",
                        },
                    },
                ],
                localIdentifier: "filters",
            });
        });

        it("should set remove related derived measures from buckets when filter is removed", () => {
            addMasterMeasure();
            addDerivedMeasure(OverTimeComparisonTypes.PREVIOUS_PERIOD);

            const newFilter = FilterBarService.createDateFilter({ uri: "selectedDateDatasetUri" });
            const removedFilter: IDateFilter = {
                ...newFilter,
                overTimeComparisonType: "previous_period",
            };

            const action = filtersWereChanged([], [removedFilter]);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets[0].items).toEqual([
                {
                    ref: null,
                    aggregation: null,
                    alias: null,
                    attribute: "master_measure",
                    filters: [],
                    granularity: null,
                    identifier: "master_measure",
                    isKdaDisabled: null,
                    localIdentifier: "master-measure",
                    masterLocalIdentifier: null,
                    operandLocalIdentifiers: null,
                    operator: null,
                    showInPercent: null,
                    showAllValues: null,
                    showOnSecondaryAxis: null,
                    isTotalMeasure: null,
                    isThresholdMeasure: null,
                    type: "metric",
                },
            ]);
            expect(state.data.referencePoint.filters).toEqual({
                items: [],
                localIdentifier: "filters",
            });
        });

        it("should remove filter related bucketsMeta information when filter is removed", () => {
            const removedFilter = FilterBarService.createDateFilter({ uri: "selectedDateDatasetUri" });
            // Both markers PRESENT but holding `undefined` — a shape no production writer makes, hence
            // the cast. That is the point of the fixture: the removal must leave them undefined
            // whichever way they got that way.
            const undefinedMarker = {
                [removedFilter.cacheItemIdentifier]: undefined,
            } as unknown as Record<string, boolean>;
            state = withData(state, {
                bucketsMeta: {
                    ...state.data.bucketsMeta,
                    modified: { ...state.data.bucketsMeta.modified, ...undefinedMarker },
                    autoCreated: { ...state.data.bucketsMeta.autoCreated, ...undefinedMarker },
                },
            });

            const action = filtersWereChanged([], [removedFilter]);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.bucketsMeta.modified[removedFilter.cacheItemIdentifier]).toBeUndefined();
            expect(state.data.bucketsMeta.autoCreated[removedFilter.cacheItemIdentifier]).toBeUndefined();
        });
    });

    describe("BUCKETS_DND_ITEM_REPLACE", () => {
        it("should replace item", () => {
            const BUCKET_ID = MEASURES;

            const catalogItem = createCatalogItem("sample_catalog_item", "attribute");
            const item = addBucketItem(BUCKET_ID, createBucketItem("other_item"));

            const action = replaceBucketItem(item, catalogItem);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(BUCKET_ID)).toEqual(["sample_catalog_item"]);
        });

        it("should replace first item", () => {
            const BUCKET_ID = MEASURES;

            const catalogItem = createCatalogItem("sample_catalog_item");
            const item = addBucketItem(BUCKET_ID, createBucketItem("other_item"));
            addBucketItem(BUCKET_ID, createBucketItem("second_item"));

            const action = replaceBucketItem(item, catalogItem);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(BUCKET_ID)).toEqual(["sample_catalog_item", "second_item"]);
        });

        it("should replace second item", () => {
            const BUCKET_ID = MEASURES;

            const catalogItem = createCatalogItem("sample_catalog_item");
            addBucketItem(BUCKET_ID, createBucketItem("other_item"));
            const item = addBucketItem(BUCKET_ID, createBucketItem("second_item"));

            const action = replaceBucketItem(item, catalogItem);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(BUCKET_ID)).toEqual(["other_item", "sample_catalog_item"]);

            expect(state.data.buckets?.[getBucketIndex(BUCKET_ID)]?.items?.[1]?.attribute).toEqual(
                "sample_catalog_item",
            );
        });

        it("should replace date in bucket", () => {
            const BUCKET_ID = MEASURES;

            const catalogItem = createCatalogItem("sample_catalog_item");
            const item = addBucketItem(BUCKET_ID, createBucketItem(DATE_DATASET_ATTRIBUTE, { type: "date" }));

            const action = replaceBucketItem(item, catalogItem);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(BUCKET_ID)).toEqual(["sample_catalog_item"]);
        });

        it("should remove related derived measure from different bucket than master measure is replaced", () => {
            const masterBucketItem = createBucketItem("masterMeasure", { localIdentifier: "m1" });
            addBucketItem(MEASURES, masterBucketItem);
            const derivedBucketItem = createBucketItem("derivedMeasure", { masterLocalIdentifier: "m1" });
            addBucketItem(SECONDARY_MEASURES, derivedBucketItem);

            const catalogItem = createCatalogItem("sample_catalog_item");

            const action = replaceBucketItem(masterBucketItem, catalogItem);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(getBucketAttributes(MEASURES)).toEqual(["sample_catalog_item"]);
            expect(getBucketAttributes(SECONDARY_MEASURES)).toEqual([]);
        });

        it("should not auto-create filter item for replaced bucket item", () => {
            const bucketItem = addBucketItem(
                VIEW,
                createBucketItem(DATE_DATASET_ATTRIBUTE, { type: "date" }),
            );
            const catalogItem = createCatalogItem("sample_catalog_item", "attribute");

            const action = replaceBucketItem(bucketItem, catalogItem);
            state = dispatchBucketsTrigger(state, action);
            const filters = getFilterItems(state);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(filters).toHaveLength(0);
        });

        it("should remove dependant measure value filter", () => {
            const buckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                        },
                        {
                            localIdentifier: "m2",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            type: DATE,
                            attribute: DATE_DATASET_ATTRIBUTE,
                            localIdentifier: "date",
                        },
                        {
                            type: ATTRIBUTE,
                            localIdentifier: "a1",
                        },
                    ],
                },
            ];
            state = withData(state, { buckets: buckets });
            state = FilterBarService.addFilter(state, FilterBarService.createMeasureValueFilter("m1"));
            state = FilterBarService.addFilter(state, FilterBarService.createMeasureValueFilter("m2"));

            const catalogItem = createCatalogItem("another_item");
            const bucketItem = findBucketItemByLocalIdentifier(state, "m1");

            const action = replaceBucketItem(bucketItem, catalogItem);
            const newState = dispatchBucketsTrigger(state, action);

            const expectedFilters = [expect.objectContaining({ measureLocalIdentifier: "m2" })];
            expect(getFilterItems(newState)).toEqual(expectedFilters);
        });
    });

    describe("BUCKETS_DND_ITEM_SWAP", () => {
        it("should take item from bucket[0] and put it to bucket[1]", () => {
            const item = addBucketItem(STACK, createBucketItem("sample", { type: "attribute" }));

            const action = swapBucketItem(VIEW, item, null);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(STACK)]?.items).toHaveLength(0);
            expect(state.data.buckets?.[getBucketIndex(VIEW)]?.items).toHaveLength(1);
            expect(state.data.buckets?.[getBucketIndex(VIEW)]?.items?.[0]).toEqual(item);
        });

        it("should take master item from bucket[0] and put it to bucket[1] without its derived measure", () => {
            const masterMeasure = addBucketItem(
                MEASURES,
                createBucketItem("sample", {
                    localIdentifier: "m1",
                }),
            );
            addBucketItem(
                MEASURES,
                createBucketItem("derived_sample", {
                    localIdentifier: "m2",
                    masterLocalIdentifier: "m1",
                }),
            );
            addBucketItem(MEASURES, createBucketItem("sample2"));
            addBucketItem(SECONDARY_MEASURES, createBucketItem("sample3"));

            const action = swapBucketItem(SECONDARY_MEASURES, masterMeasure, null);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toHaveLength(2);
            expect(state.data.buckets?.[getBucketIndex(SECONDARY_MEASURES)]?.items).toHaveLength(2);
        });

        it("should take derived item from bucket[0] and put it to bucket[1] without its master measure", () => {
            addBucketItem(
                MEASURES,
                createBucketItem("sample", {
                    localIdentifier: "m1",
                }),
            );
            const derivedMeasure = addBucketItem(
                MEASURES,
                createBucketItem("derived_sample", {
                    localIdentifier: "m2",
                    masterLocalIdentifier: "m1",
                }),
            );
            addBucketItem(MEASURES, createBucketItem("sample2"));
            addBucketItem(SECONDARY_MEASURES, createBucketItem("sample3"));

            const action = swapBucketItem(SECONDARY_MEASURES, derivedMeasure, null);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toHaveLength(2);
            expect(state.data.buckets?.[getBucketIndex(SECONDARY_MEASURES)]?.items).toHaveLength(2);
        });

        it("should take item from bucket[0] and swap with item in bucket[1]", () => {
            const from = addBucketItem(MEASURES, createBucketItem("from"));
            const to = addBucketItem(VIEW, createBucketItem("to"));

            const action = swapBucketItem(null, from, to);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items?.[0]).toEqual(to);
            expect(state.data.buckets?.[getBucketIndex(VIEW)]?.items?.[0]).toEqual(from);
        });

        /**
         * The swap's "does the FROM bucket accept the item I am swapping in" read. `accepts` is an
         * ARRAY, so it must be tested with array methods — anything else is a live TypeError in
         * drag-and-drop.
         */
        it("should able to swap date item current visualization is heatmap", () => {
            setVisualizationClass(LOCAL_HEATMAP);
            const uiConfig = {
                enabled: true,
                isShowInPercentEnabled: false,
                accepts: ["attribute", "date"],
                canAddItems: true,
                allowsReordering: false,
                title: "columns",
                itemsLimit: 1,
                allowsDuplicateItems: true,
            };
            state = withData(state, {
                extendedReferencePoint: withBucketUiConfig(
                    state.data.extendedReferencePoint,
                    STACK,
                    uiConfig,
                ),
            });

            const from = addBucketItem(STACK, createBucketItem("from"));
            const to = addBucketItem(VIEW, createBucketItem(DATE_DATASET_ATTRIBUTE, { type: "date" }));

            const action = swapBucketItem(null, from, to);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(VIEW)]?.items?.[0]).toEqual(from);
            expect(state.data.buckets?.[getBucketIndex(STACK)]?.items?.[0]).toEqual(to);
        });

        it("should replace date item when current visualization is not heatmap", () => {
            setVisualizationClass(LOCAL_COLUMN);
            const from = addBucketItem(STACK, createBucketItem("from"));
            const to = addBucketItem(VIEW, createBucketItem(DATE_DATASET_ATTRIBUTE, { type: "date" }));

            const action = swapBucketItem(null, from, to);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(STACK)]?.items?.[0]).toBe(undefined);
            expect(state.data.buckets?.[getBucketIndex(VIEW)]?.items?.[0]).toEqual(from);
        });

        it("should synchronize date attribute when bucket prefers synchronization", () => {
            setVisualizationClass(LOCAL_COLUMN);
            const inView = addBucketItem(
                VIEW,
                createBucketItem(DATE_DATASET_ATTRIBUTE, {
                    type: "date",
                    dateDatasetRef: { uri: "d1" },
                }),
            );
            const from = addBucketItem(
                STACK,
                createBucketItem(DATE_DATASET_ATTRIBUTE, {
                    type: "date",
                    dateDatasetRef: { uri: "d2" },
                }),
            );

            state = withData(state, {
                extendedReferencePoint: withBucketUiConfig(state.data.extendedReferencePoint, "view", {
                    enabled: true,
                    accepts: ["attribute", "date"],
                    canAddItems: true,
                    allowsReordering: true,
                    title: "Views",
                    itemsLimit: 20,
                    allowsDuplicateItems: true,
                    preferSynchronizedDates: true,
                }),
            });
            const action = swapBucketItem(VIEW, from, null);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
            expect(state.data.buckets?.[getBucketIndex(STACK)]?.items?.[0]).toBe(undefined);
            expect(state.data.buckets?.[getBucketIndex(VIEW)]?.items?.[0]).toEqual(inView);
            expect(state.data.buckets?.[getBucketIndex(VIEW)]?.items?.[1]).toEqual({
                ...from,
                dateDatasetRef: inView.dateDatasetRef,
            });
        });

        it("should sanitize totals when bucket item is swapped", () => {
            state = addBucket(ATTRIBUTE);
            state = addBucket(COLUMNS);

            const attributeBucketIndex = getBucketIndex(ATTRIBUTE);

            addBucketItem(
                MEASURES,
                createBucketItem("measure_1", {
                    type: "metric",
                    localIdentifier: "m1",
                }),
            );
            const from = addBucketItem(
                ATTRIBUTE,
                createBucketItem("attribute_1", {
                    type: "attribute",
                    localIdentifier: "a1",
                }),
            );
            addBucketItem(
                ATTRIBUTE,
                createBucketItem("attribute_2", {
                    type: "attribute",
                    localIdentifier: "a2",
                }),
            );

            state = withData(state, {
                buckets: withBucketTotals(state.data.buckets, attributeBucketIndex, [
                    // `totalType` (not `type`) rides through the swap verbatim — the reducer
                    // rewrites attributeIdentifier and leaves the rest of the record alone
                    {
                        measureIdentifier: "m1",
                        attributeIdentifier: "a1",
                        totalType: "sum",
                    } as unknown as ITotal,
                ]),
            });

            const action = swapBucketItem(COLUMNS, from, null);
            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets[attributeBucketIndex].items).toHaveLength(1);
            expect(state.data.buckets[attributeBucketIndex].totals).toEqual([
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a2",
                    totalType: "sum",
                },
            ]);
        });
    });

    describe("BUCKETS_DND_ITEM_REORDER", () => {
        function createFourMeasures() {
            return [
                addBucketItem(MEASURES, createBucketItem("item1")),
                addBucketItem(MEASURES, createBucketItem("item2")),
                addBucketItem(MEASURES, createBucketItem("item3")),
                addBucketItem(MEASURES, createBucketItem("item4")),
            ];
        }

        it("should move item from the beginning forward", () => {
            const [item1, item2, item3, item4] = createFourMeasures();
            const action = reorderBucketItem(MEASURES, item1, null, 2);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toEqual([
                item2,
                item3,
                item1,
                item4,
            ]);
        });

        it("should move item from the end backwards", () => {
            const [item1, item2, item3, item4] = createFourMeasures();
            const action = reorderBucketItem(MEASURES, item4, null, 1);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toEqual([
                item1,
                item4,
                item2,
                item3,
            ]);
        });

        it("should move master measure without affecting derived measure", () => {
            const [item1, item2, item3, item4] = createFourMeasures();
            const item3Derived = { ...item4, masterLocalIdentifier: item3.localIdentifier };
            state = withData(state, {
                buckets: withBucketItems(state.data.buckets, 0, [item1, item2, item3, item3Derived]),
            });
            const action = reorderBucketItem(MEASURES, item3, null, 0);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toEqual([
                item3,
                item1,
                item2,
                item3Derived,
            ]);
        });

        it("should move derived measure without affecting master measure", () => {
            const [item1, item2, item3, item4] = createFourMeasures();
            const item2Derived = { ...item4, masterLocalIdentifier: item2.localIdentifier };
            state = withData(state, {
                buckets: withBucketItems(state.data.buckets, 0, [item1, item2Derived, item2, item3]),
            });
            const action = reorderBucketItem(MEASURES, item2Derived, null, 3);

            state = dispatchBucketsTrigger(state, action);

            expect(state.data.buckets?.[getBucketIndex(MEASURES)]?.items).toEqual([
                item1,
                item2,
                item3,
                item2Derived,
            ]);
        });
    });

    describe("EXTENDED_REFERENCE_POINT_CHANGED", () => {
        const defaultExtendedReferencePoint: IExtendedReferencePoint = {
            buckets: [],
            filters: {
                items: [],
                localIdentifier: "filters",
            },
            uiConfig: {
                buckets: {
                    MEASURES: { enabled: true, allowsReordering: false, itemsLimit: 1 },
                    VIEW: { enabled: true, allowsReordering: false, itemsLimit: 1 },
                    STACK: { enabled: false, allowsReordering: false },
                    filters: { enabled: true, allowsReordering: false },
                },
            },
        };

        const defaultAction = extendedReferencePointChanged(defaultExtendedReferencePoint);

        it("should get ui configuration from visualization and store it in extended reference point in state", () => {
            state = dispatchBucketsTrigger(state, defaultAction);

            expect(state.data.extendedReferencePoint).toEqual({
                buckets: defaultExtendedReferencePoint.buckets,
                filters: [],
                uiConfig: defaultExtendedReferencePoint.uiConfig,
            });
        });

        it("should set buckets to buckets from extended reference point", () => {
            state = dispatchBucketsTrigger(state, defaultAction);

            expect(state.data.buckets).toEqual(defaultExtendedReferencePoint.buckets);
        });

        it("should normalize geo display forms outside geo buckets", () => {
            const defaultDfRef = idRef("label.default");
            const areaDfRef = idRef("label.area");
            const locationDfRef = idRef("label.location");
            const customDfRef = idRef("label.custom");
            const displayForms = [
                {
                    ref: defaultDfRef,
                    id: "label.default",
                    type: "displayForm",
                    title: "Default label",
                    isDefault: true,
                },
            ];

            const areaItem = {
                localIdentifier: "a1",
                type: ATTRIBUTE,
                dfRef: areaDfRef,
                areaDisplayFormRef: areaDfRef,
                displayForm: areaDfRef,
                displayForms,
            };
            const locationItem = {
                localIdentifier: "a2",
                type: ATTRIBUTE,
                dfRef: locationDfRef,
                locationDisplayFormRef: locationDfRef,
                displayForm: locationDfRef,
                displayForms,
            };
            const customItem = {
                localIdentifier: "a3",
                type: ATTRIBUTE,
                dfRef: customDfRef,
                areaDisplayFormRef: areaDfRef,
                displayForm: customDfRef,
                displayForms,
            };

            const newExtendedReferencePoint: IExtendedReferencePoint = {
                ...defaultExtendedReferencePoint,
                buckets: [
                    {
                        localIdentifier: VIEW,
                        items: [areaItem, locationItem, customItem],
                    },
                ],
            };

            const action = extendedReferencePointChanged(newExtendedReferencePoint);
            state = withData(state, {
                buckets: [
                    {
                        localIdentifier: BucketNames.LOCATION,
                        items: [],
                    },
                ],
            });
            state = dispatchBucketsTrigger(state, action);

            const storedItems = state.data.buckets[0].items;
            expect(storedItems?.[0]?.dfRef).toEqual(defaultDfRef);
            expect(storedItems?.[0]?.["displayForm"]).toEqual(defaultDfRef);

            expect(storedItems?.[1]?.dfRef).toEqual(defaultDfRef);
            expect(storedItems?.[1]?.["displayForm"]).toEqual(defaultDfRef);

            expect(storedItems?.[2]?.dfRef).toEqual(customDfRef);
            expect(storedItems?.[2]?.["displayForm"]).toEqual(customDfRef);
        });

        it("should normalize pushpin and area geo labels to text labels in non-geo buckets", () => {
            const textDfRef = idRef("label.text");
            const latitudeDfRef = idRef("label.latitude");
            const areaDfRef = idRef("label.area");
            const displayForms = [
                {
                    ref: textDfRef,
                    id: "label.text",
                    type: "GDC.text",
                    title: "City name",
                    isDefault: true,
                },
                {
                    ref: latitudeDfRef,
                    id: "label.latitude",
                    type: "GDC.geo.pin_latitude",
                    title: "Latitude",
                },
                {
                    ref: areaDfRef,
                    id: "label.area",
                    type: "GDC.geo.area",
                    title: "Area",
                },
            ];

            const pushpinItem = {
                localIdentifier: "p1",
                type: ATTRIBUTE,
                dfRef: latitudeDfRef,
                locationDisplayFormRef: latitudeDfRef,
                displayForm: latitudeDfRef,
                displayForms,
            };
            const areaItem = {
                localIdentifier: "a1",
                type: ATTRIBUTE,
                dfRef: areaDfRef,
                areaDisplayFormRef: areaDfRef,
                displayForm: areaDfRef,
                displayForms,
            };

            const newExtendedReferencePoint: IExtendedReferencePoint = {
                ...defaultExtendedReferencePoint,
                buckets: [
                    {
                        localIdentifier: VIEW,
                        items: [pushpinItem, areaItem],
                    },
                ],
            };

            state = withData(state, {
                buckets: [
                    {
                        localIdentifier: BucketNames.LOCATION,
                        items: [],
                    },
                ],
            });
            state = dispatchBucketsTrigger(state, extendedReferencePointChanged(newExtendedReferencePoint));

            const storedItems = state.data.buckets[0].items;
            expect(storedItems?.[0]?.dfRef).toEqual(textDfRef);
            expect(storedItems?.[0]?.["displayForm"]).toEqual(textDfRef);
            expect(storedItems?.[1]?.dfRef).toEqual(textDfRef);
            expect(storedItems?.[1]?.["displayForm"]).toEqual(textDfRef);
        });

        it("should preserve manually selected geo display forms in non-geo buckets", () => {
            const latitudeDfRef = idRef("label.latitude");
            const areaDfRef = idRef("label.area");
            const displayForms = [
                {
                    ref: idRef("label.text"),
                    id: "label.text",
                    type: "GDC.text",
                    title: "City name",
                    isDefault: true,
                },
                {
                    ref: latitudeDfRef,
                    id: "label.latitude",
                    type: "GDC.geo.pin_latitude",
                    title: "Latitude",
                },
                {
                    ref: areaDfRef,
                    id: "label.area",
                    type: "GDC.geo.area",
                    title: "Area",
                },
            ];

            const pushpinItem = {
                localIdentifier: "p1",
                type: ATTRIBUTE,
                dfRef: latitudeDfRef,
                locationDisplayFormRef: latitudeDfRef,
                displayForm: latitudeDfRef,
                displayForms,
            };
            const areaItem = {
                localIdentifier: "a1",
                type: ATTRIBUTE,
                dfRef: areaDfRef,
                areaDisplayFormRef: areaDfRef,
                displayForm: areaDfRef,
                displayForms,
            };

            const newExtendedReferencePoint: IExtendedReferencePoint = {
                ...defaultExtendedReferencePoint,
                buckets: [
                    {
                        localIdentifier: VIEW,
                        items: [pushpinItem, areaItem],
                    },
                ],
            };

            state = withData(state, {
                buckets: [
                    {
                        localIdentifier: VIEW,
                        items: [],
                    },
                ],
            });
            state = dispatchBucketsTrigger(state, extendedReferencePointChanged(newExtendedReferencePoint));

            const storedItems = state.data.buckets[0].items;
            expect(storedItems?.[0]?.dfRef).toEqual(latitudeDfRef);
            expect(storedItems?.[1]?.dfRef).toEqual(areaDfRef);
        });

        it("should restore geo display forms in location and area buckets", () => {
            const textDfRef = idRef("label.text");
            const latitudeDfRef = idRef("label.latitude");
            const areaDfRef = idRef("label.area");
            const displayForms = [
                {
                    ref: textDfRef,
                    id: "label.text",
                    type: "GDC.text",
                    title: "City name",
                    isDefault: true,
                },
                {
                    ref: latitudeDfRef,
                    id: "label.latitude",
                    type: "GDC.geo.pin_latitude",
                    title: "Latitude",
                },
                {
                    ref: areaDfRef,
                    id: "label.area",
                    type: "GDC.geo.area",
                    title: "Area",
                },
            ];

            const locationBucketItem = {
                localIdentifier: "locationItem",
                type: ATTRIBUTE,
                dfRef: textDfRef,
                displayForm: textDfRef,
                locationDisplayFormRef: latitudeDfRef,
                displayForms,
            };
            const areaBucketItem = {
                localIdentifier: "areaItem",
                type: ATTRIBUTE,
                dfRef: textDfRef,
                displayForm: textDfRef,
                areaDisplayFormRef: areaDfRef,
                displayForms,
            };

            const newExtendedReferencePoint: IExtendedReferencePoint = {
                ...defaultExtendedReferencePoint,
                buckets: [
                    {
                        localIdentifier: BucketNames.LOCATION,
                        items: [locationBucketItem],
                    },
                    {
                        localIdentifier: BucketNames.AREA,
                        items: [areaBucketItem],
                    },
                ],
            };

            state = dispatchBucketsTrigger(state, extendedReferencePointChanged(newExtendedReferencePoint));

            const locationStoredItem = state.data.buckets[0].items[0];
            const areaStoredItem = state.data.buckets[1].items[0];
            expect(locationStoredItem.dfRef).toEqual(latitudeDfRef);
            expect(locationStoredItem["displayForm"]).toBeUndefined();
            expect(areaStoredItem.dfRef).toEqual(areaDfRef);
            expect(areaStoredItem["displayForm"]).toBeUndefined();
        });

        /**
         * The restore is GUARDED: an item already pointing at its geo display form is returned
         * UNCHANGED, so the pipeline does not rebuild it and `mapCollection` keeps the items array.
         * Asserted as IDENTITY against the object the plug-viz answer carried — `toEqual` passes on
         * a lost identity, which is the failure mode here.
         *
         * Scope: this does NOT make the dispatch a no-op. `sanitizeFormats` rebuilds every BUCKET
         * object on every answer (`{...bucket, items}`), so `extendedReferencePoint.buckets` and
         * `data.buckets` still take a new value each time. What the guard removes is the ITEM-level
         * allocation.
         */
        it("returns an already-restored geo item UNCHANGED, by identity", () => {
            const areaDfRef = idRef("label.area");
            const areaBucketItem = {
                localIdentifier: "areaItem",
                type: ATTRIBUTE,
                // already pointing at the geo display form, and no `displayForm` to strip
                dfRef: areaDfRef,
                areaDisplayFormRef: areaDfRef,
                displayForms: [{ ref: areaDfRef, id: "label.area", type: "GDC.geo.area", title: "Area" }],
            };
            const newExtendedReferencePoint: IExtendedReferencePoint = {
                ...defaultExtendedReferencePoint,
                buckets: [{ localIdentifier: BucketNames.AREA, items: [areaBucketItem] }],
            };

            const next = dispatchBucketsTrigger(
                state,
                extendedReferencePointChanged(newExtendedReferencePoint),
            );

            // the premise: the restore had nothing to do (the item already points at the geo df)
            const storedItem = next.data.buckets[0].items[0];
            expect(storedItem.dfRef).toEqual(areaDfRef);
            expect(storedItem["displayForm"]).toBeUndefined();

            // …so the stored item is the very object the answer carried, not a rebuilt copy
            expect(storedItem).toBe(areaBucketItem);
        });

        describe("changing format when Show in % has been changed by the visualization", () => {
            const mockAttribute: ICatalogAttribute = {
                attribute: {
                    description: "",
                    production: true,
                    title: "Activity",
                    id: "identifier1",
                    ref: { identifier: "identifier1" },
                    type: "attribute",
                    uri: "activityUri",
                    deprecated: false,
                    unlisted: false,
                    displayForms: [
                        {
                            attribute: { identifier: "identifier1" },
                            description: "",
                            ref: { identifier: "label.activity" },
                            id: "identifier1",
                            production: true,
                            title: "Activity",
                            uri: "activityDfUri",
                            type: "displayForm",
                            deprecated: false,
                            unlisted: false,
                        },
                    ],
                },
                groups: [],
                geoPinDisplayForms: [],
                defaultDisplayForm: {
                    attribute: { identifier: "identifier1" },
                    description: "",
                    ref: { identifier: "label.activity" },
                    id: "identifier1",
                    production: true,
                    title: "Activity",
                    uri: "activityDfUri",
                    type: "displayForm",
                    deprecated: false,
                    unlisted: false,
                },
                displayForms: [
                    {
                        attribute: { identifier: "identifier1" },
                        description: "",
                        ref: { identifier: "label.activity" },
                        id: "identifier1",
                        production: true,
                        title: "Activity",
                        uri: "activityDfUri",
                        type: "displayForm",
                        deprecated: false,
                        unlisted: false,
                    },
                ],
                type: "attribute",
            };

            const mockFact: ICatalogFact = {
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
            };

            const mockMeasure: ICatalogMeasure = {
                measure: {
                    type: "measure",
                    id: "identifier1",
                    ref: idRef("identifier1"),
                    title: "Measure",
                    uri: "uri1",
                    format: "catalogItemFormat#",
                    deprecated: false,
                    description: "",
                    expression: "",
                    production: true,
                    unlisted: false,
                },
                groups: [],
                type: "measure",
            };

            const mockByType: { [type: string]: CatalogItem } = {
                [ATTRIBUTE]: mockAttribute,
                [FACT]: mockFact,
                [METRIC]: mockMeasure,
            };

            it.each`
                catalogItemType | originalFormat               | expectedFormat
                ${ATTRIBUTE}    | ${null}                      | ${DEFAULT_INTEGER_FORMAT}
                ${ATTRIBUTE}    | ${"some%"}                   | ${"some%"}
                ${ATTRIBUTE}    | ${DEFAULT_PERCENTAGE_FORMAT} | ${DEFAULT_INTEGER_FORMAT}
                ${FACT}         | ${null}                      | ${DEFAULT_DECIMAL_FORMAT}
                ${FACT}         | ${"some%"}                   | ${"some%"}
                ${FACT}         | ${DEFAULT_DECIMAL_FORMAT}    | ${DEFAULT_DECIMAL_FORMAT}
                ${METRIC}       | ${null}                      | ${null}
                ${METRIC}       | ${"some%"}                   | ${"some%"}
            `(
                "should set format from $originalFormat to $expectedFormat when showInPercent have been disabled and the catalog item type is $catalogItemType and custom formatting is $customFormatting",
                ({ catalogItemType, originalFormat, expectedFormat }) => {
                    const measure = createBucketItem("identifier1", {
                        type: METRIC,
                        showInPercent: true,
                        format: originalFormat,
                        localIdentifier: "m1",
                    });

                    addBucketItemToReferencePoint(MEASURES, measure);

                    const newExtendedReferencePoint: IExtendedReferencePoint = {
                        ...defaultExtendedReferencePoint,
                        buckets: [
                            {
                                localIdentifier: "measures",
                                items: [
                                    {
                                        localIdentifier: measure.localIdentifier,
                                        attribute: measure.attribute,
                                        type: measure.type,
                                        format: measure.format,
                                        filters: [],
                                        showInPercent: null,
                                    },
                                ],
                            },
                        ],
                    };
                    const setCatalogItemsAction = setCatalogItems([mockByType[catalogItemType]]);
                    state = rootReducer(state, setCatalogItemsAction);

                    const action = extendedReferencePointChanged(newExtendedReferencePoint);
                    state = dispatchBucketsTrigger(state, action);

                    expect(state.data.buckets[0].items[0].format).toBe(expectedFormat);
                },
            );
        });
    });

    describe("NEW_DERIVED_BUCKET_ITEMS_PLACED", () => {
        it("should process new bucket items returned from pluggable visualization", () => {
            const masterMeasure1: IRawBucketItem & IBucketItem = {
                attribute: "m1",
                localIdentifier: "m1",
                filters: [],
                type: METRIC,
            };
            const masterMeasure2: IRawBucketItem & IBucketItem = {
                attribute: "m2",
                localIdentifier: "m2",
                filters: [],
                showInPercent: true,
                type: METRIC,
            };
            const derivedMeasure1: IRawBucketItem & IBucketItem = {
                attribute: "m3",
                localIdentifier: "m3",
                isDerived: true,
                masterLocalIdentifier: "m1",
                filters: [],
                showInPercent: true,
                type: METRIC,
            };

            // the fixtures are typed as BOTH the raw state item and the sdk-ui-ext bucket item they stand in for
            const referencePoint: IReferencePoint = {
                filters: { localIdentifier: "filters", items: [] },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [derivedMeasure1, masterMeasure1, masterMeasure2],
                        totals: [
                            {
                                measureIdentifier: "m1",
                                type: "avg",
                                attributeIdentifier: "a1",
                                alias: "Average",
                            },
                        ],
                    },
                    {
                        localIdentifier: "view",
                        items: [],
                    },
                    {
                        localIdentifier: "stack",
                        items: [],
                    },
                ],
            };
            state = PluggableVisualizationService.setNewDerivedBucketItems(state, [derivedMeasure1]);

            const action = newDerivedBucketItemsPlaced(referencePoint);
            state = dispatchBucketsTrigger(state, action);

            expect(PluggableVisualizationService.getNewDerivedBucketItems(state)).toHaveLength(0);
            expect(getAllBucketItems(state)?.length ?? 0).toEqual(3);
            expect(getBucketByLocalIdentifier(state, MEASURES)?.totals?.length ?? 0).toEqual(2);
            expect(getRefPointDerivedMeasures(state)?.length ?? 0).toEqual(1);
            expect(getRefPointNonDerivedMeasures(state)?.length ?? 0).toEqual(2);
        });
    });

    // SET_CONFIGURATION_PANEL_COLLAPSED moved to
    // store/configuration_panel/test/configuration_panel_store.test.ts.
});
