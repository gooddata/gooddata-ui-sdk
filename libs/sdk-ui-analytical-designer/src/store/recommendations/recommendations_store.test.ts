// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { type ICatalogAttribute, type ObjRef, uriRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { LOCAL_BAR } from "../../constants/visualization_types.js";
import { buildBucketItem } from "../../models/bucket_item.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { GRANULARITY } from "../../models/granularity.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { getPrimaryDateDataset } from "../../services/buckets_service.js";
import { PluggableVisualizationService } from "../../services/pluggable_visualization_service.js";
import { withBucketItems } from "../../tests/buckets_builder.test.helpers.js";
import {
    barVisualizationClass,
    dateDatasetsAvailable,
    setupAppStateWithDateDatasetMeta,
    tableVisualizationClass,
} from "../../tests/constants.test.helpers.js";
import { withUiConfig } from "../../tests/extended_reference_point_builder.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { dispatchAction } from "../../utils/dispatch_action.js";
import { setCatalogItems, setCatalogItemsAvailability } from "../catalog/catalog_store_actions.js";
import { dateFilterExists, getFilterItems, getFirstDateFilter } from "../filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../filter_bar/filter_bar_service.js";

import {
    applyComparison,
    applyComparisonWithPeriod,
    applyContributionInPercents,
    applyFiltering,
    applyMetricWithPeriod,
    applyTrending,
    dismissRecommendations,
    storeDismissRecommendations,
} from "./recommendations_actions.js";
import { getDismissedRecommendations } from "./recommendations_selector.js";

const DATE_DATASET_IDENTIFIER = "date.dataset.dt";
const DATE_DATASET_REF: ObjRef = { identifier: "activity.dataset.dt" };

