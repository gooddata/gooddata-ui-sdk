// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITotal, type TotalType, uriRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import {
    ATTRIBUTE,
    DATE,
    FACT,
    FILTERS,
    MEASURES,
    METRIC,
    SECONDARY_MEASURES,
    STACK,
    VIEW,
} from "../constants/bucket.js";
import { LOCAL_BAR } from "../constants/visualization_types.js";
import {
    buildBucketItem,
    getLocalIdentifier,
    setLocalIdentifier,
    setMasterLocalIdentifier,
} from "../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE, DATE_TYPE } from "../models/date_item.js";
import { getRemovedItems } from "../store/bucket_notifications/bucket_notifications_selector.js";
import {
    getBucketItemAddress,
    resolveBucketIndexInBuckets,
    updateBucketItemsAt,
} from "../store/buckets/bucket_item_address.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import { getAllBucketItems } from "../store/buckets/buckets_selectors.js";
import {
    areBucketsEmpty,
    containsDateBucketItem,
    containsMetricWithDateFilter,
    isOperandInArithmeticMeasure,
} from "../store/buckets/helpers/bucket_item_predicates.js";
import {
    getFilterItems,
    getRankingFilter,
    hasRankingFilter,
} from "../store/filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../store/filter_bar/filter_bar_service.js";
import { type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IExtendedRefPointUiConfig } from "../store/reference_point/extended_reference_point_state.js";
import {
    type IRefPointFiltersBucket,
    type IReferencePointState,
} from "../store/reference_point/reference_point_state.js";
import { type IAppState } from "../store/types.js";
import {
    withBucketItem,
    withBucketItems,
    withBucketTotals,
    withReplacedBucket,
} from "../tests/buckets_builder.test.helpers.js";
import {
    activityDateDataset,
    activityDateDatasetRef,
    closedDateDataset,
    closedDateDatasetRef,
    dateFilterBarItemActivity,
    setupAppStateWithDateDatasetMeta,
} from "../tests/constants.test.helpers.js";
import {
    buildDateFilterMock,
    filtersMock,
    rankingFilterWithAttributes,
    rankingFilterWithoutAttributes,
} from "../tests/filter.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withAppState, withData, withRoot } from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import {
    type IRawBucket,
    type IRawBucketItem,
    type IRawBucketItems,
    type IRawBuckets,
} from "../typings/buckets.js";
import { type IDateDataset } from "../typings/datasets.js";
import { type IBucketItem } from "../typings/metadata.js";
import { type IStoredVisualizationProperties } from "../typings/properties.js";

import {
    addTotalsEnabledForAllMeasuresToNewMeasure,
    bucketsHaveCategoriesWithDateItem,
    bucketsWereChanged,
    createArithmeticMeasure,
    createDerivedMeasure,
    findAllReferencingArithmeticMeasures,
    findDerivedBucketItems,
    findReplacedBucketItemNewInsertionIndex,
    getAttributeBucketItemsByRef,
    getBucketAcceptsItemType,
    getBucketIdentifierByItemId,
    getBucketIndex,
    getBucketItemIndex,
    getBuckets,
    getDerivedBucketItems,
    getFirstMasterMeasure,
    getMasterMeasures,
    getPrimaryDateDataset,
    getPrimaryMeasuresFromMeasureBucket,
    getSelectedOverTimeComparisonType,
    getSupportedOverTimeComparisonTypes,
    getUsedDateDatasets,
    getUsedDateDatasetsExtendedFromBuckets,
    hasDateFilterInFilterBar,
    isBucketAllowShowOnSecondaryAxis,
    isBucketEnabledSecondaryAxis,
    isRenamingBucketItem,
    isSelectedViewByDateOfWeekGranularity,
    isSomeDateInBuckets,
    mirrorTotalsToDerivedMeasures,
    removeAllDerivedBucketItems,
    removeDerivedBucketItems,
    removeMultipleBucketItemsWithDependencies,
    removeUneditedAttributeAndDateFilters,
    replaceDerivedMeasure,
    replaceDerivedTotalItems,
    sanitizeTotals,
    setBucketItemOverTimeComparison,
    setBucketItemsDateDataset,
    validateVisualizationProperties,
} from "./buckets_service.js";
import { bucketsForPivotTableWithTotals } from "./buckets_service.test.helpers.js";
import { PluggableVisualizationService } from "./pluggable_visualization_service.js";

/**
 * TYPED seeders for the branches this suite writes: the branch is chosen by WHICH function you call,
 * and the value is checked against that branch's real type.
 *
 * The bucket-level seeders address INSIDE a branch value (a bucket, a bucket item): the root is
 * reached by property and the place inside it by a typed bucket ADDRESS, so both halves are checked.
 */
const seedBuckets = (state: IAppState, buckets: IRawBuckets): IAppState => withData(state, { buckets });

const seedBucketsMeta = (state: IAppState, bucketsMeta: IBucketsMetaState): IAppState =>
    withData(state, { bucketsMeta });

const seedFeatureFlags = (state: IAppState, featureFlags: IAppState["featureFlags"]): IAppState =>
    withRoot(state, { featureFlags });

const seedProjectId = (state: IAppState, projectId: IAppState["projectId"]): IAppState =>
    withRoot(state, { projectId });

const seedRenamingBucketItem = (state: IAppState, renamingBucketItem: boolean): IAppState =>
    withAppState(state, { renamingBucketItem });

const seedReferencePointBuckets = (state: IAppState, buckets: IRawBuckets): IAppState =>
    withData(state, { referencePoint: { ...state.data.referencePoint, buckets } });

const seedAvailableDateDatasets = (state: IAppState, available: IDateDataset[]): IAppState =>
    withData(state, { dateDatasets: { ...state.data.dateDatasets, available } });

const withErpUiConfig = (state: IAppState, patch: Record<string, unknown>): IAppState =>
    withData(state, {
        extendedReferencePoint: {
            ...state.data.extendedReferencePoint,
            uiConfig: {
                ...state.data.extendedReferencePoint?.uiConfig,
                ...patch,
            } as IExtendedRefPointUiConfig,
        },
    });

const seedErpProperties = (state: IAppState, properties: unknown): IAppState =>
    withData(state, {
        extendedReferencePoint: {
            ...state.data.extendedReferencePoint,
            properties: properties as IStoredVisualizationProperties,
        },
    });

const seedErpUiConfigBuckets = (state: IAppState, buckets: unknown): IAppState =>
    withErpUiConfig(state, { buckets });

const seedErpSupportedComparisonTypes = (state: IAppState, types: unknown): IAppState =>
    withErpUiConfig(state, { supportedOverTimeComparisonTypes: types });

const seedDualAxis = (state: IAppState, dualAxis: unknown): IAppState =>
    withData(state, {
        visualizationProperties: {
            ...state.data.visualizationProperties,
            controls: { ...state.data.visualizationProperties.controls, dualAxis },
        },
    });

/**
 * The buckets seeders, ONE per thing a fixture here says. Each names the place in BUCKET terms and
 * takes the typed value for it, so the addressing is checked at compile time.
 */
const seedBucket = (state: IAppState, bucketIndex: number, bucket: IRawBucket): IAppState =>
    withData(state, { buckets: withReplacedBucket(state.data.buckets, bucketIndex, bucket) });

const seedBucketItems = (state: IAppState, bucketIndex: number, items: IRawBucketItems): IAppState =>
    withData(state, { buckets: withBucketItems(state.data.buckets, bucketIndex, items) });

/** The UPDATER form, separate so a callback cannot land as a value. */
const updateBucketItems = (
    state: IAppState,
    bucketIndex: number,
    updater: (items: IRawBucketItems) => IRawBucketItems,
): IAppState =>
    withData(state, {
        buckets: updateBucketItemsAt(state.data.buckets, bucketIndex, (items) => updater(items ?? [])),
    });

const seedBucketItem = (
    state: IAppState,
    bucketIndex: number,
    itemIndex: number,
    patch: Partial<IRawBucketItem>,
): IAppState =>
    withData(state, { buckets: withBucketItem(state.data.buckets, bucketIndex, itemIndex, patch) });

const seedBucketTotals = (state: IAppState, bucketIndex: number, totals: IRawBucket["totals"]): IAppState =>
    withData(state, { buckets: withBucketTotals(state.data.buckets, bucketIndex, totals) });

const seedReferencePointBucket = (state: IAppState, bucketIndex: number, bucket: IRawBucket): IAppState =>
    seedReferencePointBuckets(
        state,
        withReplacedBucket(state.data.referencePoint.buckets, bucketIndex, bucket),
    );

/** ONE bucket's drag-and-drop rules in the extended reference point's uiConfig. */
const seedErpBucketUiConfig = (
    state: IAppState,
    bucketLocalIdentifier: string,
    patch: Record<string, unknown>,
): IAppState =>
    seedErpUiConfigBuckets(state, {
        ...state.data.extendedReferencePoint?.uiConfig?.buckets,
        [bucketLocalIdentifier]: {
            ...state.data.extendedReferencePoint?.uiConfig?.buckets?.[bucketLocalIdentifier],
            ...patch,
        },
    });

function addTotals(state: IAppState, totals: ITotal[]): IAppState {
    return seedBucketTotals(state, 1, totals);
}

function getTotals(state: IAppState): ITotal[] {
    return (state.data.buckets?.[1]?.totals ?? []) as ITotal[];
}

function total(measureIdentifier: string, attributeIdentifier: string, type: TotalType): ITotal {
    return {
        measureIdentifier,
        attributeIdentifier,
        type,
    };
}

