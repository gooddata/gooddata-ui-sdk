// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { ATTRIBUTE, DATE, FACT, METRIC } from "../constants/bucket.js";
import { buildBucketItem } from "../models/bucket_item.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { startDragCatalogItem } from "../sagas/drag_and_drop/drag_and_drop_actions.js";
import { type IAppState } from "../store/types.js";
import { withBucketItems } from "../tests/buckets_builder.test.helpers.js";
import {
    columnVisualizationClass,
    dateCreated,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

import {
    displayAttributeSelector,
    displayBlockSelector,
    displayMetricOverTimeSelector,
    displayMetricSelector,
    isReportEmptySelector,
} from "./shortcuts_selector.js";

describe("Shortcuts selector", () => {
    const initialState = getInitializedState();
    let preparedState: IAppState;

    const dragCatalogItem = (props: Parameters<typeof buildBucketItem>[0]) =>
        buildBucketItem(props) as unknown as ICatalogEntry;

    function setDraggedCatalogItem(state: IAppState, item: ICatalogEntry) {
        const startDragCatalogItemAction = startDragCatalogItem(item);
        return rootReducer(state, startDragCatalogItemAction);
    }

    beforeEach(() => {
        preparedState = withData(
            withData(initialState, {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [],
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
            }),
            { visualizationClasses: [columnVisualizationClass, tableVisualizationClass] },
        );
    });

    describe("isReportEmptySelector", () => {
        it("should return true by default", () => {
            expect(isReportEmptySelector(initialState)).toEqual(true);
        });

        it("should return false if there is an Item in Metrics bucket", () => {
            const state = withData(preparedState, {
                buckets: withBucketItems(preparedState.data.buckets, 0, [buildBucketItem({})]),
            });

            expect(isReportEmptySelector(state)).toEqual(false);
        });

        it("should return false if there is an Item in Categories bucket", () => {
            const state = withData(preparedState, {
                buckets: withBucketItems(preparedState.data.buckets, 1, [buildBucketItem({})]),
            });

            expect(isReportEmptySelector(state)).toEqual(false);
        });

        it("should return false if there is an Item in Stacks bucket", () => {
            const state = withData(preparedState, {
                buckets: withBucketItems(preparedState.data.buckets, 2, [buildBucketItem({})]),
            });

            expect(isReportEmptySelector(state)).toEqual(false);
        });
    });

    describe("activeDragItemSelector", () => {
        it("should be false if dragItem is not set", () => {
            expect(displayAttributeSelector(initialState)).toEqual(false);
        });

        it("should be true if dragItem is set", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: ATTRIBUTE }));
            expect(displayAttributeSelector(state)).toEqual(true);
        });

        it("should be false if dragItem is set and table is deprecated", () => {
            const state = setDraggedCatalogItem(initialState, dragCatalogItem({ type: ATTRIBUTE }));
            expect(displayAttributeSelector(state)).toEqual(false);
        });
    });

    describe("displayAttributeSelector", () => {
        it("should be false if report and dragItem are empty", () => {
            expect(displayAttributeSelector(initialState)).toEqual(false);
        });

        it("should be false if report is not empty", () => {
            const state = withData(setDraggedCatalogItem(initialState, dragCatalogItem({})), {
                buckets: withBucketItems(
                    setDraggedCatalogItem(initialState, dragCatalogItem({})).data.buckets,
                    0,
                    [buildBucketItem({})],
                ),
            });
            expect(displayAttributeSelector(state)).toEqual(false);
        });

        it("should be true if report is empty and activeDragItem is set to attribute", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: ATTRIBUTE }));
            expect(displayAttributeSelector(state)).toEqual(true);
        });

        it("should be false if report is empty, activeDragItem is set to attribute and table is deprecated", () => {
            const state = setDraggedCatalogItem(initialState, dragCatalogItem({ type: ATTRIBUTE }));
            expect(displayAttributeSelector(state)).toEqual(false);
        });

        it("should be true if report is empty and activeDragItem is set to date", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: DATE }));
            expect(displayAttributeSelector(state)).toEqual(true);
        });

        it("should be false if report is empty and activeDragItem is set to metric", () => {
            const state = setDraggedCatalogItem(initialState, dragCatalogItem({ type: METRIC }));
            expect(displayAttributeSelector(state)).toEqual(false);
        });

        it("should be false if report is empty and activeDragItem is set to fact", () => {
            const state = setDraggedCatalogItem(initialState, dragCatalogItem({ type: FACT }));
            expect(displayAttributeSelector(state)).toEqual(false);
        });
    });

    describe("displayMetricSelector", () => {
        it("should be false if report and dragItem are empty", () => {
            expect(displayMetricSelector(initialState)).toEqual(false);
        });

        it("should be false if report is empty, activeDragItem is set to metric and column is deprecated", () => {
            const state = setDraggedCatalogItem(initialState, dragCatalogItem({ type: METRIC }));
            expect(displayMetricSelector(state)).toEqual(false);
        });

        it("should be false if report is not empty", () => {
            const state = withData(setDraggedCatalogItem(initialState, dragCatalogItem({})), {
                buckets: withBucketItems(
                    setDraggedCatalogItem(initialState, dragCatalogItem({})).data.buckets,
                    0,
                    [buildBucketItem({})],
                ),
            });
            expect(displayMetricSelector(state)).toEqual(false);
        });

        it("should be false if report is empty and activeDragItem is set to attribute", () => {
            const state = setDraggedCatalogItem(initialState, dragCatalogItem({ type: ATTRIBUTE }));
            expect(displayMetricSelector(state)).toEqual(false);
        });

        it("should be true if report is empty and activeDragItem is set to metric", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: METRIC }));
            expect(displayMetricSelector(state)).toEqual(true);
        });

        it("should be true if report is empty and activeDragItem is set to fact", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: FACT }));
            expect(displayMetricSelector(state)).toEqual(true);
        });
    });

    describe("displayBlockSelector", () => {
        it("should be false by default", () => {
            expect(displayBlockSelector(initialState)).toEqual(false);
        });

        it("should be false if report is empty, activeDragItem is set and column or table is deprecated", () => {
            const state = setDraggedCatalogItem(initialState, dragCatalogItem({ type: METRIC }));
            expect(displayBlockSelector(state)).toEqual(false);
        });

        it("should be true if report is empty and activeDragItem is set to attribute", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: ATTRIBUTE }));
            expect(displayBlockSelector(state)).toEqual(true);
        });

        it("should be true if report is empty and activeDragItem is set to metric", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: METRIC }));
            expect(displayBlockSelector(state)).toEqual(true);
        });

        it("should be true if report is empty and activeDragItem is set to fact", () => {
            const state = setDraggedCatalogItem(preparedState, dragCatalogItem({ type: FACT }));
            expect(displayBlockSelector(state)).toEqual(true);
        });
    });

    describe("displayMetricOverTimeSelector", () => {
        it("should be false by default", () => {
            expect(displayMetricOverTimeSelector(initialState)).toEqual(false);
        });

        // the updater spreads rather than pushing: the stored array is immer-frozen, so `.push`
        // would throw and would return a length rather than the array
        it("should be false if report is empty, date datasets are available & dragging item is metric & column chart is deprecated", () => {
            const state = withData(setDraggedCatalogItem(initialState, dragCatalogItem({ type: METRIC })), {
                dateDatasets: {
                    ...initialState.data.dateDatasets,
                    available: [
                        ...initialState.data.dateDatasets.available,
                        { ...dateCreated, id: "another.dataset" },
                    ],
                },
            });
            expect(displayMetricOverTimeSelector(state)).toEqual(false);
        });

        it("should be true if report is empty, date datasets are available & dragging item is metric", () => {
            const state = withData(setDraggedCatalogItem(preparedState, dragCatalogItem({ type: METRIC })), {
                dateDatasets: {
                    ...preparedState.data.dateDatasets,
                    available: [
                        ...preparedState.data.dateDatasets.available,
                        { ...dateCreated, id: "another.dataset" },
                    ],
                },
            });
            expect(displayMetricOverTimeSelector(state)).toEqual(true);
        });
    });
});
