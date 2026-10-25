// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    applyMetricOverTimeShortcut,
    applyMetricPostponedShortcut,
    applyMetricShortcut,
    loadShortcutDateDatasets,
    shortcutDateDatasetsError,
    shortcutDateDatasetsUpdated,
    shortcutSetDroppedItem,
} from "../../actions/shortcuts_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { METRIC } from "../../constants/bucket.js";
import { LAST_4_QUARTERS } from "../../constants/presets.js";
import { LOCAL_COLUMN } from "../../constants/visualization_types.js";
import { buildBucketItem } from "../../models/bucket_item.js";
import { GRANULARITY } from "../../models/granularity.js";
import { save } from "../../models/item_cache.js";
import { getGranularityPresets } from "../../models/preset_item.js";
import { initialState } from "../../reducers/initial_state.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { getFilterBarState } from "../../store/filter_bar/filter_bar_selector.js";
import { FilterBarService } from "../../store/filter_bar/filter_bar_service.js";
import { defaultFilterBarState } from "../../store/filter_bar/filter_bar_state.js";
import { type IDateFilter } from "../../store/filter_bar/filter_bar_types.js";
import { withReplacedBucket } from "../../tests/buckets_builder.test.helpers.js";
import {
    barVisualizationClass,
    columnVisualizationClass,
    selectedDateDataSetRef,
    setupAppStateWithDateDatasetMeta,
    tableVisualizationClass,
} from "../../tests/constants.test.helpers.js";
import { dateDataSets, itemCache } from "../../tests/data_layer.test.helpers.js";
import { dispatchBucketsTrigger } from "../../tests/dispatch_buckets_trigger.test.utils.js";
import { withUiConfig } from "../../tests/extended_reference_point_builder.test.helpers.js";
import { withData, withShortcut } from "../../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../../tests/visualization_class.test.helpers.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type IAppState } from "../types.js";

// Driven through the REAL saga: the SHORTCUT_APPLY_* triggers write nothing by
// themselves — the shortcut operations compute the gesture and the owning slices consume the
// semantic events, so every spec runs trigger → saga → event → mounts.
const shortcutsReducer = (
    state: IAppState,
    action: Parameters<typeof dispatchBucketsTrigger>[1],
): IAppState => dispatchBucketsTrigger(state, action);

function setVisualizationClass(state: IAppState, url: string) {
    return withData(state, {
        visualizationClass: visualizationClassMock(url),
    });
}