describe("Buckets service", () => {
    function getValidBucketsWithTotals(): IRawBuckets {
        return [
            {
                localIdentifier: "measures",
                items: [
                    {
                        type: "metric",
                        localIdentifier: "measure1",
                    },
                    {
                        type: "metric",
                        localIdentifier: "measure2_pop",
                        masterLocalIdentifier: "measure2",
                    },
                    {
                        type: "metric",
                        localIdentifier: "measure2",
                    },
                    {
                        type: "metric",
                        localIdentifier: "measure3",
                    },
                ],
            },
            {
                localIdentifier: "attribute",
                items: [
                    {
                        localIdentifier: "attr1",
                    },
                    {
                        localIdentifier: "attr2",
                    },
                    {
                        localIdentifier: "attr3",
                    },
                ],
                totals: [
                    {
                        measureIdentifier: "measure1",
                        type: "sum",
                        attributeIdentifier: "attr1",
                        alias: "bla",
                    },
                    {
                        measureIdentifier: "measure2_pop",
                        type: "sum",
                        attributeIdentifier: "attr1",
                        alias: "bla",
                    },
                    {
                        measureIdentifier: "measure2",
                        type: "sum",
                        attributeIdentifier: "attr1",
                        alias: "bla",
                    },
                    {
                        measureIdentifier: "measure2",
                        type: "max",
                        attributeIdentifier: "attr3",
                        alias: "subtotal",
                    },
                ],
            },
        ];
    }

    function getDateDatasetState(buckets: IRawBuckets, availableDateDatasets?: IDateDataset[]) {
        return seedAvailableDateDatasets(
            seedBuckets(getInitializedState(), buckets),
            availableDateDatasets?.length ? availableDateDatasets : [],
        );
    }

    describe("bucketsWereChanged", () => {
        it("should copy buckets to reference point", () => {
            const buckets: IRawBuckets = [{ localIdentifier: "measures", items: [] }];
            const state = seedBuckets(getInitializedState(), buckets);
            const result = bucketsWereChanged(state);

            expect(result.data.referencePoint.buckets).toEqual(state.data.buckets);
        });
    });

    describe("setBucketItemOverTimeComparison", () => {
        const measures: IBucketItem[] = [
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
        const attributes: IBucketItem[] = [
            {
                localIdentifier: "a1",
                filters: [],
                type: ATTRIBUTE,
            },
        ];
        const MEASURES_INDEX = 0;
        const ATTRIBUTE_INDEX = 1;

        function getInitialState() {
            return seedBuckets(getInitializedState(), [
                {
                    localIdentifier: MEASURES,
                    items: measures,
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ]);
        }

        function getInitialStateForTable() {
            return seedBuckets(getInitializedState(), [
                {
                    localIdentifier: MEASURES,
                    items: measures,
                },
                {
                    localIdentifier: ATTRIBUTE,
                    items: attributes,
                },
            ]);
        }

        function getMeasureItem(state: IAppState, i: number) {
            return state.data.buckets?.[MEASURES_INDEX]?.items?.[i];
        }

        function getAttributeItem(state: IAppState, i: number) {
            return state.data.buckets?.[ATTRIBUTE_INDEX]?.items?.[i];
        }

        it("should prepare new derived measures for adding by pluggable visualization", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);

            const initState = seedBucketItems(
                seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]),
                MEASURES_INDEX,
                [masterMeasureItem],
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.items).toHaveLength(1);
            expect(state.data.buckets?.[MEASURES_INDEX]?.items).toEqual([masterMeasureItem]);
            expect(PluggableVisualizationService.getNewDerivedBucketItems(state)).toEqual([
                {
                    localIdentifier: "m1_pop",
                    type: METRIC,
                    aggregation: "sum",
                    showInPercent: undefined,
                    alias: undefined,
                    attribute: "m1",
                    filters: [],
                    masterLocalIdentifier: "m1",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
            ]);
        });

        it("should remove derived measures when comparison over time disabled", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const attributeItem = getAttributeItem(getInitialStateForTable(), 0);
            const measureItem1 = getMeasureItem(getInitialStateForTable(), 0);
            const measureItem2 = getMeasureItem(getInitialStateForTable(), 1);
            let measureItem2Derived = setMasterLocalIdentifier(
                measureItem2,
                getLocalIdentifier(measureItem2),
            );
            measureItem2Derived = setLocalIdentifier(measureItem2Derived, "pop");

            const totals: ITotal[] = [
                {
                    measureIdentifier: "m1",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 1",
                },
                {
                    measureIdentifier: "m1_pop",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 2",
                },
            ];
            const initState = seedBucketTotals(
                seedBucketItems(
                    seedBucketItems(getInitialStateForTable(), ATTRIBUTE_INDEX, [date, attributeItem]),
                    MEASURES_INDEX,
                    [measureItem1, measureItem2, measureItem2Derived],
                ),
                ATTRIBUTE_INDEX,
                totals,
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                measureItem2,
                false,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.items).toHaveLength(2);
            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.totals).toHaveLength(1);
            expect(state.data.buckets?.[MEASURES_INDEX]?.items).toHaveLength(2);
        });

        it("should remove derived previous period measures when previous period is disabled", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const attributeItem = getAttributeItem(getInitialStateForTable(), 0);
            const measureItem1 = getMeasureItem(getInitialStateForTable(), 0);
            const measureItem2 = getMeasureItem(getInitialStateForTable(), 1);
            let measureItem2Derived = setMasterLocalIdentifier(
                measureItem2,
                getLocalIdentifier(measureItem2),
            );
            measureItem2Derived = setLocalIdentifier(measureItem2Derived, "pop");

            const totals: ITotal[] = [
                {
                    measureIdentifier: "m1",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 1",
                },
                {
                    measureIdentifier: "m1_pop",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 2",
                },
            ];
            const initState = seedBucketTotals(
                seedBucketItems(
                    seedBucketItems(getInitialStateForTable(), ATTRIBUTE_INDEX, [date, attributeItem]),
                    MEASURES_INDEX,
                    [measureItem1, measureItem2, measureItem2Derived],
                ),
                ATTRIBUTE_INDEX,
                totals,
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                measureItem2,
                false,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );

            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.items).toHaveLength(2);
            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.totals).toHaveLength(1);
            expect(state.data.buckets?.[MEASURES_INDEX]?.items).toHaveLength(2);
        });

        it("should replace SP derived measure with PP when PP is enabled", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);
            const previousPeriodMeasureItem = {
                localIdentifier: "m1_previous_period",
                type: METRIC,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            };

            const totals: ITotal[] = [
                {
                    measureIdentifier: "m2",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 2",
                },
            ];

            const initState = seedBucketTotals(
                seedBucketItems(seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]), MEASURES_INDEX, [
                    masterMeasureItem,
                    previousPeriodMeasureItem,
                ]),
                ATTRIBUTE_INDEX,
                totals,
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.items).toHaveLength(1);
            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.totals).toHaveLength(1);
            expect(state.data.buckets?.[MEASURES_INDEX]?.items).toEqual([
                masterMeasureItem,
                {
                    localIdentifier: "m1_pop",
                    type: METRIC,
                    aggregation: "sum",
                    showInPercent: undefined,
                    alias: undefined,
                    attribute: "m1",
                    filters: [],
                    masterLocalIdentifier: "m1",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                },
            ]);
        });

        it("should replace PP derived measure with SP when SP is enabled", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);
            const samePeriodMeasureItem: IRawBucketItem = {
                localIdentifier: "m1_pop",
                type: METRIC,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            };

            const totals: ITotal[] = [
                {
                    measureIdentifier: "m2",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 2",
                },
            ];

            const initState = seedBucketTotals(
                seedBucketItems(seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]), MEASURES_INDEX, [
                    masterMeasureItem,
                    samePeriodMeasureItem,
                ]),
                ATTRIBUTE_INDEX,
                totals,
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );

            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.items).toHaveLength(1);
            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.totals).toHaveLength(1);
            expect(state.data.buckets?.[MEASURES_INDEX]?.items).toEqual([
                masterMeasureItem,
                {
                    localIdentifier: "m1_previous_period",
                    type: METRIC,
                    aggregation: "sum",
                    showInPercent: undefined,
                    alias: undefined,
                    attribute: "m1",
                    filters: [],
                    masterLocalIdentifier: "m1",
                    overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                },
            ]);
        });

        it("should keep totals for derived measure after over time comparison type changed", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);
            const samePeriodMeasureItem: IRawBucketItem = {
                localIdentifier: "m1_pop",
                type: METRIC,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            };

            const totals: ITotal[] = [
                {
                    measureIdentifier: "m2",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 2",
                },
                {
                    measureIdentifier: "m1_pop",
                    type: "avg",
                    attributeIdentifier: "a1",
                },
            ];

            const initState = seedBucketTotals(
                seedBucketItems(seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]), MEASURES_INDEX, [
                    masterMeasureItem,
                    samePeriodMeasureItem,
                ]),
                ATTRIBUTE_INDEX,
                totals,
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );

            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.items).toHaveLength(1);
            expect(state.data.buckets?.[ATTRIBUTE_INDEX]?.totals).toEqual([
                {
                    measureIdentifier: "m2",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 2",
                },
                {
                    measureIdentifier: "m1_previous_period",
                    type: "avg",
                    attributeIdentifier: "a1",
                },
            ]);
            expect(state.data.buckets?.[MEASURES_INDEX]?.items).toEqual([
                masterMeasureItem,
                {
                    localIdentifier: "m1_previous_period",
                    type: METRIC,
                    aggregation: "sum",
                    showInPercent: undefined,
                    alias: undefined,
                    attribute: "m1",
                    filters: [],
                    masterLocalIdentifier: "m1",
                    overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                },
            ]);
        });

        it("should return the same state when derived item is of the same type as target comparison type", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);
            const samePeriodMeasureItem: IRawBucketItem = {
                aggregation: "sum",
                showInPercent: undefined,
                showOnSecondaryAxis: undefined,
                alias: undefined,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                localIdentifier: "m1_pop",
                type: METRIC,
                filters: [],
                attribute: "m1",
            };

            const totals: ITotal[] = [
                {
                    measureIdentifier: "m2",
                    type: "sum",
                    attributeIdentifier: "a1",
                    alias: "total sum 2",
                },
                {
                    type: "avg",
                    measureIdentifier: "m1_pop",
                    attributeIdentifier: "a1",
                },
            ];

            const initState = seedBucketTotals(
                seedBucketItems(seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]), MEASURES_INDEX, [
                    masterMeasureItem,
                    samePeriodMeasureItem,
                ]),
                ATTRIBUTE_INDEX,
                totals,
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            expect(state).toEqual(initState);
        });

        it("should remove arithmetic measures dependant on derived measures when disabling compare", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);
            const samePeriodMeasureItem: IRawBucketItem = {
                aggregation: "sum",
                showInPercent: undefined,
                showOnSecondaryAxis: undefined,
                alias: undefined,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                localIdentifier: "m1_pop",
                type: METRIC,
                filters: [],
                attribute: "m1",
            };
            const arithmeticMeasure = {
                localIdentifier: "am1",
                operandLocalIdentifiers: ["m1_pop", "m1_pop"],
            };

            const initState = seedBucketItems(
                seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]),
                MEASURES_INDEX,
                [masterMeasureItem, samePeriodMeasureItem, arithmeticMeasure],
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            const newState = setBucketItemOverTimeComparison(
                state,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.NOTHING,
            );

            expect(newState.data.buckets?.[MEASURES_INDEX]?.items).toEqual([masterMeasureItem]);
        });

        it("should remove arithmetic measures dependant on disabled derived measures", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);
            const samePeriodMeasureItem: IRawBucketItem = {
                aggregation: "sum",
                showInPercent: undefined,
                showOnSecondaryAxis: undefined,
                alias: undefined,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                localIdentifier: "m1_pop",
                type: METRIC,
                filters: [],
                attribute: "m1",
            };
            const arithmeticMeasure = {
                localIdentifier: "am1",
                operandLocalIdentifiers: ["m1_pop", "m1_pop"],
            };

            const initState = seedBucketItems(
                seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]),
                MEASURES_INDEX,
                [masterMeasureItem, samePeriodMeasureItem, arithmeticMeasure],
            );

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            const newState = setBucketItemOverTimeComparison(
                state,
                masterMeasureItem,
                false,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            expect(newState.data.buckets?.[MEASURES_INDEX]?.items).toEqual([masterMeasureItem]);
        });

        it("should remove arithmetic measures dependant on derived measures when changing comparison type and keep totals", () => {
            const initBuckets = bucketsForPivotTableWithTotals;

            const initState = seedBuckets(getInitialState(), initBuckets);

            const newState = setBucketItemOverTimeComparison(
                initState,
                initBuckets[0].items[0],
                true,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );

            const expectedBuckets = [
                {
                    localIdentifier: "measures",
                    items: [
                        initBuckets[0].items[0],
                        {
                            ...initBuckets[0].items[1],
                            overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                            localIdentifier: "m1_previous_period",
                        },
                    ],
                },
                {
                    localIdentifier: "attribute",
                    items: initBuckets[1].items,
                    totals: [
                        initBuckets[1].totals[0],
                        {
                            ...initBuckets[1].totals[1],
                            measureIdentifier: "m1_previous_period",
                        },
                        initBuckets[1].totals[3],
                        {
                            ...initBuckets[1].totals[4],
                            measureIdentifier: "m1_previous_period",
                        },
                    ],
                },
                initBuckets[2],
            ];
            const currentBuckets = getBuckets(newState);
            expect(currentBuckets).toEqual(expectedBuckets);
        });

        it("should not remove arithmetic measures dependant on derived measures when not changing comparison type", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE };
            const m1 = getMeasureItem(getInitialState(), 0);
            const dm1: IRawBucketItem = {
                aggregation: "sum",
                showInPercent: undefined,
                showOnSecondaryAxis: undefined,
                alias: undefined,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                localIdentifier: "m1_pop",
                type: METRIC,
                filters: [],
                attribute: "m1",
            };
            const am1 = {
                localIdentifier: "am1",
                operandLocalIdentifiers: ["m1_pop", "m1_pop"],
            };

            const initState = seedBucketItems(
                seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]),
                MEASURES_INDEX,
                [m1, dm1, am1],
            );

            const newState = setBucketItemOverTimeComparison(
                initState,
                m1,
                true,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            expect(newState.data.buckets?.[MEASURES_INDEX]?.items).toEqual([m1, dm1, am1]);
        });

        it("should keep ranking filter for derived measure after over time comparison type changed", () => {
            const date = { attribute: DATE_DATASET_ATTRIBUTE, type: DATE };
            const masterMeasureItem = getMeasureItem(getInitialState(), 0);
            const samePeriodMeasureItem: IRawBucketItem = {
                localIdentifier: "m1_pop",
                type: METRIC,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            };

            let initState = seedBucketItems(
                seedBucketItems(getInitialState(), ATTRIBUTE_INDEX, [date]),
                MEASURES_INDEX,
                [masterMeasureItem, samePeriodMeasureItem],
            );

            initState = FilterBarService.addFilter(initState, {
                ...rankingFilterWithoutAttributes,
                measureLocalIdentifier: "m1_pop",
            });

            const state = setBucketItemOverTimeComparison(
                initState,
                masterMeasureItem,
                true,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );

            expect(getRankingFilter(state).measureLocalIdentifier).toEqual("m1_previous_period");
        });
    });

    describe("sanitizeTotals - works just for totals in the attribute dimension", () => {
        function testUpdateTotals(
            measures: string[],
            previousRowAttributes: string[],
            actualRowAttributes: string[],
            totals: ITotal[],
            expectedTotals: ITotal[],
        ) {
            const state = seedBuckets(getInitializedState(), getValidBucketsWithTotals());

            const updatedState = sanitizeTotals(
                seedBuckets(state, [
                    {
                        localIdentifier: "attribute",
                        items: previousRowAttributes ? bucketItems("attribute", previousRowAttributes) : [],
                    },
                ]),
                seedBuckets(state, [
                    {
                        localIdentifier: "measures",
                        items: bucketItems("metric", measures),
                    },
                    {
                        localIdentifier: "attribute",
                        items: bucketItems("attribute", actualRowAttributes),
                        totals,
                    },
                ]),
            );

            const updatedTotals = updatedState.data.buckets?.[1]?.totals;
            expect(updatedTotals).toEqual(expectedTotals);
        }

        function bucketItems(type: string, localIdentifiers: string[]): IBucketItem[] {
            return localIdentifiers.map((localIdentifier: string): IBucketItem => ({
                localIdentifier,
                type,
                filters: [],
            }));
        }

        function total(attributeIdentifier: string, measureIdentifier: string, type: TotalType): ITotal {
            return {
                attributeIdentifier,
                measureIdentifier,
                type,
            };
        }

        describe("Totals are removed when referenced bucket items are removed", () => {
            it("should return empty totals for initial state", () => {
                const state = seedBuckets(getInitializedState(), getValidBucketsWithTotals());

                const buckets: IRawBuckets = [
                    {
                        localIdentifier: "measures",
                        items: [],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [],
                    },
                ];

                const updatedState = sanitizeTotals(seedBuckets(state, buckets), seedBuckets(state, buckets));

                expect(updatedState.data.buckets?.[1]?.totals).toBeUndefined();
            });

            it("should remove all totals when all row attributes were removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    [],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    undefined,
                );
            });

            it("should remove all subtotals when grand total and next subtotal attributes are removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a3", "m1", "sum")],
                );
            });

            it("should remove totals when referenced attributes are removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                );
            });

            it("should remove all totals when all measures are removed", () => {
                testUpdateTotals(
                    [],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a3"],
                    [
                        total("a1", "m1", "sum"),
                        total("a1", "m2", "avg"),
                        total("a2", "m2", "min"),
                        total("a3", "m1", "max"),
                    ],
                    undefined,
                );
            });

            it("should remove totals when referenced measures are removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a3"],
                    [
                        total("a1", "m1", "sum"),
                        total("a1", "m2", "avg"),
                        total("a2", "m2", "min"),
                        total("a3", "m1", "max"),
                    ],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                );
            });
        });

        describe("Only a grand total is defined", () => {
            it("should return expected totals when totals were added for the first time", () => {
                testUpdateTotals(
                    ["m1"],
                    [],
                    ["a1", "a2", "a3"],
                    [total("a1", "m1", "sum")],
                    [total("a1", "m1", "sum")],
                );
            });

            it("should return expected totals when new attribute is added as the first one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a4", "a1", "a2", "a3"],
                    [total("a1", "m1", "sum")],
                    [total("a4", "m1", "sum")],
                );
            });

            it("should return expected totals when new attribute is added as the second one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a1", "m1", "sum")],
                    [total("a1", "m1", "sum")],
                );
            });

            it("should return expected totals when the first attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3"],
                    [total("a1", "m1", "sum")],
                    [total("a2", "m1", "sum")],
                );
            });

            it("should return expected totals when the second attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3"],
                    [total("a1", "m1", "sum")],
                    [total("a1", "m1", "sum")],
                );
            });

            it("should return expected totals when the first attribute is moved to the second place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a1", "a3"],
                    [total("a1", "m1", "sum")],
                    [total("a2", "m1", "sum")],
                );
            });

            it("should return expected totals when the last attribute is moved to the first place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3", "a1", "a2"],
                    [total("a1", "m1", "sum")],
                    [total("a3", "m1", "sum")],
                );
            });
        });

        describe("Grand total and subtotal for the first attribute is defined", () => {
            it("should return expected totals when totals were added for the first time", () => {
                testUpdateTotals(
                    ["m1"],
                    [],
                    ["a1", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when new attribute is added as the first one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a4", "a1", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a4", "m1", "sum"), total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when new attribute is added as the second one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a1", "m1", "sum"), total("a4", "m1", "min")],
                );
            });

            it("should return expected totals when new attribute is added as the third one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a4", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a2", "m1", "sum")],
                );
            });

            it("should return expected totals when the second attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a1", "m1", "sum"), total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the third attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is moved to the second place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a1", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a2", "m1", "sum"), total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3", "a1"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a2", "m1", "sum")],
                );
            });

            it("should return expected totals when the second attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3", "a2"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a1", "m1", "sum"), total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the last attribute is moved to the first place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3", "a1", "a2"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                    [total("a3", "m1", "sum"), total("a2", "m1", "min")],
                );
            });
        });

        describe("Grand total and subtotal for the second attribute is defined", () => {
            it("should return expected totals when new attribute is added as the first one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a4", "a1", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a4", "m1", "sum"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the second one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the third one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a4", "a3"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a4", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the last one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a3", "a4"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a2", "m1", "sum"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum")],
                );
            });

            it("should return expected totals when the third attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum")],
                );
            });

            it("should return expected totals when the first attribute is moved to the second place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a1", "a3"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a2", "m1", "sum"), total("a1", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3", "a1"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a2", "m1", "sum"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3", "a2"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum")],
                );
            });

            it("should return expected totals when the last attribute is moved to the first place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3", "a1", "a2"],
                    [total("a1", "m1", "sum"), total("a3", "m1", "max")],
                    [total("a3", "m1", "sum")],
                );
            });
        });

        describe("Grand total and subtotals for the second and the third attribute is defined", () => {
            it("should return expected totals when new attribute is added as the first one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a4", "a1", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a4", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the second one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a4", "m1", "min"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the third one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a4", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a4", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the last one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a3", "a4"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "sum"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the third attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is moved to the second place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a1", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "sum"), total("a3", "m1", "min"), total("a1", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3", "a1"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "sum"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3", "a2"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the last attribute is moved to the first place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3", "a1", "a2"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a3", "m1", "sum"), total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when the attribute is inserted after the 'within attribute'", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a1", "m1", "sum"), total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a1", "m1", "sum"), total("a4", "m1", "min"), total("a3", "m1", "max")],
                );
            });
        });

        describe("Only a subtotal for the first attribute is defined", () => {
            it("should return expected totals when new attribute is added as the first one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a4", "a1", "a2", "a3"],
                    [total("a2", "m1", "min")],
                    [total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when new attribute is added as the second one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a2", "m1", "min")],
                    [total("a4", "m1", "min")],
                );
            });

            it("should return expected totals when new attribute is added as the third one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a4", "a3"],
                    [total("a2", "m1", "min")],
                    [total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3"],
                    [total("a2", "m1", "min")],
                    undefined,
                );
            });

            it("should return expected totals when the second attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3"],
                    [total("a2", "m1", "min")],
                    [total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the third attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2"],
                    [total("a2", "m1", "min")],
                    [total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is moved to the second place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a1", "a3"],
                    [total("a2", "m1", "min")],
                    [total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3", "a1"],
                    [total("a2", "m1", "min")],
                    undefined,
                );
            });

            it("should return expected totals when the second attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3", "a2"],
                    [total("a2", "m1", "min")],
                    [total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the last attribute is moved to the first place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3", "a1", "a2"],
                    [total("a2", "m1", "min")],
                    [total("a2", "m1", "min")],
                );
            });
        });

        describe("Only a subtotal for the second attribute is defined", () => {
            it("should return expected totals when new attribute is added as the first one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a4", "a1", "a2", "a3"],
                    [total("a3", "m1", "max")],
                    [total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the second one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a3", "m1", "max")],
                    [total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the third one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a4", "a3"],
                    [total("a3", "m1", "max")],
                    [total("a4", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the last one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a3", "a4"],
                    [total("a3", "m1", "max")],
                    [total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3"],
                    [total("a3", "m1", "max")],
                    [total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3"],
                    [total("a3", "m1", "max")],
                    undefined,
                );
            });

            it("should return expected totals when the third attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2"],
                    [total("a3", "m1", "max")],
                    undefined,
                );
            });

            it("should return expected totals when the first attribute is moved to the second place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a1", "a3"],
                    [total("a3", "m1", "max")],
                    [total("a1", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3", "a1"],
                    [total("a3", "m1", "max")],
                    [total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3", "a2"],
                    [total("a3", "m1", "max")],
                    undefined,
                );
            });

            it("should return expected totals when the last attribute is moved to the first place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3", "a1", "a2"],
                    [total("a3", "m1", "max")],
                    undefined,
                );
            });
        });

        describe("Subtotals for the second and the third attribute is defined", () => {
            it("should return expected totals when new attribute is added as the first one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a4", "a1", "a2", "a3"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the second one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a4", "a2", "a3"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a4", "m1", "min"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the third one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a4", "a3"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "min"), total("a4", "m1", "max")],
                );
            });

            it("should return expected totals when new attribute is added as the last one", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2", "a3", "a4"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the third attribute is removed", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a2"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "min")],
                );
            });

            it("should return expected totals when the first attribute is moved to the second place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a1", "a3"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a3", "m1", "min"), total("a1", "m1", "max")],
                );
            });

            it("should return expected totals when the first attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a2", "a3", "a1"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a3", "m1", "max")],
                );
            });

            it("should return expected totals when the second attribute is moved to the last place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a1", "a3", "a2"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a3", "m1", "min")],
                );
            });

            it("should return expected totals when the last attribute is moved to the first place", () => {
                testUpdateTotals(
                    ["m1"],
                    ["a1", "a2", "a3"],
                    ["a3", "a1", "a2"],
                    [total("a2", "m1", "min"), total("a3", "m1", "max")],
                    [total("a2", "m1", "min")],
                );
            });
        });
    });

    describe("mirrorTotalsToDerivedMeasures - add corresponding totals to derived measures", () => {
        function addDerivedMeasureItem(currentState: IAppState) {
            const measureItems = currentState.data.buckets?.[0]?.items;
            const firstMeasure = measureItems[0];
            let derivedMeasureItem = setMasterLocalIdentifier(firstMeasure, getLocalIdentifier(firstMeasure));
            derivedMeasureItem = setLocalIdentifier(derivedMeasureItem, "measure1_pop");
            return seedBucketItems(currentState, 0, [...measureItems, derivedMeasureItem]);
        }

        it("should duplicate totals from original measure to derived measure", () => {
            let state = seedBuckets(getInitializedState(), getValidBucketsWithTotals());
            state = addDerivedMeasureItem(state);
            const firstMeasure = state.data.buckets?.[0]?.items?.[0];

            const mirroredTotalsState = mirrorTotalsToDerivedMeasures(state, firstMeasure);

            expect(mirroredTotalsState.data.buckets?.[1]?.totals).toEqual([
                {
                    // new element
                    measureIdentifier: "measure1_pop",
                    type: "sum",
                    attributeIdentifier: "attr1",
                    alias: "bla",
                },
                {
                    measureIdentifier: "measure1",
                    type: "sum",
                    attributeIdentifier: "attr1",
                    alias: "bla",
                },
                {
                    measureIdentifier: "measure2_pop",
                    type: "sum",
                    attributeIdentifier: "attr1",
                    alias: "bla",
                },
                {
                    measureIdentifier: "measure2",
                    type: "sum",
                    attributeIdentifier: "attr1",
                    alias: "bla",
                },
                {
                    measureIdentifier: "measure2",
                    type: "max",
                    attributeIdentifier: "attr3",
                    alias: "subtotal",
                },
            ]);
        });
    });

    describe("validateVisualizationProperties", () => {
        it("should remove redundant attribute sort items", () => {
            const state = seedBuckets(
                seedErpProperties(getInitializedState(), {
                    sortItems: [
                        {
                            attributeSortItem: {
                                attributeIdentifier: "ident_a",
                                direction: "desc",
                            },
                        },
                        {
                            attributeSortItem: {
                                attributeIdentifier: "ident_a2",
                                direction: "desc",
                            },
                        },
                    ],
                }),
                [
                    {
                        localIdentifier: "attributes",
                        items: [
                            {
                                localIdentifier: "ident_a2",
                            },
                        ],
                    },
                ],
            );

            const validatedState = validateVisualizationProperties(state);

            expect(validatedState.data.extendedReferencePoint.properties).toEqual({
                sortItems: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "ident_a2",
                            direction: "desc",
                        },
                    },
                ],
            });
        });

        it("should remove redundant measure sort items", () => {
            const state = seedBuckets(
                seedErpProperties(getInitializedState(), {
                    sortItems: [
                        {
                            measureSortItem: {
                                direction: "desc",
                                locators: [
                                    {
                                        measureLocatorItem: {
                                            measureIdentifier: "ident_m",
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            attributeSortItem: {
                                attributeIdentifier: "ident_a2",
                                direction: "desc",
                            },
                        },
                    ],
                }),
                [
                    {
                        localIdentifier: "attributes",
                        items: [
                            {
                                localIdentifier: "ident_a2",
                            },
                        ],
                    },
                ],
            );

            const validatedState = validateVisualizationProperties(state);

            expect(validatedState.data.extendedReferencePoint.properties).toEqual({
                sortItems: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "ident_a2",
                            direction: "desc",
                        },
                    },
                ],
            });
        });
    });

    describe("resolveBucketIndexInBuckets", () => {
        it("should resolve the index of the bucket an edit addresses", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);

            // the addressing is VALUE-level: an index into the buckets array, not a root path
            expect(resolveBucketIndexInBuckets(state.data.buckets, SECONDARY_MEASURES)).toBe(1);
        });
    });

    describe("getBucketItemIndex", () => {
        it("should return tuple object with index of bucket item and item it self", () => {
            const bucketItem = {
                localIdentifier: "m2",
            };
            const measuresBucket = {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1",
                    },
                ],
            };
            const secondaryMeasuresBucket = {
                localIdentifier: SECONDARY_MEASURES,
                items: [
                    bucketItem,
                    {
                        localIdentifier: "m3",
                    },
                ],
            };
            const buckets = [measuresBucket, secondaryMeasuresBucket];
            const state = seedBuckets(getInitializedState(), buckets);

            const { bucket, index } = getBucketItemIndex(state, "m2");
            expect(bucket).toEqual(secondaryMeasuresBucket);
            expect(index).toEqual(0);
        });
    });

    describe("getBucketItemAddress", () => {
        it("should answer where an item sits across the buckets", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);
            expect(getBucketItemAddress(state.data.buckets, { localIdentifier: "m3" })).toEqual({
                bucketIndex: 1,
                itemIndex: 1,
            });
        });
    });

    describe("findDerivedBucketItems", () => {
        it("should return empty array when no derived bucket items are found", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);
            const derivedBucketItems = findDerivedBucketItems(state, { localIdentifier: "m1" });

            expect(derivedBucketItems).toHaveLength(0);
        });

        it("should find derived bucket items across all buckets", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                            masterLocalIdentifier: "m2",
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            localIdentifier: "m4",
                            masterLocalIdentifier: "m2",
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);
            const derivedBucketItems = findDerivedBucketItems(state, { localIdentifier: "m2" });

            const expectedDerivedBucketItems = [
                {
                    localIdentifier: "m1",
                    masterLocalIdentifier: "m2",
                },
                {
                    localIdentifier: "m4",
                    masterLocalIdentifier: "m2",
                },
            ];
            expect(derivedBucketItems).toEqual(expectedDerivedBucketItems);
        });
    });

    describe("getDerivedBucketItems", () => {
        it("should get all derived bucket items across all buckets", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                            masterLocalIdentifier: "m2",
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            localIdentifier: "m4",
                            masterLocalIdentifier: "m3",
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);
            const derivedBucketItems = getDerivedBucketItems(state);

            const expectedDerivedBucketItems = [
                {
                    localIdentifier: "m1",
                    masterLocalIdentifier: "m2",
                },
                {
                    localIdentifier: "m4",
                    masterLocalIdentifier: "m3",
                },
            ];
            expect(derivedBucketItems).toEqual(expectedDerivedBucketItems);
        });

        it("should return empty array where derived bucket items not found", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);
            const derivedBucketItems = getDerivedBucketItems(state);
            expect(derivedBucketItems).toHaveLength(0);
        });
    });

    describe("getMasterMeasures", () => {
        it("should get all master measures across all buckets", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                            masterLocalIdentifier: "m2",
                            type: METRIC,
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                            type: METRIC,
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            localIdentifier: "attr1",
                            type: ATTRIBUTE,
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);
            const derivedBucketItems = getMasterMeasures(state);

            const expectedMasterMeasures = [
                {
                    localIdentifier: "m2",
                    type: METRIC,
                },
            ];
            expect(derivedBucketItems).toEqual(expectedMasterMeasures);
        });

        it("should return empty array when no master measures were found", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            localIdentifier: "attr1",
                            type: ATTRIBUTE,
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);
            const derivedBucketItems = getMasterMeasures(state);
            expect(derivedBucketItems).toHaveLength(0);
        });
    });

    describe("removeDerivedBucketItems", () => {
        it("should NOT fail when no derived bucket items exist", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);

            const updatedState = removeDerivedBucketItems(state, { localIdentifier: "m2" });

            const updatedBuckets = updatedState.data.buckets;
            expect(updatedBuckets).toEqual(buckets);
        });

        it("should find and remove all derived bucket items based on master bucket item", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                            masterLocalIdentifier: "m2",
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            localIdentifier: "m4",
                            masterLocalIdentifier: "m2",
                        },
                    ],
                },
            ];
            let state = seedBuckets(getInitializedState(), buckets);
            state = removeDerivedBucketItems(state, { localIdentifier: "m2" });

            const expectedBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ];
            const updatedBuckets = state.data.buckets;
            expect(updatedBuckets).toEqual(expectedBuckets);
        });
    });

    describe("removeAllDerivedBucketItems", () => {
        it("should remove all derived bucket items across all buckets", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "m1",
                            masterLocalIdentifier: "m2",
                        },
                    ],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            localIdentifier: "m4",
                            masterLocalIdentifier: "m3",
                        },
                    ],
                },
            ];
            let state = seedBuckets(getInitializedState(), buckets);

            state = removeAllDerivedBucketItems(state);

            const currentBuckets = state.data.buckets;
            const expectedBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ];
            expect(currentBuckets).toEqual(expectedBuckets);
        });

        it("should not change bucket items when derived bucket items are not present", () => {
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m2",
                        },
                        {
                            localIdentifier: "m3",
                        },
                    ],
                },
            ];
            const state = seedBuckets(getInitializedState(), buckets);

            const currentState = removeAllDerivedBucketItems(state);

            const currentBuckets = currentState.data.buckets;
            expect(currentBuckets).toEqual(buckets);
        });
    });

    describe("getSelectedOverTimeComparisonType", () => {
        const defaultState = seedErpSupportedComparisonTypes(getInitializedState(), [
            OverTimeComparisonTypes.NOTHING,
            OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            OverTimeComparisonTypes.PREVIOUS_PERIOD,
        ]);

        it("should return default type when no measure present in buckets", () => {
            const types = getSelectedOverTimeComparisonType(defaultState);

            expect(types).toEqual(OverTimeComparisonTypes.NOTHING);
        });

        it("should return default type when no derived measures present in buckets", () => {
            const state = seedReferencePointBucket(defaultState, 0, {
                localIdentifier: MEASURES,
                items: [
                    {
                        type: METRIC,
                        foo: "bar",
                    },
                ],
            });
            const types = getSelectedOverTimeComparisonType(state);

            expect(types).toEqual(OverTimeComparisonTypes.NOTHING);
        });

        it("should return SP if first derived measures in buckets is PoP measure definition", () => {
            const state = seedBucket(
                seedReferencePointBucket(defaultState, 0, {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            type: METRIC,
                            masterLocalIdentifier: "masterLocalIdentifier",
                            localIdentifier: "localIdentifier",
                            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                        },
                    ],
                }),
                0,
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "masterLocalIdentifier",
                            type: METRIC,
                            aggregation: "sum",
                            attribute: "m1",
                            filters: [],
                        },
                    ],
                },
            );

            const types = getSelectedOverTimeComparisonType(state);

            expect(types).toEqual(OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);
        });

        it("should return PP if first derived measures in buckets is previous period measure definition", () => {
            const state = seedBucket(
                seedFeatureFlags(
                    seedReferencePointBucket(defaultState, 0, {
                        localIdentifier: MEASURES,
                        items: [
                            {
                                type: METRIC,
                                masterLocalIdentifier: "masterLocalIdentifier",
                                localIdentifier: "localIdentifier",
                                overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                            },
                        ],
                    }),
                    { enableInsightOverTimeR2: true },
                ),
                0,
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            localIdentifier: "masterLocalIdentifier",
                            type: METRIC,
                            aggregation: "sum",
                            attribute: "m1",
                            filters: [],
                        },
                    ],
                },
            );

            const types = getSelectedOverTimeComparisonType(state);

            expect(types).toEqual(OverTimeComparisonTypes.PREVIOUS_PERIOD);
        });

        it("should return NOTHING if there is not any master measure for derived measure in buckets", () => {
            const state = seedReferencePointBucket(defaultState, 0, {
                localIdentifier: MEASURES,
                items: [
                    {
                        type: METRIC,
                        masterLocalIdentifier: "masterLocalIdentifier",
                        localIdentifier: "localIdentifier",
                        overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    },
                ],
            });

            const types = getSelectedOverTimeComparisonType(state);

            expect(types).toEqual(OverTimeComparisonTypes.NOTHING);
        });
    });

    describe("isSelectedViewByDateOfWeekGranularity", () => {
        it("should return false when buckets are empty", () => {
            const week = isSelectedViewByDateOfWeekGranularity(getInitializedState());

            expect(week).toBeFalsy();
        });

        it("should return false when some attribute with date filter and year granularity present", () => {
            const state = seedBucket(getInitializedState(), 0, {
                localIdentifier: MEASURES,
                items: [
                    {
                        type: ATTRIBUTE,
                        granularity: "GDC.time.year",
                    },
                ],
            });
            const week = isSelectedViewByDateOfWeekGranularity(state);

            expect(week).toBeFalsy();
        });

        it("should return true when some attribute with date filter and week granularity present", () => {
            const state = seedBucket(getInitializedState(), 0, {
                localIdentifier: MEASURES,
                items: [
                    {
                        type: ATTRIBUTE,
                        granularity: "GDC.time.week_us",
                    },
                ],
            });
            const week = isSelectedViewByDateOfWeekGranularity(state);

            expect(week).toBeTruthy();
        });
    });

    describe("getSupportedOverTimeComparisonTypes", () => {
        it("should return all comparison types", () => {
            const state = seedErpSupportedComparisonTypes(getInitializedState(), [
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);

            const types = getSupportedOverTimeComparisonTypes(state);
            expect(types).toEqual([
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);
        });
    });

    describe("replaceDerivedMeasure", () => {
        const masterMeasureBucketItem: IBucketItem = {
            localIdentifier: "m1",
            type: METRIC,
            aggregation: "sum",
            attribute: "m1",
            filters: [],
        };

        const samePeriodPreviousYearBucketItem: IRawBucketItem = {
            localIdentifier: "m1_pop",
            type: METRIC,
            aggregation: "sum",
            showInPercent: undefined,
            attribute: "m1",
            filters: [],
            masterLocalIdentifier: "m1",
            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            alias: "renamedMeasure",
        };

        const previousPeriodBucketItem: IRawBucketItem = {
            localIdentifier: "m1_previous_period_1",
            type: METRIC,
            aggregation: "sum",
            showInPercent: undefined,
            attribute: "m1",
            filters: [],
            masterLocalIdentifier: "m1",
            overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            alias: "renamedMeasure",
        };

        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [masterMeasureBucketItem],
            },
            {
                localIdentifier: SECONDARY_MEASURES,
                items: [] as IBucketItem[],
            },
            {
                localIdentifier: VIEW,
                items: [] as IBucketItem[],
            },
        ];

        function bucketsWithSecondaryItems(items: IRawBucketItem[]) {
            return buckets.map((bucket, index) => (index === 1 ? { ...bucket, items } : bucket));
        }

        const arithmeticMeasure = {
            localIdentifier: "am1",
            operandLocalIdentifiers: ["m1", "m1_previous_period_1"],
            type: METRIC,
        };

        it("should return the same state when derived item is not found in the buckets", () => {
            const state = seedBuckets(getInitializedState(), buckets);
            const updatedState = replaceDerivedMeasure(
                state,
                previousPeriodBucketItem,
                samePeriodPreviousYearBucketItem,
            );

            expect(updatedState).toEqual(state);
        });

        it("should replace SP derived measure in state with target PP comparison type and preserve a new name", () => {
            const initialBuckets = bucketsWithSecondaryItems([samePeriodPreviousYearBucketItem]);
            const state = seedBuckets(getInitializedState(), initialBuckets);
            const updatedState = replaceDerivedMeasure(
                state,
                samePeriodPreviousYearBucketItem,
                previousPeriodBucketItem,
            );

            const expectedBuckets = bucketsWithSecondaryItems([previousPeriodBucketItem]);
            const expectedState = seedBuckets(getInitializedState(), expectedBuckets);

            expect(updatedState.data.buckets).toEqual(expectedState.data.buckets);
        });

        it("should replace PP derived measure in state with target SP comparison type and preserve a new name", () => {
            const initialBuckets = bucketsWithSecondaryItems([previousPeriodBucketItem]);
            const state = seedBuckets(getInitializedState(), initialBuckets);
            const updatedState = replaceDerivedMeasure(
                state,
                previousPeriodBucketItem,
                samePeriodPreviousYearBucketItem,
            );

            const expectedBuckets = bucketsWithSecondaryItems([samePeriodPreviousYearBucketItem]);
            const expectedState = seedBuckets(getInitializedState(), expectedBuckets);

            expect(updatedState.data.buckets).toEqual(expectedState.data.buckets);
        });

        it("should remove arithmetic measure made of derived when switching comparison type and set someDependantMeasuresRemoved to true", () => {
            const initialBuckets = bucketsWithSecondaryItems([previousPeriodBucketItem, arithmeticMeasure]);
            let state = seedBuckets(getInitializedState(), initialBuckets);

            expect(getRemovedItems(state)).toBeNull();

            state = replaceDerivedMeasure(state, previousPeriodBucketItem, samePeriodPreviousYearBucketItem);

            const expectedBuckets = bucketsWithSecondaryItems([samePeriodPreviousYearBucketItem]);
            const expectedState = seedBuckets(getInitializedState(), expectedBuckets);
            expect(getAllBucketItems(state)).toEqual(getAllBucketItems(expectedState));
            expect(getRemovedItems(state)).toStrictEqual({
                measureValueFilters: 0,
                measures: 1,
                rankingFilter: false,
            });
        });
    });

    describe("replaceDerivedTotalItems", () => {
        it("should return unmodified state when totals are not present in bucket", () => {
            const samePeriodMeasureItem: IRawBucketItem = {
                localIdentifier: "m1_pop",
                masterLocalIdentifier: "m2",
                type: METRIC,
                attribute: "m1",
                filters: [],
                aggregation: "sum",
                showInPercent: false,
                granularity: "granularity",
            };

            const previousPeriodMeasureItem: IRawBucket = {
                localIdentifier: "m1_previous_period_1",
                masterLocalIdentifier: "m2",
                type: METRIC,
                attribute: "m1",
                filters: [],
                aggregation: "sum",
                showInPercent: false,
                granularity: "granularity",
            };

            const state = seedBuckets(getInitializedState(), [
                {
                    localIdentifier: MEASURES,
                    items: [samePeriodMeasureItem],
                },
            ]);

            const newState = replaceDerivedTotalItems(
                state,
                samePeriodMeasureItem,
                previousPeriodMeasureItem,
            );

            const bucketTotals = newState.data.buckets?.[0]?.totals;
            expect(bucketTotals).toBeUndefined();
        });

        it("should find and replace localIdentifier of derived measure which has changed", () => {
            const samePeriodMeasureItem: IRawBucketItem = {
                localIdentifier: "m1_pop",
                masterLocalIdentifier: "m2",
                type: METRIC,
                attribute: "m1",
                filters: [],
                aggregation: "sum",
                showInPercent: false,
                granularity: "granularity",
            };

            const previousPeriodMeasureItem: IRawBucket = {
                localIdentifier: "m1_previous_period_1",
                masterLocalIdentifier: "m2",
                type: METRIC,
                attribute: "m1",
                filters: [],
                aggregation: "sum",
                showInPercent: false,
                granularity: "granularity",
            };

            const state = seedBuckets(getInitializedState(), [
                {
                    localIdentifier: MEASURES,
                    items: [samePeriodMeasureItem],
                    totals: [
                        {
                            measureIdentifier: "m1_pop",
                            type: "avg",
                            attributeIdentifier: "a1",
                            alias: "Average",
                        },
                    ],
                },
            ]);

            const newState = replaceDerivedTotalItems(
                state,
                samePeriodMeasureItem,
                previousPeriodMeasureItem,
            );

            const bucketTotals = newState.data.buckets?.[0]?.totals;
            expect(bucketTotals).toEqual([
                {
                    measureIdentifier: "m1_previous_period_1",
                    type: "avg",
                    attributeIdentifier: "a1",
                    alias: "Average",
                },
            ]);
        });
    });

    it("should return true if buckets are empty", () => {
        const updatedState = seedBuckets(getInitializedState(), [
            {
                localIdentifier: MEASURES,
                items: [],
            },
            {
                localIdentifier: VIEW,
                items: [],
            },
            {
                localIdentifier: STACK,
                items: [],
            },
        ]);

        expect(areBucketsEmpty(updatedState.data.buckets)).toEqual(true);
    });

    function getInitialStateWithReferencePoint() {
        const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
        // `filters` is the legacy field the comment below describes
        const stateData: Partial<IAppState["data"]> & { filters: IRefPointFiltersBucket } = {
            itemCache: {
                "fact.spend_analysis.cart_additions": {
                    id: "fact.spend_analysis.cart_additions",
                    identifier: "fact.spend_analysis.cart_additions",
                    isAvailable: true,
                    summary: "",
                    title: "Cart Additions",
                    type: "fact",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
                    ref: {
                        uri: "/gdc/md/TeamOneGoodSales1/obj/15418",
                    },
                },
                aaeFKXFYiCc0: {
                    expression: "SELECT SUM([/gdc/md/TeamOneGoodSales1/obj/15417])",
                    format: `
                            [>=1000000000]$#,,,.0 B;
                            [<=-1000000000]-$#,,,.0 B;
                            [>=1000000]$#,,.0 M;
                            [<=-1000000]-$#,,.0 M;
                            [>=1000]$#,.0 K;
                            [<=-1000]-$#,.0 K;$#,##0
                        `,
                    id: "aaeFKXFYiCc0",
                    identifier: "aaeFKXFYiCc0",
                    isAvailable: true,
                    summary: "",
                    title: "Awareness",
                    type: "metric",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
                    ref: {
                        uri: "/gdc/md/TeamOneGoodSales1/obj/16212",
                    },
                },
                "attr.product.id": {
                    dimensionUri: "/gdc/md/TeamOneGoodSales1/obj/948",
                    summary: "",
                    identifier: "attr.product.id",
                    dfUri: "/gdc/md/TeamOneGoodSales1/obj/952",
                    dfIdentifier: "label.product.id.name",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/949",
                    ref: {
                        uri: "/gdc/md/TeamOneGoodSales1/obj/949",
                    },
                    granularity: "attr.product.id",
                    elementsUri: "/gdc/md/TeamOneGoodSales1/obj/952/elements",
                    title: "Product",
                    type: "attribute",
                    id: "attr.product.id",
                    isAvailable: true,
                },
            },
            visualizationClass: visualizationClassMock(LOCAL_BAR, "visualizationClassUri"),
            filters: {
                localIdentifier: FILTERS,
                items: [],
            },
            buckets: [
                {
                    localIdentifier: MEASURES,
                    items: [
                        {
                            attribute: "fact.spend_analysis.cart_additions",
                            filters: [],
                            localIdentifier: "7bce369fdd0a444bb8e7a9612c39520f",
                            type: METRIC,
                        },
                        {
                            attribute: "aaeFKXFYiCc0",
                            filters: [],
                            localIdentifier: "558daa361c944e3dab84c892a6591add",
                            type: METRIC,
                        },
                    ],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            attribute: "attr.product.id",
                            filters: [],
                            localIdentifier: "914773bd682b42c895b771c76e67ac86",
                            type: ATTRIBUTE,
                        },
                    ],
                },
                {
                    localIdentifier: STACK,
                    items: [],
                },
            ],
            referencePoint: {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [
                            {
                                attribute: "fact.spend_analysis.cart_additions",
                                filters: [],
                                localIdentifier: "7bce369fdd0a444bb8e7a9612c39520f",
                                type: METRIC,
                            },
                            {
                                attribute: "aaeFKXFYiCc0",
                                filters: [],
                                localIdentifier: "558daa361c944e3dab84c892a6591add",
                                type: METRIC,
                            },
                        ],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [
                            {
                                attribute: "attr.product.id",
                                filters: [],
                                localIdentifier: "914773bd682b42c895b771c76e67ac86",
                                type: ATTRIBUTE,
                            },
                        ],
                    },
                    {
                        localIdentifier: STACK,
                        items: [],
                    },
                ],
            },
        };
        let s = seedProjectId(stateWithDateDatasetMeta, "my project");
        s = withData(s, { itemCache: stateData.itemCache });
        s = withData(s, { visualizationClass: stateData.visualizationClass });
        // PRE-EXISTING: `data.filters` is not on the strict data type — no reducer owns it.
        // Preserved verbatim; the legacy readers reach it through an indexed access.
        s = withRoot(s, { data: { ...s.data, filters: stateData.filters } as IAppState["data"] });
        s = seedBuckets(s, stateData.buckets);
        s = withData(s, { referencePoint: {} as IReferencePointState });
        return seedReferencePointBuckets(s, stateData.referencePoint.buckets);
    }

    describe("hasDateFilterInFilterBar", () => {
        it("should be false when there is no date filter in metrics", () => {
            const isAllowed = hasDateFilterInFilterBar(getInitialStateWithReferencePoint());
            expect(isAllowed).toEqual(false);
        });

        it("should be true when there is a date filter in metrics", () => {
            const dateFilter: IFilter = buildDateFilterMock({
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
            });
            const updatedState = FilterBarService.addFilter(getInitialStateWithReferencePoint(), dateFilter);

            expect(hasDateFilterInFilterBar(updatedState)).toEqual(true);
        });
    });

    describe("bucketsHaveCategoriesWithDateFilter", () => {
        it("should be false when there is no date filter in metrics", () => {
            const state = getInitialStateWithReferencePoint();
            expect(bucketsHaveCategoriesWithDateItem(state)).toEqual(false);
        });

        it("should be true when there is a date filter in metrics", () => {
            const updatedState = seedBucketItems(getInitialStateWithReferencePoint(), 1, [
                { attribute: DATE_DATASET_ATTRIBUTE, type: "attribute" },
            ]);

            expect(bucketsHaveCategoriesWithDateItem(updatedState)).toEqual(true);
        });
    });

    describe("getBucketAcceptsItemType", () => {
        const state = seedErpUiConfigBuckets(getInitializedState(), {
            measures: {
                accepts: [METRIC, ATTRIBUTE, FACT],
            },
            view_by: {
                accepts: [ATTRIBUTE, DATE],
            },
            stack_by: {
                accepts: [ATTRIBUTE],
            },
        });

        it("should return true if given item type is accepted by selected buket", () => {
            expect(getBucketAcceptsItemType("measures", METRIC, state)).toBe(true);
            expect(getBucketAcceptsItemType("measures", FACT, state)).toBe(true);
            expect(getBucketAcceptsItemType("measures", ATTRIBUTE, state)).toBe(true);
            expect(getBucketAcceptsItemType("view_by", ATTRIBUTE, state)).toBe(true);
            expect(getBucketAcceptsItemType("view_by", DATE, state)).toBe(true);
            expect(getBucketAcceptsItemType("stack_by", ATTRIBUTE, state)).toBe(true);
        });

        it("should return false if given item type is not accepted by selected buket", () => {
            expect(getBucketAcceptsItemType("measures", DATE, state)).toBe(false);
            expect(getBucketAcceptsItemType("view_by", METRIC, state)).toBe(false);
            expect(getBucketAcceptsItemType("view_by", FACT, state)).toBe(false);
            expect(getBucketAcceptsItemType("stack_by", DATE, state)).toBe(false);
            expect(getBucketAcceptsItemType("stack_by", METRIC, state)).toBe(false);
            expect(getBucketAcceptsItemType("stack_by", FACT, state)).toBe(false);
        });
    });

    describe("containsMetricWithDateFilter", () => {
        const metric: IRawBucketItem = { attribute: "my metric", filters: [] };
        const metricWithDateFilter: IRawBucketItem = {
            attribute: "my metric",
            filters: [{ attribute: DATE_DATASET_ATTRIBUTE }],
        };

        it("should return true if metric date filter present", () => {
            const stateWithMetricDateFilter = updateBucketItems(
                updateBucketItems(getInitialStateWithReferencePoint(), 0, (items) => [
                    ...items,
                    metricWithDateFilter,
                ]),
                0,
                (items) => [...items, metric],
            );

            const bucketItems = getAllBucketItems(stateWithMetricDateFilter);

            expect(containsMetricWithDateFilter(bucketItems)).toEqual(true);
        });

        it("should return false if metric date filter not present", () => {
            const stateWithMetric = updateBucketItems(getInitialStateWithReferencePoint(), 0, (items) => [
                ...items,
                metric,
            ]);

            const bucketItems = getAllBucketItems(stateWithMetric);

            expect(containsMetricWithDateFilter(bucketItems)).toEqual(false);
        });
    });

    describe("isDateFilterInBuckets", () => {
        const metric: IRawBucketItem = {
            attribute: "my metric",
            type: METRIC,
            filters: [],
        };
        const metricWithDateFilter: IRawBucketItem = {
            attribute: "my metric",
            type: METRIC,
            filters: [{ attribute: DATE_DATASET_ATTRIBUTE }],
        };

        it("should return false when there is no date in categories, no measure have date filter and there is no global date filter", () => {
            expect(isSomeDateInBuckets(getInitialStateWithReferencePoint())).toEqual(false);
        });

        it("should return true when there is date in categories", () => {
            const updatedState = seedBucketItems(getInitialStateWithReferencePoint(), 1, [
                { attribute: DATE_DATASET_ATTRIBUTE, type: "attribute" },
            ]);

            expect(isSomeDateInBuckets(updatedState)).toEqual(true);
        });

        it("should return true when there is a measure with date filter", () => {
            const stateWithMetricDateFilter = seedBucketItems(getInitialStateWithReferencePoint(), 0, [
                metricWithDateFilter,
                metric,
            ]);

            expect(isSomeDateInBuckets(stateWithMetricDateFilter)).toEqual(true);
        });

        it("should return true when there is a global date filter", () => {
            const dateFilter: IFilter = buildDateFilterMock({
                cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
            });

            const updatedState = FilterBarService.addFilter(getInitialStateWithReferencePoint(), dateFilter);

            expect(isSomeDateInBuckets(updatedState)).toEqual(true);
        });
    });

    describe("containsDateBucketItem", () => {
        const dateFilter: IFilter = buildDateFilterMock({
            cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
        });
        const viewByDate: IRawBucket = {
            attribute: DATE_DATASET_ATTRIBUTE,
        };
        const someCategory: IRawBucket = {
            attribute: "my category",
        };

        it("should return true if date item present in filters and categories buckets", () => {
            const state = updateBucketItems(getInitialStateWithReferencePoint(), 1, (items) => [
                ...items,
                viewByDate,
            ]);

            const stateWithFiltersAndCategoriesDate = FilterBarService.addFilter(state, dateFilter);

            const filterBucketItems = getAllBucketItems(stateWithFiltersAndCategoriesDate);
            const categoriesBucketItems = getAllBucketItems(stateWithFiltersAndCategoriesDate);
            const bucketItems = filterBucketItems.concat(categoriesBucketItems);

            expect(containsDateBucketItem(bucketItems)).toEqual(true);
        });

        it("should return true if date item is present in categories bucket", () => {
            const stateWithCategoriesDate = updateBucketItems(
                getInitialStateWithReferencePoint(),
                1,
                (items) => [...items, viewByDate],
            );

            const filterBucketItems = getAllBucketItems(stateWithCategoriesDate);
            const categoriesBucketItems = getAllBucketItems(stateWithCategoriesDate);
            const bucketItems = filterBucketItems.concat(categoriesBucketItems);

            expect(containsDateBucketItem(bucketItems)).toEqual(true);
        });

        it("should return false if metric date item is not present in categories bucket", () => {
            const stateWithMetricBuckets = updateBucketItems(
                getInitialStateWithReferencePoint(),
                1,
                (items) => [...items, someCategory],
            );

            const categoriesBucketItems = getAllBucketItems(stateWithMetricBuckets);

            expect(containsDateBucketItem(categoriesBucketItems)).toEqual(false);
        });
    });

    describe("getFirstMasterMeasure", () => {
        it("should return null for empty state", () => {
            const measure = getFirstMasterMeasure(getInitializedState());

            expect(measure).toBeNull();
        });

        it("should return null if no measure presents in buckets", () => {
            const state = seedBucketItems(getInitialStateWithReferencePoint(), 0, []);

            const measure = getFirstMasterMeasure(state);

            expect(measure).toBeNull();
        });

        it("should skip attributes and return first measure", () => {
            const state = seedBucketItem(getInitialStateWithReferencePoint(), 0, 0, { type: ATTRIBUTE });

            const measure = getFirstMasterMeasure(state);

            expect(measure).toBe(state.data.buckets?.[0]?.items?.[1]);
        });

        it("should skip derived measures", () => {
            const state = seedBucketItem(getInitialStateWithReferencePoint(), 0, 0, {
                masterLocalIdentifier: "whatever",
            });

            const measure = getFirstMasterMeasure(state);

            expect(measure).toBe(state.data.buckets?.[0]?.items?.[1]);
        });
    });

    describe("isRenamingBucketItem", () => {
        it("should return false when bucket is NOT being renamed", () => {
            const isBucketItemBeingRenamed = isRenamingBucketItem(getInitialStateWithReferencePoint());
            expect(isBucketItemBeingRenamed).toBe(false);
        });

        it("should return true when bucket is being renamed", () => {
            const updatedState = seedRenamingBucketItem(getInitialStateWithReferencePoint(), true);
            const isBucketItemBeingRenamed = isRenamingBucketItem(updatedState);
            expect(isBucketItemBeingRenamed).toBe(true);
        });
    });

    describe("createArithmeticMeasure", () => {
        it("should create an empty ratio AM with provided format", () => {
            const measure = createArithmeticMeasure("format#");
            expect(measure).toEqual({
                filters: [],
                localIdentifier: expect.stringMatching(/^(\w{32})$/),
                isKdaDisabled: null,
                operandLocalIdentifiers: [null, null],
                operator: "ratio",
                type: "metric",
                aggregation: null,
                attribute: null,
                alias: null,
                granularity: null,
                showInPercent: null,
                showAllValues: null,
                masterLocalIdentifier: null,
                showOnSecondaryAxis: null,
                isTotalMeasure: null,
                isThresholdMeasure: null,
                format: "format#",
                ref: null,
            });
        });
    });

    function getDefaultStateWithSimpleMeasures() {
        const buckets: IRawBuckets = [
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
        ];
        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithMultilevelArithmeticMeasure() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: ["m1", "m2"],
                        type: METRIC,
                    },
                    {
                        localIdentifier: "am2",
                        operandLocalIdentifiers: ["am1", "m1"],
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m1",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m2",
                        type: METRIC,
                    },
                ],
            },
        ];
        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithDerivedMeasure() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1_pop",
                        masterLocalIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m2",
                    },
                ],
            },
        ];
        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithInvalidArithmeticMeasure() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m2",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "am2",
                        operandLocalIdentifiers: [null, null],
                        type: METRIC,
                    },
                ],
            },
        ];

        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithThreeMeasuresAndInvalidArithmeticMeasure() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m2",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m3",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: [null, null],
                        type: METRIC,
                    },
                ],
            },
        ];

        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithAttributeTwoMeasuresAndInvalidArithmeticMeasure() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: [null, null],
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m1",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m2",
                        type: METRIC,
                    },
                ],
            },
            {
                localIdentifier: ATTRIBUTE,
                items: [
                    {
                        localIdentifier: "a1",
                        type: ATTRIBUTE,
                    },
                ],
            },
        ];

        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithDerivedMeasureAndInvalidArithmeticMeasure() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1_pop",
                        masterLocalIdentifier: "m1",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m1",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "m2",
                        type: METRIC,
                    },
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: [null, null],
                        type: METRIC,
                    },
                ],
            },
        ];
        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithArithmeticMeasureMadeFromDerived() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: ["m1_pop", "m2"],
                    },
                    {
                        localIdentifier: "m1_pop",
                        masterLocalIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m2",
                    },
                ],
            },
        ];
        return seedBuckets(getInitializedState(), buckets);
    }

    function getDefaultStateWithDerivedFromArithmeticMeasure() {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: ["m1", "m2"],
                    },
                    {
                        localIdentifier: "am1_pop",
                        masterLocalIdentifier: "am1",
                    },
                    {
                        localIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m2",
                    },
                ],
            },
        ];
        return seedBuckets(getInitializedState(), buckets);
    }

    function setFiltersToState(state: IAppState, filters: IFilter[]): IAppState {
        return filters.reduce(
            (newState: IAppState, filter: IFilter) => FilterBarService.addFilter(newState, filter),
            state,
        );
    }

    function getDefaultStateWithFilters(filters: IFilter[]) {
        let state = getInitializedState();
        const buckets: IRawBuckets = [
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
        state = seedBuckets(state, buckets);
        return setFiltersToState(state, filters);
    }

    function getDefaultStateWithArithmeticMeasureAndFilters(filters: IFilter[]) {
        let state = getInitializedState();
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m2",
                    },
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: ["m1", "m2"],
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
                ],
            },
        ];
        state = seedBuckets(state, buckets);
        return setFiltersToState(state, filters);
    }

    function getDefaultStateWithPopMeasureAndFilters(filters: IFilter[]) {
        let state = getInitializedState();
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m2",
                    },
                    {
                        localIdentifier: "m1_pop",
                        masterLocalIdentifier: "m1",
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
                ],
            },
        ];
        state = seedBuckets(state, buckets);
        return setFiltersToState(state, filters);
    }

    function getDefaultStateWithPopMeasureAndArithmeticMeasureAndFilters(filters: IFilter[]) {
        let state = getInitializedState();
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [
                    {
                        localIdentifier: "m1",
                    },
                    {
                        localIdentifier: "m2",
                    },
                    {
                        localIdentifier: "m1_pop",
                        masterLocalIdentifier: "m1",
                    },
                    {
                        localIdentifier: "am1",
                        operandLocalIdentifiers: ["m1_pop", "m2"],
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
                ],
            },
        ];
        state = seedBuckets(state, buckets);
        return setFiltersToState(state, filters);
    }

    describe("findAllReferencingArithmeticMeasures", () => {
        it("should find all arithmetic bucket items which have specified operand", () => {
            const state = getDefaultStateWithMultilevelArithmeticMeasure();

            const referencedArithmeticMeasures = findAllReferencingArithmeticMeasures(state, {
                localIdentifier: "m2",
            });

            const expectedBuckets = [
                {
                    localIdentifier: "am1",
                    operandLocalIdentifiers: ["m1", "m2"],
                    type: METRIC,
                },
            ];
            expect(referencedArithmeticMeasures).toEqual(expectedBuckets);
        });

        it("should return empty array if bucket item is not operand in any arithmetic measure", () => {
            const state = getDefaultStateWithMultilevelArithmeticMeasure();

            const referencedArithmeticMeasures = findAllReferencingArithmeticMeasures(state, {
                localIdentifier: "m3",
            });

            expect(referencedArithmeticMeasures).toEqual([]);
        });
    });

    describe("isOperandInArithmeticMeasure", () => {
        it("should return true if measure is operand of arithmetic measure", () => {
            const referencedArithmeticMeasures = isOperandInArithmeticMeasure(
                { localIdentifier: "m1" },
                {
                    localIdentifier: "am1",
                    operandLocalIdentifiers: ["m1", "m2"],
                },
            );

            expect(referencedArithmeticMeasures).toEqual(true);
        });

        it("should return false if measure is not operand of arithmetic measure", () => {
            const referencedArithmeticMeasures = isOperandInArithmeticMeasure(
                { localIdentifier: "m3" },
                {
                    localIdentifier: "am1",
                    operandLocalIdentifiers: ["m1", "m2"],
                },
            );

            expect(referencedArithmeticMeasures).toEqual(false);
        });

        it("should return false if measure is not arithmetic measure", () => {
            const referencedArithmeticMeasures = isOperandInArithmeticMeasure(
                { localIdentifier: "m3" },
                {
                    localIdentifier: "am1",
                },
            );

            expect(referencedArithmeticMeasures).toEqual(false);
        });
    });

    describe("removeMultipleBucketItemsWithDependencies", () => {
        it("should remove bucket item from buckets", () => {
            const state = getDefaultStateWithSimpleMeasures();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets = [
                {
                    localIdentifier: "m2",
                },
            ];
            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also remove derived measure derived from removed bucket item", () => {
            const state = getDefaultStateWithDerivedMeasure();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets = [
                {
                    localIdentifier: "m2",
                },
            ];
            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also remove arithmetic measure made from removed bucket item", () => {
            const state = getDefaultStateWithMultilevelArithmeticMeasure();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets = [
                {
                    localIdentifier: "m2",
                    type: METRIC,
                },
            ];
            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also remove arithmetic measure made from derived measure made from removed bucket item", () => {
            const state = getDefaultStateWithArithmeticMeasureMadeFromDerived();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets = [
                {
                    localIdentifier: "m2",
                },
            ];
            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also remove derived measure derived from arithmetic measure made from removed bucket item", () => {
            const state = getDefaultStateWithDerivedFromArithmeticMeasure();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets = [
                {
                    localIdentifier: "m2",
                },
            ];
            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also remove invalid arithmetic measures when number of remaining measures buckets is less than 2", () => {
            const state = getDefaultStateWithInvalidArithmeticMeasure();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets = [
                {
                    localIdentifier: "m2",
                    type: METRIC,
                },
            ];

            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also not remove invalid arithmetic measures when number of remaining measures buckets is more than 2", () => {
            const state = getDefaultStateWithThreeMeasuresAndInvalidArithmeticMeasure();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets: IRawBuckets = [
                {
                    localIdentifier: "m2",
                    type: METRIC,
                },
                {
                    localIdentifier: "m3",
                    type: METRIC,
                },
                {
                    localIdentifier: "am1",
                    operandLocalIdentifiers: [null, null],
                    type: METRIC,
                },
            ];

            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also not remove invalid arithmetic measures when attribute bucket item is removed", () => {
            const state = getDefaultStateWithAttributeTwoMeasuresAndInvalidArithmeticMeasure();

            const newState = removeMultipleBucketItemsWithDependencies(state, ["a1"]);

            const expectedBuckets: IRawBuckets = [
                {
                    localIdentifier: "am1",
                    operandLocalIdentifiers: [null, null],
                    type: METRIC,
                },
                {
                    localIdentifier: "m1",
                    type: METRIC,
                },
                {
                    localIdentifier: "m2",
                    type: METRIC,
                },
            ];

            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should also remove invalid arithmetic measures when removed measure has derived items and number of remaining measures is less than 2", () => {
            const state = getDefaultStateWithDerivedMeasureAndInvalidArithmeticMeasure();
            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            const expectedBuckets = [
                {
                    localIdentifier: "m2",
                    type: METRIC,
                },
            ];

            expect(getAllBucketItems(newState)).toEqual(expectedBuckets);
        });

        it("should set removed items for provided metric and also its dependant items", () => {
            const state = getDefaultStateWithMultilevelArithmeticMeasure();
            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

            expect(getRemovedItems(newState)).toStrictEqual({
                measureValueFilters: 0,
                measures: 3,
                rankingFilter: false,
            });
        });

        it("should set removed items only for dependent removed items when argument is true", () => {
            const state = getDefaultStateWithMultilevelArithmeticMeasure();
            const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"], true);

            expect(getRemovedItems(newState)).toStrictEqual({
                measureValueFilters: 0,
                measures: 2,
                rankingFilter: false,
            });
        });

        describe("measure value filter", () => {
            it("should remove measure value filter when its measure is removed", () => {
                const state = getDefaultStateWithFilters([
                    FilterBarService.createMeasureValueFilter("m1"),
                    FilterBarService.createMeasureValueFilter("m2"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                const expectedFilters: IFilter[] = [
                    expect.objectContaining({ measureLocalIdentifier: "m2" }),
                ];
                expect(getFilterItems(newState)).toEqual(expectedFilters);
            });

            it("should not remove measure value filters when insight is not sliced any more after removal", () => {
                const state = getDefaultStateWithFilters([
                    FilterBarService.createMeasureValueFilter("m1"),
                    FilterBarService.createMeasureValueFilter("m2"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["date", "a1"]);
                const expectedFilters: IFilter[] = [
                    expect.objectContaining({ measureLocalIdentifier: "m1" }),
                    expect.objectContaining({ measureLocalIdentifier: "m2" }),
                ];
                expect(getFilterItems(newState)).toEqual(expectedFilters);
            });

            it("should not remove all measures value filters when insight is sliced by attribute after removal", () => {
                const state = getDefaultStateWithFilters([
                    FilterBarService.createMeasureValueFilter("m1"),
                    FilterBarService.createMeasureValueFilter("m2"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["date"]);
                const expectedFilters: IFilter[] = [
                    expect.objectContaining({ measureLocalIdentifier: "m1" }),
                    expect.objectContaining({ measureLocalIdentifier: "m2" }),
                ];
                expect(getFilterItems(newState)).toEqual(expectedFilters);
            });

            it("should not remove all measures value filters when insight is sliced by date after removal", () => {
                const state = getDefaultStateWithFilters([
                    FilterBarService.createMeasureValueFilter("m1"),
                    FilterBarService.createMeasureValueFilter("m2"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["a1"]);
                const expectedFilters: IFilter[] = [
                    expect.objectContaining({ measureLocalIdentifier: "m1" }),
                    expect.objectContaining({ measureLocalIdentifier: "m2" }),
                ];
                expect(getFilterItems(newState)).toEqual(expectedFilters);
            });

            it("should remove measure value filter of dependant arithmetic measure", () => {
                const state = getDefaultStateWithArithmeticMeasureAndFilters([
                    FilterBarService.createMeasureValueFilter("am1"),
                    FilterBarService.createMeasureValueFilter("m2"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                const expectedFilters: IFilter[] = [
                    expect.objectContaining({ measureLocalIdentifier: "m2" }),
                ];
                expect(getFilterItems(newState)).toEqual(expectedFilters);
            });

            it("should remove measure value filter of dependant pop measure", () => {
                const state = getDefaultStateWithPopMeasureAndFilters([
                    FilterBarService.createMeasureValueFilter("m1_pop"),
                    FilterBarService.createMeasureValueFilter("m2"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                const expectedFilters: IFilter[] = [
                    expect.objectContaining({ measureLocalIdentifier: "m2" }),
                ];
                expect(getFilterItems(newState)).toEqual(expectedFilters);
            });

            it("should remove measure value filter of dependant pop measure dependant on arithmetic measure", () => {
                const state = getDefaultStateWithPopMeasureAndArithmeticMeasureAndFilters([
                    FilterBarService.createMeasureValueFilter("am1"),
                    FilterBarService.createMeasureValueFilter("m2"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                const expectedFilters: IFilter[] = [
                    expect.objectContaining({ measureLocalIdentifier: "m2" }),
                ];
                expect(getFilterItems(newState)).toEqual(expectedFilters);
            });
        });

        describe("ranking filter", () => {
            it("should remove ranking filter when its measure is removed", () => {
                const state = getDefaultStateWithFilters([FilterBarService.createDefaultRankingFilter("m1")]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                expect(hasRankingFilter(newState)).toBe(false);
            });

            it("should not remove ranking filter when insight is not sliced any more", () => {
                // With the improved ranking filter on by default, a filter with no "out of" attributes has no
                // granularity constraint and survives the loss of bucket slicing, mirroring the measure value
                // filter. The classic behavior (always removed) applies only when enableImprovedRankingFilter is off.
                const state = getDefaultStateWithFilters([FilterBarService.createDefaultRankingFilter("m1")]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["date", "a1"]);
                expect(hasRankingFilter(newState)).toBe(true);
            });

            it("should not remove ranking filter when insight is still sliced by an attribute after a date removal", () => {
                const state = getDefaultStateWithFilters([FilterBarService.createDefaultRankingFilter("m1")]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["date"]);
                expect(hasRankingFilter(newState)).toBe(true);
            });

            it("should not remove ranking filter when insight is still sliced by a date after an attribute removal", () => {
                const state = getDefaultStateWithFilters([FilterBarService.createDefaultRankingFilter("m1")]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["a1"]);
                expect(hasRankingFilter(newState)).toBe(true);
            });

            it("should preserve ranking filter when its attribute is removed", () => {
                // With the improved ranking filter on by default, a removed "out of" attribute is promoted to its
                // catalog ObjRef instead of being a hard dependency, so the filter survives (mirroring the measure
                // value filter). Under the classic behavior (enableImprovedRankingFilter off) it would be removed.
                const state = getDefaultStateWithFilters([
                    {
                        ...rankingFilterWithAttributes,
                        attributes: ["a1"],
                    },
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["a1"]);
                expect(hasRankingFilter(newState)).toBe(true);
            });

            it("should not remove ranking filter when non referenced attribute is removed", () => {
                const state = getDefaultStateWithFilters([
                    {
                        ...rankingFilterWithAttributes,
                        attributes: ["a1"],
                    },
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["date"]);
                expect(hasRankingFilter(newState)).toBe(true);
            });

            it("should not remove ranking filter when filter has no attributes and some attribute is removed", () => {
                const state = getDefaultStateWithFilters([rankingFilterWithoutAttributes]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["a1"]);
                expect(hasRankingFilter(newState)).toBe(true);
            });

            it("should remove ranking filter of dependant arithmetic measure", () => {
                const state = getDefaultStateWithArithmeticMeasureAndFilters([
                    FilterBarService.createDefaultRankingFilter("am1"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                expect(hasRankingFilter(newState)).toBe(false);
            });

            it("should remove ranking filter of dependant pop measure", () => {
                const state = getDefaultStateWithPopMeasureAndFilters([
                    FilterBarService.createDefaultRankingFilter("m1_pop"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                expect(hasRankingFilter(newState)).toBe(false);
            });

            it("should remove ranking filter of dependant pop measure dependant on arithmetic measure", () => {
                const state = getDefaultStateWithPopMeasureAndArithmeticMeasureAndFilters([
                    FilterBarService.createDefaultRankingFilter("am1"),
                ]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);
                expect(hasRankingFilter(newState)).toBe(false);
            });

            it("should set removed item for removed ranking filter", () => {
                const state = getDefaultStateWithFilters([FilterBarService.createDefaultRankingFilter("m1")]);
                const newState = removeMultipleBucketItemsWithDependencies(state, ["m1"]);

                expect(getRemovedItems(newState)).toStrictEqual({
                    measureValueFilters: 0,
                    measures: 0,
                    rankingFilter: true,
                });
            });
        });
    });

    describe("createDerivedMeasure", () => {
        const masterMeasure: IRawBucketItem = {
            type: METRIC,
            localIdentifier: "m1",
            attribute: "attribute",
            aggregation: "sum",
            showInPercent: true,
            showOnSecondaryAxis: false,
            filters: [],
        };

        it("should create SP derived measure for provided master measure", () => {
            const derivedMeasure = createDerivedMeasure(
                masterMeasure,
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );

            expect(derivedMeasure).toEqual({
                type: METRIC,
                localIdentifier: "m1_pop",
                attribute: "attribute",
                aggregation: "sum",
                showInPercent: true,
                showOnSecondaryAxis: false,
                filters: [],
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                isTotalMeasure: undefined,
            });
        });

        it("should create PP derived measure for provided master measure", () => {
            const derivedMeasure = createDerivedMeasure(
                masterMeasure,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );

            expect(derivedMeasure).toEqual({
                type: METRIC,
                localIdentifier: "m1_previous_period",
                attribute: "attribute",
                aggregation: "sum",
                showInPercent: true,
                showOnSecondaryAxis: false,
                filters: [],
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                isTotalMeasure: undefined,
            });
        });
    });

    describe("isBucketAllowShowOnSecondaryAxis", () => {
        it("should return false by default of allow show on secondary axis", () => {
            expect(isBucketAllowShowOnSecondaryAxis(getInitializedState(), MEASURES)).toEqual(false);
        });

        it("should return value of allow show on secondary axis", () => {
            const state = seedErpBucketUiConfig(getInitializedState(), MEASURES, {
                allowShowOnSecondaryAxis: true,
            });

            expect(isBucketAllowShowOnSecondaryAxis(state, MEASURES)).toEqual(true);
        });
    });

    describe("isBucketEnabledSecondaryAxis", () => {
        it("should return bucket dualAxis is true", () => {
            const state = seedDualAxis(
                seedErpBucketUiConfig(getInitializedState(), MEASURES, { allowShowOnSecondaryAxis: true }),
                true,
            );

            expect(isBucketEnabledSecondaryAxis(state, MEASURES)).toEqual(true);
        });

        it("should return bucket dualAxis is false", () => {
            expect(isBucketEnabledSecondaryAxis(getInitializedState(), MEASURES)).toEqual(false);

            const state = seedErpBucketUiConfig(seedDualAxis(getInitializedState(), false), MEASURES, {
                allowShowOnSecondaryAxis: true,
            });

            expect(isBucketEnabledSecondaryAxis(state, MEASURES)).toEqual(false);
        });
    });

    describe("getPrimaryMeasuresFromMeasureBucket", () => {
        it("should return empty items when buckets has no measure", () => {
            expect(getPrimaryMeasuresFromMeasureBucket(getInitializedState())).toHaveLength(0);
        });

        it("should return primary bucket items", () => {
            const measureItems = [
                {
                    localIdentifier: "m1",
                    masterLocalIdentifier: "m1",
                    type: METRIC,
                },
                {
                    localIdentifier: "m2",
                    masterLocalIdentifier: "m2",
                    type: METRIC,
                },
            ];
            const buckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: measureItems,
                },
                {
                    localIdentifier: SECONDARY_MEASURES,
                    items: [
                        {
                            localIdentifier: "m3",
                            type: METRIC,
                        },
                    ],
                },
            ];

            const state = seedBuckets(getInitializedState(), buckets);
            expect(getPrimaryMeasuresFromMeasureBucket(state)).toEqual(measureItems);
        });
    });

    describe("addTotalsEnabledForAllMeasuresToNewMeasure", () => {
        const stateWithoutMeasure = seedBuckets(getInitializedState(), [
            {
                localIdentifier: MEASURES,
                items: [],
            },
            {
                localIdentifier: ATTRIBUTE,
                items: [
                    {
                        type: ATTRIBUTE,
                        localIdentifier: "a1",
                    },
                    {
                        type: ATTRIBUTE,
                        localIdentifier: "a2",
                    },
                    {
                        type: ATTRIBUTE,
                        localIdentifier: "a3",
                    },
                ],
            },
        ]);

        const droppedMeasure: IRawBucketItem = {
            localIdentifier: "m10",
            type: METRIC,
        };

        describe("no measure is in the bucket", () => {
            it("should not add any total when no totals are defined", () => {
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    stateWithoutMeasure,
                );

                expect(getTotals(updatedState)).toEqual([]);
            });
        });

        describe("one measure is in the measure bucket", () => {
            const stateWithOneMeasure = seedBucketItems(stateWithoutMeasure, 0, [
                {
                    type: METRIC,
                    localIdentifier: "m1",
                },
            ]);

            it("should not add total when no total is defined", () => {
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    stateWithOneMeasure,
                );

                expect(getTotals(updatedState)).toEqual([]);
            });

            it("should add all totals when some totals are defined", () => {
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    addTotals(stateWithOneMeasure, [total("m1", "a1", "sum"), total("m1", "a2", "max")]),
                );

                expect(getTotals(updatedState)).toEqual([
                    total("m1", "a1", "sum"),
                    total("m1", "a2", "max"),
                    total("m10", "a1", "sum"),
                    total("m10", "a2", "max"),
                ]);
            });
        });

        describe("two measures are in the measure bucket", () => {
            const stateWithTwoMeasures = seedBucketItems(stateWithoutMeasure, 0, [
                {
                    type: METRIC,
                    localIdentifier: "m1",
                },
                {
                    type: METRIC,
                    localIdentifier: "m2",
                },
            ]);

            it("should not add total when no total is defined", () => {
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    stateWithTwoMeasures,
                );

                expect(getTotals(updatedState)).toEqual([]);
            });

            it("should not add total only one measure have totals defined", () => {
                const totals = [total("m1", "a1", "sum")];
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    addTotals(stateWithTwoMeasures, totals),
                );

                expect(getTotals(updatedState)).toEqual(totals);
            });

            it("should not add total when all measures have total but they differ in type", () => {
                const totals = [total("m1", "a1", "sum"), total("m2", "a1", "max")];
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    addTotals(stateWithTwoMeasures, totals),
                );

                expect(getTotals(updatedState)).toEqual(totals);
            });

            it("should not add total when all measures have total but they differ in attribute", () => {
                const totals = [total("m1", "a1", "sum"), total("m2", "a2", "sum")];
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    addTotals(stateWithTwoMeasures, totals),
                );

                expect(getTotals(updatedState)).toEqual(totals);
            });

            it("should add all totals when all measures have some totals with same type and attribute", () => {
                const updatedState = addTotalsEnabledForAllMeasuresToNewMeasure(
                    droppedMeasure,
                    addTotals(stateWithTwoMeasures, [
                        total("m1", "a1", "sum"),
                        total("m1", "a1", "sum"), // duplicated total
                        total("m4", "a1", "sum"), // invalid total
                        total("m2", "a1", "sum"),
                        total("m1", "a2", "max"),
                        total("m2", "a2", "max"),
                        total("m2", "a2", "min"), // not for all measures
                    ]),
                );

                expect(getTotals(updatedState)).toEqual([
                    total("m1", "a1", "sum"),
                    total("m1", "a1", "sum"), // duplicated total
                    total("m4", "a1", "sum"), // invalid total
                    total("m2", "a1", "sum"),
                    total("m1", "a2", "max"),
                    total("m2", "a2", "max"),
                    total("m2", "a2", "min"), // not for all measures
                    total("m10", "a1", "sum"),
                    total("m10", "a2", "max"),
                ]);
            });
        });
    });

    describe("removeUneditedAttributeAndDateFilters", () => {
        it("should not remove measure value filter", () => {
            const state: IAppState = seedBucketsMeta(
                FilterBarService.setFilterItems(getInitializedState(), [filtersMock[2]]),
                {} as unknown as IBucketsMetaState,
            );

            const updatedState = removeUneditedAttributeAndDateFilters(state, "someCacheItemId");

            expect(getFilterItems(updatedState)).toEqual([filtersMock[2]]);
        });

        it("should not remove attribute filter if it is not auto created", () => {
            const state: IAppState = seedBucketsMeta(
                FilterBarService.setFilterItems(getInitializedState(), [filtersMock[0]]),
                {} as unknown as IBucketsMetaState,
            );

            const updatedState = removeUneditedAttributeAndDateFilters(state, "attr.identifier");

            expect(getFilterItems(updatedState)).toEqual([filtersMock[0]]);
        });

        it("should not remove attribute filter if it is auto created and modified", () => {
            const state: IAppState = seedBucketsMeta(
                FilterBarService.setFilterItems(getInitializedState(), [filtersMock[0]]),
                {
                    collapsed: {},
                    autoCreated: {
                        "attr.identifier": true,
                    },
                    modified: {
                        "attr.identifier": true,
                    },
                },
            );
            const updatedState = removeUneditedAttributeAndDateFilters(state, "attr.identifier");
            expect(getFilterItems(updatedState)).toEqual([filtersMock[0]]);
        });

        it("should remove attribute filter if it is auto created and not modified", () => {
            const state: IAppState = seedBucketsMeta(
                FilterBarService.setFilterItems(getInitializedState(), [filtersMock[0]]),
                {
                    collapsed: {},
                    autoCreated: {
                        "attr.identifier": true,
                    },
                } as unknown as IBucketsMetaState,
            );
            const updatedState = removeUneditedAttributeAndDateFilters(state, "attr.identifier");
            expect(getFilterItems(updatedState)).toEqual([]);
        });

        it("should not remove date filter if it is not auto created", () => {
            const state: IAppState = seedBucketsMeta(
                FilterBarService.setFilterItems(getInitializedState(), [filtersMock[1]]),
                {} as unknown as IBucketsMetaState,
            );

            const updatedState = removeUneditedAttributeAndDateFilters(state, "date.identifier");

            expect(getFilterItems(updatedState)).toEqual([filtersMock[1]]);
        });

        it("should not remove date filter if it is auto created and modified", () => {
            const state: IAppState = seedBucketsMeta(
                FilterBarService.setFilterItems(getInitializedState(), [filtersMock[1]]),
                {
                    collapsed: {},
                    autoCreated: {
                        "date.identifier": true,
                    },
                    modified: {
                        "date.identifier": true,
                    },
                },
            );
            const updatedState = removeUneditedAttributeAndDateFilters(state, "date.identifier");
            expect(getFilterItems(updatedState)).toEqual([filtersMock[1]]);
        });

        it("should remove date filter if it is auto created and not modified", () => {
            const state: IAppState = seedBucketsMeta(
                FilterBarService.setFilterItems(getInitializedState(), [filtersMock[1]]),
                {
                    collapsed: {},
                    autoCreated: {
                        "date.identifier": true,
                    },
                } as unknown as IBucketsMetaState,
            );
            const updatedState = removeUneditedAttributeAndDateFilters(state, "date.identifier");
            expect(getFilterItems(updatedState)).toEqual([]);
        });
    });

    describe("getBucketIndex", () => {
        it("should return -1 when bucket is not found", () => {
            const state = seedBuckets(getInitializedState(), getValidBucketsWithTotals());
            expect(getBucketIndex(state, "some non existent bucket")).toBe(-1);
        });

        it("should return index of the bucket when bucket exists", () => {
            const state = seedBuckets(getInitializedState(), getValidBucketsWithTotals());
            expect(getBucketIndex(state, ATTRIBUTE)).toBe(1);
        });
    });

    describe("findReplacedBucketItemNewInsertionIndex", () => {
        const buildBucket = (bucketItemLocalIdentifiers: string[]): IRawBucket => ({
            localIdentifier: MEASURES,
            items: bucketItemLocalIdentifiers.map((localIdentifier) => buildBucketItem({ localIdentifier })),
        });

        it.each([
            ["m1", ["m1"], [], 0],
            ["m1", ["m1", "m2"], ["m2"], 0],
            ["m2", ["m1", "m2"], ["m1"], 1],
            ["m1", ["m1", "m2", "m3"], ["m2", "m3"], 0],
            ["m2", ["m1", "m2", "m3"], ["m1", "m3"], 1],
            ["m3", ["m1", "m2", "m3"], ["m1", "m2"], 2],
            ["m5", ["m1", "m2", "m3", "m4", "m5"], ["m1", "m3", "m4"], 3],
            ["m5", ["m1", "m2", "m3", "m4", "m5"], ["m1", "m4"], 2],
            ["m2", ["m1", "m2", "m3"], [], 0],
        ])(
            "should find the expected insertion point for replaced item '%s' when bucket items [%s] were changed to [%s]",
            (
                replacedBucketItem: string,
                bucketItems: string[],
                bucketItemsAfterReplace: string[],
                expectedInsertionIndex: number,
            ) => {
                const insertionIndex = findReplacedBucketItemNewInsertionIndex(
                    buildBucketItem({ localIdentifier: replacedBucketItem }),
                    buildBucket(bucketItems),
                    buildBucket(bucketItemsAfterReplace),
                );
                expect(insertionIndex).toBe(expectedInsertionIndex);
            },
        );
    });

    describe("setBucketItemsDateDataset", () => {
        const dateAttribute1 = {
            localIdentifier: "d1",
            type: DATE_TYPE,
            dateDatasetRef: {
                uri: "d1",
            },
        };
        const dateAttribute2 = {
            localIdentifier: "d2",
            type: DATE_TYPE,
            dateDatasetRef: {
                uri: "d1",
            },
        };

        it("should return current state in case that state does not contain date bucket item", () => {
            const state = getDateDatasetState([
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ]);
            const ref = { uri: "d2" };

            const result = setBucketItemsDateDataset(state, ref);
            expect(result).toEqual(state);
        });

        it("should set correct ref", () => {
            const state = getDateDatasetState([
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [dateAttribute1],
                },
            ]);
            const ref = { uri: "d2" };
            const correctState = getDateDatasetState([
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        {
                            localIdentifier: "d1",
                            type: DATE_TYPE,
                            dateDatasetRef: {
                                uri: "d2",
                            },
                        },
                    ],
                },
            ]);

            const result = setBucketItemsDateDataset(state, ref);
            expect(result).toEqual(correctState);
        });

        it("should set correct ref to correct date bucket item", () => {
            const state = getDateDatasetState([
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [dateAttribute1, dateAttribute2],
                },
            ]);
            const ref = { uri: "d2" };
            const localIdentifier = "d2";
            const correctState = getDateDatasetState([
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [
                        dateAttribute1,
                        {
                            localIdentifier: "d2",
                            type: DATE_TYPE,
                            dateDatasetRef: {
                                uri: "d2",
                            },
                        },
                    ],
                },
            ]);

            const result = setBucketItemsDateDataset(state, ref, localIdentifier);
            expect(result).toEqual(correctState);
        });
    });

    describe("getPrimaryDateDataset", () => {
        const dateAttribute1 = {
            localIdentifier: "d1",
            type: DATE_TYPE,
            dateDatasetRef: {
                uri: "d1",
            },
        };
        const dateAttribute2 = {
            localIdentifier: "d2",
            type: DATE_TYPE,
            dateDatasetRef: {
                uri: "d2",
            },
        };

        it("should return correct date bucket item", () => {
            const correctDateDataset: IDateDataset = {
                identifier: "d1",
                ref: { uri: "d1" },
                id: "d1",
                uri: "d1",
                title: "d1",
                summary: "",
                type: "dateDataset",
                attributes: [],
                isAvailable: true,
                relevance: 0,
            };
            const state = getDateDatasetState(
                [
                    {
                        localIdentifier: MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [dateAttribute1, dateAttribute2],
                    },
                ],
                [correctDateDataset],
            );

            const result = getPrimaryDateDataset(state);
            expect(result).toEqual(correctDateDataset);
        });
    });

    describe("getUsedDateDatasets", () => {
        const dateAttribute1 = {
            localIdentifier: "d1",
            type: DATE_TYPE,
            dateDatasetRef: closedDateDatasetRef.ref,
        };

        it("should return dateDatasets from bucket item and date filter", () => {
            let state = getDateDatasetState(
                [
                    {
                        localIdentifier: MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [dateAttribute1],
                    },
                ],
                [activityDateDatasetRef, closedDateDatasetRef],
            );

            state = FilterBarService.setFilterBarState(state, {
                attributeFilterConfigs: {},
                items: [dateFilterBarItemActivity],
                isMultiline: false,
                migratedAdditionalFilters: [],
                parameterItems: [],
                filterBarDropdownOpen: false,
            });

            const result = getUsedDateDatasets(state);
            expect(result).toEqual({
                used: [activityDateDatasetRef, closedDateDatasetRef],
            });
        });

        it("should return empty when no dimensins used in insight", () => {
            const state = getDateDatasetState(
                [
                    {
                        localIdentifier: MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [],
                    },
                ],
                [activityDateDataset, closedDateDataset],
            );

            const result = getUsedDateDatasets(state);
            expect(result).toEqual({
                used: [],
            });
        });
    });

    describe("getUsedDateDatasetsExtendedFromBuckets", () => {
        const dateAttribute1 = {
            localIdentifier: "d1",
            type: DATE_TYPE,
            dateDatasetRef: closedDateDatasetRef.ref,
        };

        it("should return dateDatasets from bucket item and date filter in reference point", () => {
            const buckets: IRawBuckets = null;
            const extendedBuckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [dateAttribute1],
                },
            ];
            const filterItemsExtended = [dateFilterBarItemActivity];
            const availableDateDatasets = [activityDateDatasetRef, closedDateDatasetRef];

            const result = getUsedDateDatasetsExtendedFromBuckets(
                buckets,
                extendedBuckets,
                filterItemsExtended,
                availableDateDatasets,
                null,
            );
            expect(result).toEqual({
                used: [activityDateDatasetRef, closedDateDatasetRef],
            });
        });

        it("should return empty when no dimensins used in reference point", () => {
            const buckets: IRawBuckets = null;
            const extendedBuckets: IRawBuckets = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                },
                {
                    localIdentifier: VIEW,
                    items: [],
                },
            ];
            const filterItemsExtended: ReadonlyArray<IFilter> = [];
            const availableDateDatasets = [activityDateDataset, closedDateDataset];

            const result = getUsedDateDatasetsExtendedFromBuckets(
                buckets,
                extendedBuckets,
                filterItemsExtended,
                availableDateDatasets,
                null,
            );
            expect(result).toEqual({
                used: [],
            });
        });
    });

    describe("getBucketIdentifierByItemId", () => {
        const initialState = getInitialStateWithReferencePoint();

        it.each([
            [MEASURES, "558daa361c944e3dab84c892a6591add"],
            [VIEW, "914773bd682b42c895b771c76e67ac86"],
        ])("should get correct bucket identifier `%s` for item `%s`", (bucketIdentifier, itemIdentifier) => {
            const bucketId = getBucketIdentifierByItemId(initialState, itemIdentifier);
            expect(bucketId).toEqual(bucketIdentifier);
        });
    });

    describe("getAttributeBucketItemsByRef", () => {
        const ref = uriRef("/uri0");
        const initialState = seedBuckets(getInitializedState(), [
            {
                localIdentifier: MEASURES,
                items: [],
            },
            {
                localIdentifier: ATTRIBUTE,
                items: [],
            },
        ]);

        it("should return an array of attributes with matching ref", () => {
            const state = seedBucketItems(initialState, 1, [
                {
                    type: ATTRIBUTE,
                    localIdentifier: "a1",
                    ref,
                },
                {
                    type: ATTRIBUTE,
                    localIdentifier: "a2",
                    ref,
                },
            ]);
            const result = getAttributeBucketItemsByRef(state, ref);

            expect(result).toMatchSnapshot();
        });

        it("should return an empty array when there are no attributes with matching ref", () => {
            const state = seedBucketItems(initialState, 1, [
                {
                    type: ATTRIBUTE,
                    localIdentifier: "a1",
                    ref: uriRef("/uri1"),
                },
            ]);
            const result = getAttributeBucketItemsByRef(state, ref);

            expect(result).toEqual([]);
        });
    });

    // `setBucketTotals(state, …)` died with its caller (the properties wrapper):
    // the guard and the write are value-level in buckets_totals_helpers.ts, and the whole
    // gesture (write + reference-point sync + md flag) is pinned by the properties
    // characterization suite through the real saga.
});
