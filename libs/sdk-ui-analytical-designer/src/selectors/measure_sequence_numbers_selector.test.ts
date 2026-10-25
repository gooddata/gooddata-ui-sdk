// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { getMeasureSequenceNumbers } from "./measure_sequence_numbers_selector.js";

describe("Measure sequence numbers selector test", () => {
    it("should return all selected data", () => {
        const selected = getMeasureSequenceNumbers(initialState);

        expect(selected).toEqual(expect.any(Object));
    });

    it("should return empty map when buckets are empty", () => {
        const updatedState = withData(initialState, { buckets: [] });
        const measureSequenceNumbers = getMeasureSequenceNumbers(updatedState);
        expect(measureSequenceNumbers).toEqual({});
    });

    it("should return map for measure bucket items with sequence number indexed from the first to the last", () => {
        const buckets = [
            {
                localIdentifier: "primaryMeasures",
                items: [
                    {
                        localIdentifier: "measure1",
                        type: "metric",
                    },
                    {
                        localIdentifier: "measure3",
                        type: "metric",
                    },
                    {
                        localIdentifier: "measure2",
                        type: "metric",
                    },
                ],
            },
            {
                localIdentifier: "viewBy",
                items: [
                    {
                        localIdentifier: "attribute1",
                        type: "attribute",
                    },
                    {
                        localIdentifier: "attribute2",
                        type: "date",
                    },
                ],
            },
            {
                localIdentifier: "secondaryMeasures",
                items: [
                    {
                        localIdentifier: "measure4",
                        type: "metric",
                    },
                    {
                        localIdentifier: "derived.measure6",
                        type: "metric",
                        masterLocalIdentifier: "measure3",
                    },
                    {
                        localIdentifier: "derived.measure5",
                        type: "metric",
                        masterLocalIdentifier: "measure4",
                    },
                    {
                        localIdentifier: "7measure",
                        type: "metric",
                    },
                ],
            },
        ];
        const updatedState = withData(initialState, { buckets: buckets });
        const measureSequenceNumbers = getMeasureSequenceNumbers(updatedState);
        expect(measureSequenceNumbers).toEqual({
            measure1: 1,
            measure3: 2,
            measure2: 3,
            measure4: 4,
            "derived.measure6": 5,
            "derived.measure5": 6,
            "7measure": 7,
        });
    });
});
