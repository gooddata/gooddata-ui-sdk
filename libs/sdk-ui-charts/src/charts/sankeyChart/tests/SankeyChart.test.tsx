// (C) 2023-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { MeasureGroupIdentifier, newAttributeSort, newTwoDimensional } from "@gooddata/sdk-model";

import { CoreSankeyChart } from "../CoreSankeyChart.js";
import { SankeyChart } from "../SankeyChart.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreSankeyChart", () => ({
    CoreSankeyChart: vi.fn(() => null),
}));

describe("SankeyChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(
            <SankeyChart
                workspace="foo"
                backend={dummyBackend()}
                measure={ReferenceMd.Amount}
                attributeFrom={ReferenceMd.Product.Name}
                attributeTo={ReferenceMd.Region.Default}
            />,
        );
        expect(CoreSankeyChart).toHaveBeenCalled();
    });

    it("should render Sankey chart and convert the buckets to AFM", () => {
        render(
            <SankeyChart
                workspace="foo"
                backend={dummyBackend()}
                measure={ReferenceMd.Amount}
                attributeFrom={ReferenceMd.Product.Name}
                attributeTo={ReferenceMd.Region.Default}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [MeasureGroupIdentifier],
            [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
        );

        expect(CoreSankeyChart).toHaveBeenCalledWith(
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
