// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { changeMeasureChartType } from "../actions/buckets_actions.js";
import { dropCatalogItem, swapBucketItem } from "../actions/dnd_actions.js";
import { toggleDualAxis } from "../actions/properties_actions.js";
import { FILTERS, MEASURES, METRIC, SECONDARY_MEASURES, STACK, VIEW } from "../constants/bucket.js";
import { buildBucketItem } from "../models/bucket_item.js";
import { getBucketByLocalIdentifier } from "../services/buckets_service.js";
import { type IAppState } from "../store/types.js";
import { withAddedBucketItems, withBucketItems } from "../tests/buckets_builder.test.helpers.js";
import { setupAppStateWithDateDatasetMeta } from "../tests/constants.test.helpers.js";
import { dispatchBucketsTrigger } from "../tests/dispatch_buckets_trigger.test.utils.js";
import { withBucketUiConfig, withUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../typings/buckets.js";
import { type IDateDataset } from "../typings/datasets.js";
import { type ICatalogEntry } from "../typings/state_objects.js";
import { type VisualizationType } from "../typings/visualization.js";

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

    let state = withData(getInitializedState(), {
        buckets: [
            { localIdentifier: MEASURES, items: [] },
            { localIdentifier: SECONDARY_MEASURES, items: [] },
            { localIdentifier: STACK, items: [] },
            { localIdentifier: VIEW, items: [] },
        ],
    });
    state = withData(state, {
        extendedReferencePoint: {
            ...state.data.extendedReferencePoint,
            uiConfig: {
                buckets: {
                    measures: uiConfigFor(MEASURES),
                    secondary_measures: uiConfigFor(SECONDARY_MEASURES),
                    view: uiConfigFor(VIEW),
                    stack: uiConfigFor(STACK),
                    filters: uiConfigFor(FILTERS),
                },
            },
        },
    });
    // this seed is chained onto the pre-merge state
    // path, which parked it in a dead data.data… branch; seeded at its real path now
    state = withData(state, {
        extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, {
            supportedOverTimeComparisonTypes: [
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ],
        }),
    });
    state = setupAppStateWithDateDatasetMeta(state);
    function createCatalogItem(id: string, type = "fact"): ICatalogEntry {
        const item = { id, type, identifier: id, title: "" };

        state = withData(state, { itemCache: { ...state.data.itemCache, [id]: item } });

        return item;
    }

    function getBucketIndex(bucketName: string, bucketLocation: BucketsBranch = "buckets"): number {
        const buckets = readBranchBuckets(state, bucketLocation);
        return buckets.findIndex((bucket: IRawBucket) => bucket?.localIdentifier === bucketName);
    }

    function addBucket(bucketName: string, bucketLocation: BucketsBranch = "buckets"): IAppState {
        const bucket: IRawBucket = {
            localIdentifier: bucketName,
            items: [],
        };
        state = addUiConfig(bucketName);
        return writeBranchBuckets(state, bucketLocation, [
            ...(readBranchBuckets(state, bucketLocation) ?? []),
            bucket,
        ]);
    }

    function addUiConfig(bucketName: string): IAppState {
        return withData(state, {
            extendedReferencePoint: withBucketUiConfig(
                state.data.extendedReferencePoint,
                bucketName,
                uiConfigFor(bucketName),
            ),
        });
    }

    function uiConfigFor(bucketName: string) {
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
        return uiConfig;
    }

    function addBucketItem(bucketLocalIdentifier: string, bucketItem: IRawBucketItem): IRawBucketItem {
        let bucketIndex = getBucketIndex(bucketLocalIdentifier);
        if (bucketIndex < 0) {
            state = addBucket(bucketLocalIdentifier);
            // recompute: -1 over the plain buckets sub-array would write a stray "-1" property
            bucketIndex = getBucketIndex(bucketLocalIdentifier);
        }
        state = withData(state, {
            buckets: withAddedBucketItems(state.data.buckets, bucketIndex, bucketItem),
        });
        return bucketItem;
    }

    function createBucketItem(id: string, customAttributes = {}): IRawBucketItem {
        const bucketItem = buildBucketItem({
            attribute: id,
            type: "fact",
            identifier: id,
            ...customAttributes,
        });

        state = withData(state, { itemCache: { ...state.data.itemCache, [id]: bucketItem } });

        return bucketItem;
    }

    describe("BUCKETS_DND_ITEM_INSERT", () => {
        it("should update secondary measure if bucket enables secondary axis", () => {
            const catalogItem = createCatalogItem("sample_catalog_item");
            const action = dropCatalogItem(SECONDARY_MEASURES, catalogItem);
            const stateWithDateDatasetsAvailable = withData(state, {
                dateDatasets: {
                    ...state.data.dateDatasets,
                    available: // plain — the dateDatasets items flipped with their models
                        [
                            {
                                summary: "DataSet Date",
                                identifier: "activity.dataset.dt",
                                uri: "/gdc/md/gujazxmk7wuuk4cmcmqe5nebe2zclnay/obj/889",
                                ref: {
                                    uri: "/gdc/md/gujazxmk7wuuk4cmcmqe5nebe2zclnay/obj/889",
                                },
                            },
                            // a PARTIAL date dataset: the drop only reads ref/identifier
                        ] as unknown as IDateDataset[],
                },
            });
            const newState = dispatchBucketsTrigger(stateWithDateDatasetsAvailable, action);

            const buckets = newState.data.buckets;
            const bucketIndex = getBucketIndex(SECONDARY_MEASURES);

            expect(newState.data.referencePoint.buckets).toEqual(buckets);
            expect(buckets?.[bucketIndex]?.items?.[0]?.showOnSecondaryAxis).toBeTruthy();
        });
    });

    describe("BUCKETS_DND_ITEM_SWAP", () => {
        it.each([
            [MEASURES, SECONDARY_MEASURES, true],
            [SECONDARY_MEASURES, MEASURES, false],
        ])(
            "should update secondary measure if swapping item from %s bucket to %s bucket",
            (fromBucket: string, toBucket: string, expected: boolean) => {
                state = withData(state, {
                    buckets: withBucketItems(state.data.buckets, getBucketIndex(toBucket), []),
                });
                const item = addBucketItem(fromBucket, createBucketItem("measure1", { type: METRIC }));
                const action = swapBucketItem(toBucket, item, null);

                const newState = dispatchBucketsTrigger(state, action);

                const originalBucketItems = newState.data.buckets?.[getBucketIndex(fromBucket)]?.items;
                const targetBucketItems = newState.data.buckets?.[getBucketIndex(toBucket)]?.items;

                expect(newState.data.referencePoint.buckets).toEqual(newState.data.buckets);
                expect(originalBucketItems).toHaveLength(0);
                expect(targetBucketItems).toHaveLength(1);
                expect(targetBucketItems?.[0]?.showOnSecondaryAxis).toEqual(expected);
            },
        );
    });

    describe("BUCKET_CHANGE_CHART_TYPE", () => {
        it.each<[string, VisualizationType]>([
            [MEASURES, "column"],
            [MEASURES, "line"],
            [MEASURES, "area"],
            [SECONDARY_MEASURES, "column"],
            [SECONDARY_MEASURES, "line"],
            [SECONDARY_MEASURES, "area"],
        ])("should change chart type of %s bucket to %s type", (localIdentifier, type) => {
            const newState = dispatchBucketsTrigger(state, changeMeasureChartType(localIdentifier, type));
            const targetBucket = getBucketByLocalIdentifier(newState, localIdentifier);

            expect(targetBucket.chartType).toEqual(type);
        });
    });

    describe("BUCKET_TOGGLE_DUAL_AXIS", () => {
        function createMeasures() {
            return [
                addBucketItem(MEASURES, createBucketItem("item1")),
                addBucketItem(MEASURES, createBucketItem("item2")),
                addBucketItem(SECONDARY_MEASURES, createBucketItem("item3")),
                addBucketItem(SECONDARY_MEASURES, createBucketItem("item4")),
            ];
        }

        it.each([
            [MEASURES, false],
            [SECONDARY_MEASURES, true],
        ])(
            'should update "showOnSecondaryAxis" property of each item in %s bucket to %s',
            (localIdentifier: string, value: boolean) => {
                createMeasures();
                const newState = dispatchBucketsTrigger(state, toggleDualAxis(localIdentifier, value));

                const targetBucket = getBucketByLocalIdentifier(newState, localIdentifier);
                const bucketItems = targetBucket.items ?? [];

                bucketItems.forEach((item: IRawBucketItem) => {
                    expect(item.showOnSecondaryAxis).toEqual(value);
                });
            },
        );
    });
});
