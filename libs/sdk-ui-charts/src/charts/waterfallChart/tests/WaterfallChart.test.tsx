// (C) 2023-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { MeasureGroupIdentifier, newAttributeSort, newTwoDimensional } from "@gooddata/sdk-model";

import { CoreWaterfallChart } from "../CoreWaterfallChart.js";
import { WaterfallChart } from "../WaterfallChart.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreWaterfallChart", () => ({
    CoreWaterfallChart: vi.fn(() => null),
}));

describe("WaterfallChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(
            <WaterfallChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );
        const expectedDims = newTwoDimensional([MeasureGroupIdentifier], [ReferenceMd.Product.Name]);
        expect(CoreWaterfallChart).toHaveBeenCalledWith(
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

    it("should render WaterfallChart chart with multi measures", () => {
        render(
            <WaterfallChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount, ReferenceMd.Won]}
            />,
        );

        const expectedDims = newTwoDimensional([], [MeasureGroupIdentifier]);

        expect(CoreWaterfallChart).toHaveBeenCalledWith(
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