describe("Recommendations Reducer tests", () => {
    // dismissRecommendations runs its real saga, which persists the list to localStorage — shared by
    // every test file in the worker (the suite runs non-isolated). The dismissed list is seeded FROM
    // localStorage when recommendations_state.ts is first evaluated, so a key left behind here
    // silently changes the initial state of every file that runs after this one.
    afterEach(() => {
        localStorage.removeItem("dismissedRecommendations");
    });

    const measure = buildBucketItem({ type: "metric" });
    const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(getInitializedState());
    const preparedState = withData(
        withData(
            withData(stateWithDateDatasetMeta, {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [measure],
                    },
                    {
                        localIdentifier: "view",
                        items: [
                            {
                                attribute: DATE_DATASET_ATTRIBUTE,
                                filters: [{}],
                                dateDatasetRef: { identifier: "activity.dataset.dt" },
                                type: "date",
                            },
                        ],
                    },
                ],
            }),
            { visualizationClasses: [tableVisualizationClass, barVisualizationClass] },
        ),
        {
            extendedReferencePoint: withUiConfig(stateWithDateDatasetMeta.data.extendedReferencePoint, {
                buckets: // seeded PLAIN — the extended reference point flipped
                    {
                        measures: {
                            accepts: ["metric", "fact", "attribute"],
                        },
                        view: {
                            accepts: ["attribute", "date"],
                        },
                        filters: {
                            accepts: ["attribute", "date"],
                        },
                    },
            }),
        },
    );

    const derivedMeasure = {
        ...buildBucketItem({ type: "metric" }),
        masterLocalIdentifier: measure.localIdentifier,
    };
    const preparedStateWithDerivedMeasure = withData(preparedState, {
        buckets: withBucketItems(preparedState.data.buckets, 0, [derivedMeasure, measure]),
    });

    describe("Apply Comparison With Period", () => {
        const granularity = GRANULARITY.MONTH;
        const action = applyComparisonWithPeriod(granularity);

        it("should set SP over time comparison type to date filter", async () => {
            const state = await dispatchAction(preparedState, action);
            const dateFilter = getFirstDateFilter(state);
            expect(dateFilter.overTimeComparisonType).toEqual(
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );
        });

        it("should add new date item into Filters", async () => {
            const state = await dispatchAction(preparedState, action);
            expect(dateFilterExists(state)).toEqual(true);
        });

        it("should set granularity", async () => {
            const state = await dispatchAction(preparedState, action);
            const dateFilter = getFirstDateFilter(state);
            expect(dateFilter.filterConfig.granularity).toEqual(granularity);
        });

        it("should set PoP", async () => {
            const state = await dispatchAction(preparedState, action);
            expect(state.data.buckets[0].items).toHaveLength(1);
            expect(PluggableVisualizationService.getNewDerivedBucketItems(state)).toHaveLength(1);
        });

        it("should not duplicate filter", async () => {
            const stateWithFilter = FilterBarService.addFilter(
                preparedState,
                FilterBarService.createDateFilter(DATE_DATASET_REF),
            );
            const state = await dispatchAction(stateWithFilter, action);
            expect(getFilterItems(state).length).toEqual(1);
        });

        it("should set reference point from buckets", async () => {
            const state = await dispatchAction(preparedState, action);
            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
        });
    });

    describe("Apply Contribution In Percent", () => {
        describe("insight with single measure", () => {
            const action = applyContributionInPercents();

            it("should set showInPercent flag", async () => {
                const state = await dispatchAction(preparedState, action);
                expect(state.data.buckets[0].items[0].showInPercent).toEqual(true);
            });

            it("should set visualisation type to bar", async () => {
                const state = await dispatchAction(preparedState, action);
                expect(state.data.visualizationClass.visualizationClass.url).toEqual(LOCAL_BAR);
            });

            it("should set reference point from buckets", async () => {
                const state = await dispatchAction(preparedState, action);
                expect(state.data.buckets).toEqual(state.data.referencePoint.buckets);
            });
        });

        describe("insight with pop measures", () => {
            it("should find first master measure and set showInPercent on both the master and its derived measures", async () => {
                const action = applyContributionInPercents();
                const newState = await dispatchAction(preparedStateWithDerivedMeasure, action);
                const measuresBucketItems = newState.data.buckets[0].items;
                expect(measuresBucketItems?.[0]?.showInPercent).toEqual(true);
                expect(measuresBucketItems?.[1]?.showInPercent).toEqual(true);
            });
        });
    });

    describe("Apply Metric With Period", () => {
        const action = applyMetricWithPeriod();
        const stateWithDateFilter = FilterBarService.addFilter(
            preparedState,
            FilterBarService.createDateFilter(DATE_DATASET_REF),
        );

        it("should set PoP", async () => {
            const state = await dispatchAction(stateWithDateFilter, action);
            expect(state.data.buckets[0].items).toHaveLength(1);
            expect(PluggableVisualizationService.getNewDerivedBucketItems(state)).toHaveLength(1);
        });

        it("should set SP over time comparison type to date filter", async () => {
            const state = await dispatchAction(stateWithDateFilter, action);
            const dateFilter = getFirstDateFilter(state);
            expect(dateFilter.overTimeComparisonType).toEqual(
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            );
        });

        it("should set reference point from buckets", async () => {
            const state = await dispatchAction(stateWithDateFilter, action);
            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
        });
    });

    describe("Apply Trending", () => {
        const granularity = GRANULARITY.MONTH;
        const action = applyTrending(granularity);
        const dateDataset = {
            ...dateDatasetsAvailable[0],
            identifier: DATE_DATASET_IDENTIFIER,
        };
        const updatedPreparedState = withData(preparedState, {
            dateDatasets: { ...preparedState.data.dateDatasets, available: [dateDataset] },
        });

        it("should add new date into Category bucket", async () => {
            const state = await dispatchAction(updatedPreparedState, action);
            expect(state.data.buckets[1].items).toHaveLength(1);
        });

        it("should set Category date item granularity", async () => {
            const state = await dispatchAction(updatedPreparedState, action);
            expect(state.data.buckets[1].items[0].granularity).toEqual(granularity);
        });

        it("should add new date into Filters bucket", async () => {
            const state = await dispatchAction(updatedPreparedState, action);
            expect(dateFilterExists(state)).toEqual(true);
        });

        it("should set Filter date item granularity to quarter", async () => {
            const state = await dispatchAction(updatedPreparedState, action);
            const dateFilter = getFirstDateFilter(state);
            expect(dateFilter.filterConfig.granularity).toEqual(GRANULARITY.QUARTER);
        });

        it("should set available date dataset", async () => {
            const state = await dispatchAction(updatedPreparedState, action);
            expect(getPrimaryDateDataset(state)).toEqual(dateDataset);
        });

        it("should not duplicate date in categories", async () => {
            const stateWithCategoryDate = withData(updatedPreparedState, {
                buckets: withBucketItems(updatedPreparedState.data.buckets, 0, [buildBucketItem({})]),
            });

            const modifiedState = await dispatchAction(stateWithCategoryDate, action);
            expect(modifiedState.data.buckets[1].items).toHaveLength(1);
        });

        it("should not duplicate date in filters", async () => {
            const stateWithFilterDate = FilterBarService.addFilter(
                updatedPreparedState,
                FilterBarService.createDateFilter(DATE_DATASET_REF),
            );
            const modifiedState = await dispatchAction(stateWithFilterDate, action);
            expect(getFilterItems(modifiedState).length).toEqual(1);
        });

        it("should keep selected date unmodified", async () => {
            const stateWithDateFilter = FilterBarService.addFilter(
                withData(updatedPreparedState, {
                    buckets: withBucketItems(updatedPreparedState.data.buckets, 0, [
                        buildBucketItem({ type: "metric" }),
                    ]),
                }),
                FilterBarService.createDateFilter(DATE_DATASET_REF),
            );
            const modifiedState = await dispatchAction(stateWithDateFilter, action);
            expect(getPrimaryDateDataset(modifiedState)).toEqual(dateDataset);
        });

        it("should set reference point from buckets", async () => {
            const state = await dispatchAction(updatedPreparedState, action);
            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
        });
    });

    describe("Apply Comparison", () => {
        const action = applyComparison({
            identifier: "attrId",
        });

        it("should fail if catalog item hasn't been found", async () => {
            await dispatchAction(preparedState, action);
        });

        it("should add item to category bucket", async () => {
            const catalogItem = {
                type: "attribute",
                attribute: {
                    type: "attribute",
                    ref: {
                        identifier: "attrId",
                    },
                    uri: "attrUri",
                    id: "attrId",
                },
                defaultDisplayForm: {
                    ref: uriRef("attribute/displayForm/uri"),
                },
                groups: [],
            } as ICatalogAttribute;
            const setCatalogItemsAction = setCatalogItems([catalogItem]);
            let state = await dispatchAction(preparedState, setCatalogItemsAction);
            const setCatalogItemsAvailabilityAction = setCatalogItemsAvailability(["attrUri"]);
            state = await dispatchAction(state, setCatalogItemsAvailabilityAction);

            state = await dispatchAction(state, action);

            const items = state.data.buckets[1].items.filter((item) => item?.attribute === "attrId");

            expect(items).toHaveLength(1);
            expect(state.data.referencePoint.buckets).toEqual(state.data.buckets);
        });
    });

    describe("Filtering recommendation", () => {
        it("should open filter dropdown", async () => {
            expect(preparedState.data.filterBar.filterBarDropdownOpen).toEqual(false);
            const state = await dispatchAction(preparedState, applyFiltering());
            expect(state.data.filterBar.filterBarDropdownOpen).toEqual(true);
        });

        it("should dismiss recommendations", async () => {
            expect(getDismissedRecommendations(preparedState)).toEqual([]);
            const state = await dispatchAction(preparedState, dismissRecommendations("pie"));
            expect(getDismissedRecommendations(state)).toEqual(["pie"]);
        });
    });

    describe("dismissed recommendations slice", () => {
        it("should append dismissed visualization classes and dedup them", () => {
            let state = combinedRootReducer(getInitializedState(), storeDismissRecommendations("pie"));
            state = combinedRootReducer(state, storeDismissRecommendations("donut"));
            state = combinedRootReducer(state, storeDismissRecommendations("pie"));

            expect(getDismissedRecommendations(state)).toEqual(["pie", "donut"]);
        });

        it("should keep the root reference on unrelated actions (liftSlice identity short-circuit)", () => {
            const state = getInitializedState();

            expect(combinedRootReducer(state, { type: "SOME/UNRELATED_ACTION" })).toBe(state);
        });
    });
});