describe("shortcuts store", () => {
    const stateWithCache = save(initialState, itemCache);
    const stateWithDateDatasetMeta = setupAppStateWithDateDatasetMeta(stateWithCache);
    const preparedState = withData(
        withData(
            withData(
                withData(stateWithDateDatasetMeta, {
                    buckets: withReplacedBucket(stateWithDateDatasetMeta.data.buckets, 0, {
                        localIdentifier: "measures",
                        items: [buildBucketItem({ type: "metric", attribute: "aaeb7jTCfexV" })],
                    }),
                }),
                {
                    buckets: withReplacedBucket(
                        withData(stateWithDateDatasetMeta, {
                            buckets: withReplacedBucket(stateWithDateDatasetMeta.data.buckets, 0, {
                                localIdentifier: "measures",
                                items: [buildBucketItem({ type: "metric", attribute: "aaeb7jTCfexV" })],
                            }),
                        }).data.buckets,
                        1,
                        {
                            localIdentifier: "view",
                            items: [
                                {
                                    dateDataseRef: {
                                        uri: "activity",
                                    },
                                    type: "date",
                                    localIdentifier: "5decb55540534bc8ad147a5afd5e0794",
                                },
                            ],
                        },
                    ),
                },
            ),
            {
                visualizationClasses: [
                    tableVisualizationClass,
                    barVisualizationClass,
                    columnVisualizationClass,
                ],
            },
        ),
        {
            extendedReferencePoint: withUiConfig(stateWithDateDatasetMeta.data.extendedReferencePoint, {
                buckets: {
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

    describe("date datasets", () => {
        describe("loaded flag", () => {
            it("should be false before load", () => {
                const action = loadShortcutDateDatasets();
                const updatedState = shortcutsReducer(stateWithCache, action);
                expect(updatedState.data.shortcut.shortcutDateDatasets.loaded).toEqual(false);
            });

            it("should be true after load", () => {
                const action = shortcutDateDatasetsUpdated(dateDataSets);
                const updatedState = shortcutsReducer(stateWithCache, action);
                expect(updatedState.data.shortcut.shortcutDateDatasets.loaded).toEqual(true);
            });
        });

        it("should set available date datasets (as plain values)", () => {
            const action = shortcutDateDatasetsUpdated(dateDataSets);
            const updatedState = shortcutsReducer(stateWithCache, action);
            expect(updatedState.data.shortcut.shortcutDateDatasets.available).toEqual(dateDataSets.available);
        });

        it("should store the load error and flag the load as finished", () => {
            const error = new Error("load failed");
            const updatedState = shortcutsReducer(stateWithCache, shortcutDateDatasetsError(error));

            expect(updatedState.data.shortcut.shortcutDateDatasets.error).toBe(error);
            expect(updatedState.data.shortcut.shortcutDateDatasets.loaded).toEqual(true);
        });

        it("should clear a previous error on a successful load", () => {
            const withError = shortcutsReducer(stateWithCache, shortcutDateDatasetsError(new Error("x")));
            const updatedState = shortcutsReducer(withError, shortcutDateDatasetsUpdated(dateDataSets));

            expect(updatedState.data.shortcut.shortcutDateDatasets.error).toEqual(null);
        });
    });

    describe(`#${ActionTypeKeys.SHORTCUT_SET_DROPPED_ITEM}`, () => {
        // a leaf case (shortcut_dropped_item_reducer.ts), so the trigger is driven through the
        // real root chain
        it("should park the dropped catalog item", () => {
            const catalogItem = { identifier: "xixao", type: METRIC };
            const updatedState = rootReducer(
                stateWithCache,
                shortcutSetDroppedItem(catalogItem as Parameters<typeof shortcutSetDroppedItem>[0]),
            );

            expect(updatedState.data.shortcut.shortcutDroppedItem).toEqual(catalogItem);
        });
    });

    describe("Apply Metric", () => {
        describe("with Column not selected", () => {
            const item = { identifier: "xixao", type: METRIC } as ICatalogEntry;
            const action = applyMetricShortcut(item);
            const updatedState = shortcutsReducer(preparedState, action);

            it("should not add new item into Metrics", () => {
                expect(updatedState.data.buckets[0].items).toHaveLength(1);
                expect(updatedState.data.buckets[0].items[0].attribute).toEqual("aaeb7jTCfexV");
            });

            it("should change visualisation class to column", () => {
                expect(updatedState.data.visualizationClass.visualizationClass.url).toEqual(LOCAL_COLUMN);
            });

            it("should store new postoponed action", () => {
                expect(updatedState.data.postponedAction.type).toEqual(
                    ActionTypeKeys.SHORTCUT_APPLY_METRIC_POSTPONED,
                );

                // the parked value IS the action — payload BY REFERENCE, so the
                // replay re-puts exactly what a real drag would have carried
                expect(updatedState.data.postponedAction.payload).toBe(item);
            });
        });

        describe("with Column selected", () => {
            const item = { identifier: "xixao", type: METRIC } as ICatalogEntry;
            const action = applyMetricShortcut(item);
            const withColumnSelected = setVisualizationClass(preparedState, LOCAL_COLUMN);
            const updatedState = shortcutsReducer(withColumnSelected, action);

            it("should add new item into Metrics", () => {
                expect(updatedState.data.buckets[0].items).toHaveLength(2);
                expect(updatedState.data.buckets[0].items[1].attribute).toEqual("xixao");
            });

            it("should not store new postoponed action", () => {
                expect(updatedState.data.postponedAction).toBeNull();
            });
        });
    });

    describe("Apply Metric Postponed", () => {
        const item = { identifier: "xixao", type: METRIC } as ICatalogEntry;
        const action = applyMetricPostponedShortcut(item);
        const updatedState = shortcutsReducer(preparedState, action);

        it("should add new item into Metrics", () => {
            expect(updatedState.data.buckets[0].items).toHaveLength(2);
            expect(updatedState.data.buckets[0].items[1].attribute).toEqual("xixao");
        });
    });

    describe("Apply Metric Over Time", () => {
        describe("with available date", () => {
            const catalogItem = { identifier: "aaeb7jTCfexV", type: METRIC } as ICatalogEntry;
            const action = applyMetricOverTimeShortcut(catalogItem);
            const stateWithAvailableDateDataSets = withData(
                withShortcut(
                    withShortcut(withData(preparedState, { visualizationClass: columnVisualizationClass }), {
                        shortcutDroppedItem: catalogItem,
                    }),
                    { shortcutDateDatasets: { loaded: true, error: null, ...dateDataSets } },
                ),
                {
                    dateDatasets: {
                        ...withShortcut(
                            withShortcut(
                                withData(preparedState, { visualizationClass: columnVisualizationClass }),
                                { shortcutDroppedItem: catalogItem },
                            ),
                            { shortcutDateDatasets: { loaded: true, error: null, ...dateDataSets } },
                        ).data.dateDatasets,
                        available: [selectedDateDataSetRef],
                    },
                },
            );

            const stateWithFilterBar = FilterBarService.setFilterBarState(
                stateWithAvailableDateDataSets,
                defaultFilterBarState,
            );

            const updatedState = shortcutsReducer(stateWithFilterBar, action);

            it("should add date category with granularity set to quarter", () => {
                expect(updatedState.data.buckets[1].items[0].granularity).toEqual(GRANULARITY.QUARTER);
            });

            it("should add date filter with last four quarters set", () => {
                const filterConfig = (getFilterBarState(updatedState).items[0] as IDateFilter).filterConfig;
                const preset4quarters = getGranularityPresets(LAST_4_QUARTERS);
                expect(filterConfig).toEqual(preset4quarters);
            });

            it("should change visualization class to column", () => {
                expect(updatedState.data.visualizationClass.visualizationClass.url).toEqual(LOCAL_COLUMN);
            });

            it("should reset dropped item", () => {
                expect(updatedState.data.shortcut.shortcutDroppedItem).toEqual(null);
            });

            it("should set reference point from buckets", () => {
                expect(updatedState.data.buckets).toEqual(updatedState.data.referencePoint.buckets);
            });

            it("should select correct date dataset", () => {
                expect(updatedState.data.buckets[1].items[0].dateDatasetRef).toEqual(
                    dateDataSets.available[0].ref,
                );
            });

            it("should copy the available datasets into the dateDatasets subtree", () => {
                expect(updatedState.data.dateDatasets.available).toEqual(dateDataSets.available);
            });
        });

        describe("without available date", () => {
            const catalogItem = { identifier: "aaeb7jTCfexV", type: METRIC } as ICatalogEntry;
            const action = applyMetricOverTimeShortcut(catalogItem);
            const stateWithDroppedItem = withShortcut(preparedState, { shortcutDroppedItem: catalogItem });

            const updatedState = shortcutsReducer(stateWithDroppedItem, action);

            it("should change visualization class to column", () => {
                expect(updatedState.data.visualizationClass.visualizationClass.url).toEqual(LOCAL_COLUMN);
            });

            it("should reset dropped item", () => {
                expect(updatedState.data.shortcut.shortcutDroppedItem).toEqual(null);
            });
        });
    });
});
