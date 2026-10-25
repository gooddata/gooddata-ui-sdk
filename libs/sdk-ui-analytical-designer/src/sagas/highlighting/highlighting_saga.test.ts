// (C) 2019-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { ATTRIBUTE, DATE, FACT, MEASURES, METRIC, VIEW } from "../../constants/bucket.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { FilterBarService } from "../../store/filter_bar/filter_bar_service.js";
import {
    resetHighlightedBucketItems,
    resetHighlightedFilterItem,
    setAboutToBeRemovedBucketAndFilterItems,
    setHighlightedBucketItems,
    setHighlightedFilterItem,
} from "../../store/highlighting/highlighting_actions.js";
import { getAboutToBeRemovedBucketAndFilterItems } from "../../store/highlighting/highlighting_selector.js";
import { type IAppState } from "../../store/types.js";
import {
    countryAttribute,
    getBucketItemByLocalIdentifier,
    measureBucketItems as measureBucketItemsMock,
} from "../../tests/constants.test.helpers.js";
import { withUiConfig } from "../../tests/extended_reference_point_builder.test.helpers.js";
import { filterItems } from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import {
    startDragBucketItem,
    startDragCatalogItem,
    startDragFilterItem,
} from "../drag_and_drop/drag_and_drop_actions.js";

import { highlightingWatcher } from "./highlighting_saga.js";
import {
    type IHighlightingUiAction,
    highlightBucketAndFilterItems,
    highlightItemsToBeRemovedBySwap,
    highlightItemsToBeRemovedByTrash,
    resetHighlightedBucketAndFilterItems,
    resetHighlightedItemsToBeRemoved,
} from "./highlighting_ui_actions.js";

