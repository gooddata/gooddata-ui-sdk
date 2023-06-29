// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { LineChart } from "../LineChart.js";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import { CoreLineChart } from "../CoreLineChart.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreLineChart", () => ({
    CoreLineChart: vi.fn(() => null),
}));

describe("LineChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(<LineChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />);
        expect(CoreLineChart).toHaveBeenCalled();
    });

    it("should render line chart and convert the buckets to AFM", () => {
        render(
            <LineChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                trendBy={ReferenceMd.DateDatasets.Created.QuarterYear.USShort}
                segmentBy={ReferenceMd.Region}
                sortBy={[newAttributeSort(ReferenceMd.DateDatasets.Created.QuarterYear.USShort, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [ReferenceMd.Region],
            [ReferenceMd.DateDatasets.Created.QuarterYear.USShort, MeasureGroupIdentifier],
        );

        expect(CoreLineChart).toHaveBeenCalledWith(
            expect.objectContaining({
                execution: expect.objectContaining({
                    definition: expect.objectContaining({
                        dimensions: expectedDims,
                    }),
                }),
            }),
            expect.anything(),
        );
    });
});
