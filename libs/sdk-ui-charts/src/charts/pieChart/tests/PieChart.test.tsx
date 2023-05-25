// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { PieChart } from "../PieChart.js";
import { newAttributeSort, MeasureGroupIdentifier, newTwoDimensional } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CorePieChart } from "../CorePieChart.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CorePieChart", () => ({
    CorePieChart: vi.fn(() => null),
}));

describe("PieChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(<PieChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />);
        expect(CorePieChart).toHaveBeenCalled();
    });

    it("should render pie chart and convert the buckets to AFM", () => {
        render(
            <PieChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional([MeasureGroupIdentifier], [ReferenceMd.Product.Name]);

        expect(CorePieChart).toHaveBeenCalledWith(
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
