// (C) 2023-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { MeasureGroupIdentifier, newAttributeSort, newTwoDimensional } from "@gooddata/sdk-model";

import { CoreDependencyWheelChart } from "../CoreDependencyWheelChart.js";
import { DependencyWheelChart } from "../DependencyWheelChart.js";

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