describe("Highlighting saga", () => {
    const buildStateWithComplexBuckets = (measureBucketItems = measureBucketItemsMock) =>
        withData(
            withData(FilterBarService.setFilterItems(getInitializedState(), filterItems), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: measureBucketItems,
                    },
                    {
                        localIdentifier: VIEW,
                        items: [countryAttribute],
                    },
                ],
            }),
            {
                extendedReferencePoint: withUiConfig(
                    FilterBarService.setFilterItems(getInitializedState(), filterItems).data
                        .extendedReferencePoint,
                    {
                        buckets: {
                            measures: {
                                accepts: [METRIC, ATTRIBUTE, FACT],
                            },
                            view_by: {
                                accepts: [ATTRIBUTE, DATE],
                            },
                        },
                    },
                ),
            },
        );

    async function dispatchAction(state: IAppState, action: IHighlightingUiAction) {
        const { storeState } = await expectSaga(highlightingWatcher)
            .withReducer(combinedRootReducer, state)
            .dispatch(action)
            .silentRun(0);
        return storeState;
    }

    describe("UI_DND_ITEM_ENTERED_TRASH_DROP_ZONE", () => {
        it("should not set about to be removed items in the app state when attribute filter is dragged to trash", async () => {
            const state = combinedRootReducer(
                buildStateWithComplexBuckets(),
                startDragFilterItem(filterItems[0]),
            );
            const testedAction = highlightItemsToBeRemovedByTrash();
            const reducedState = await dispatchAction(state, testedAction);

            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
        });

        it("should not set about to be removed items in the app state when measure value filter is dragged to trash", async () => {
            const state = combinedRootReducer(
                buildStateWithComplexBuckets(),
                startDragFilterItem(filterItems[3]),
            );
            const testedAction = highlightItemsToBeRemovedByTrash();
            const reducedState = await dispatchAction(state, testedAction);
            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
        });

        it("should not set about to be removed items in the app state when date filter is dragged to trash and there are no derived measures", async () => {
            const measures = measureBucketItemsMock.slice(0, 2);
            const state = combinedRootReducer(
                buildStateWithComplexBuckets(measures),
                startDragFilterItem(filterItems[1]),
            );
            const testedAction = highlightItemsToBeRemovedByTrash();
            const reducedState = await dispatchAction(state, testedAction);
            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
        });

        it("should set about to be removed items in the app state when date filter is dragged to trash and there are derived measures", async () => {
            const state = combinedRootReducer(
                buildStateWithComplexBuckets(),
                startDragFilterItem(filterItems[1]),
            );
            const testedAction = highlightItemsToBeRemovedByTrash();
            const reducedState = await dispatchAction(state, testedAction);
            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toEqual([
                "m3_pop",
                "m3_renamed_pop",
                "m3_previous_period",
                "m3_renamed_previous_period",
                "m5_previous_period",
                "m7_previous_period",
                "m1_pop",
                "m2_pop",
                "f4",
            ]);
        });

        it("should not set about to be removed items in the app state when nothing depends on item dragged to trash", async () => {
            const trashedMeasure = getBucketItemByLocalIdentifier("m8");
            const state = combinedRootReducer(
                buildStateWithComplexBuckets(),
                startDragBucketItem(trashedMeasure),
            );
            const testedAction = highlightItemsToBeRemovedByTrash();
            const reducedState = await dispatchAction(state, testedAction);
            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
        });

        it("should set about to be removed items in app state when derived and arithmetic measure depends on item dragged to trash", async () => {
            const trashedMeasure = getBucketItemByLocalIdentifier("m1");
            const state = combinedRootReducer(
                buildStateWithComplexBuckets(),
                startDragBucketItem(trashedMeasure),
            );
            const testedAction = highlightItemsToBeRemovedByTrash();
            const reducedState = await dispatchAction(state, testedAction);
            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toEqual([
                "m5",
                "m6",
                "m7",
                "m8",
                "m5_previous_period",
                "m7_previous_period",
                "m1_pop",
                "m12",
                "f1",
                "f6",
            ]);
        });
    });

    describe("UI_DND_ITEM_LEFT_TRASH_DROP_ZONE", () => {
        it("should reset about to be removed bucket items in app state", async () => {
            const setupAction = setAboutToBeRemovedBucketAndFilterItems(["m1"]);
            const state = combinedRootReducer(getInitializedState(), setupAction);

            const testedAction = resetHighlightedItemsToBeRemoved();
            const reducedState = await dispatchAction(state, testedAction);
            expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
        });
    });

    describe("catalog items", () => {
        const catalogItem: ICatalogEntry = {
            type: METRIC,
            attribute: "attr",
            identifier: "id",
        };

        const stateWithDraggedCatalogItem = combinedRootReducer(
            buildStateWithComplexBuckets(),
            startDragCatalogItem(catalogItem),
        );

        describe("UI_DND_CATALOG_ITEM_ENTERED_SWAP_DROP_ZONE", () => {
            it("should not set about to be removed items in the app state when nothing depends on replaced item", async () => {
                const replacedMeasure = getBucketItemByLocalIdentifier("m8");
                const testedAction = highlightItemsToBeRemovedBySwap(replacedMeasure);

                const reducedState = await dispatchAction(stateWithDraggedCatalogItem, testedAction);

                expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
            });

            it("should set local identifiers of about to be removed items in app state when derived and arithmetic measure depends on replaced item", async () => {
                const replacedMeasure = getBucketItemByLocalIdentifier("m1");
                const testedAction = highlightItemsToBeRemovedBySwap(replacedMeasure);

                const reducedState = await dispatchAction(stateWithDraggedCatalogItem, testedAction);

                expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toEqual([
                    "m5",
                    "m6",
                    "m7",
                    "m8",
                    "m5_previous_period",
                    "m7_previous_period",
                    "m1_pop",
                    "m12",
                    "f1",
                    "f6",
                ]);
            });
        });

        describe("UI_DND_CATALOG_ITEM_LEFT_SWAP_DROP_ZONE", () => {
            it("should reset about to be removed bucket items in app state", async () => {
                const setupAction = setAboutToBeRemovedBucketAndFilterItems(["m1"]);
                const state = combinedRootReducer(stateWithDraggedCatalogItem, setupAction);
                const testedAction = resetHighlightedItemsToBeRemoved();

                const reducedState = await dispatchAction(state, testedAction);

                expect(getAboutToBeRemovedBucketAndFilterItems(reducedState)).toBeUndefined();
            });
        });
    });

    describe("highlighted filterItem and bucketItem", () => {
        it("should set highlighted to specific string and call two set actions", async () => {
            const bucketItemId = "679687";
            const filterItemId = "70897-9078";
            const { effects } = await expectSaga(highlightingWatcher)
                .withState(getInitializedState())
                .dispatch(highlightBucketAndFilterItems([bucketItemId], filterItemId))
                .silentRun(0);

            expect(effects.put).toEqual([
                put(setHighlightedBucketItems([bucketItemId])),
                put(setHighlightedFilterItem(filterItemId)),
            ]);
        });
        it("should reset highlighted to default value and call two reset actions", async () => {
            const { effects } = await expectSaga(highlightingWatcher)
                .withState(getInitializedState())
                .dispatch(resetHighlightedBucketAndFilterItems())
                .silentRun(0);

            expect(effects.put).toEqual([
                put(resetHighlightedFilterItem()),
                put(resetHighlightedBucketItems()),
            ]);
        });
    });
});
