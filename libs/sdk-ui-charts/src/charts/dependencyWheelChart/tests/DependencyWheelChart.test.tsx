// (C) 2023-2024 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { DependencyWheelChart } from "../DependencyWheelChart.js";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreDependencyWheelChart } from "../CoreDependencyWheelChart.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreDependencyWheelChart", () => ({
    CoreDependencyWheelChart: vi.fn(() => null),
}));

describe("DependencyWheelChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(
            <DependencyWheelChart
                workspace="foo"
                backend={dummyBackend()}
                measure={ReferenceMd.Amount}
                attributeFrom={ReferenceMd.Product.Name}
                attributeTo={ReferenceMd.Region.Default}
            />,
        );
        expect(CoreDependencyWheelChart).toHaveBeenCalled();
    });

    it("should render DependencyWheel chart and convert the buckets to AFM", () => {
        render(
            <DependencyWheelChart
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

        expect(CoreDependencyWheelChart).toHaveBeenCalledWith(
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
