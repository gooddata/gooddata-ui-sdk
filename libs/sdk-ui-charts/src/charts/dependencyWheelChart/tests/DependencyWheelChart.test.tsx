// (C) 2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { DependencyWheelChart } from "../DependencyWheelChart";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreDependencyWheelChart } from "../CoreDependencyWheelChart";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreDependencyWheelChart", () => ({
    CoreDependencyWheelChart: jest.fn(() => null),
}));

describe("DependencyWheelChart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(
            <DependencyWheelChart
                workspace="foo"
                backend={dummyBackend()}
                measure={ReferenceMd.Amount}
                attributeFrom={ReferenceMd.Product.Name}
                attributeTo={ReferenceMd.Region}
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
                attributeTo={ReferenceMd.Region}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [MeasureGroupIdentifier],
            [ReferenceMd.Product.Name, ReferenceMd.Region],
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
