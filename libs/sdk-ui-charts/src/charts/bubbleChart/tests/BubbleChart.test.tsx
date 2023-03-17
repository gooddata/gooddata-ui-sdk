// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { BubbleChart } from "../BubbleChart";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreBubbleChart } from "../CoreBubbleChart";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreBubbleChart", () => ({
    CoreBubbleChart: jest.fn(() => null),
}));

describe("BubbleChart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(<BubbleChart workspace="foo" backend={dummyBackend()} xAxisMeasure={ReferenceMd.Amount} />);
        expect(CoreBubbleChart).toHaveBeenCalled();
    });

    it("should render bubble chart and convert the buckets to AFM", () => {
        render(
            <BubbleChart
                workspace="foo"
                backend={dummyBackend()}
                xAxisMeasure={ReferenceMd.Amount}
                yAxisMeasure={ReferenceMd.WinRate}
                size={ReferenceMd.Probability}
                viewBy={ReferenceMd.Product.Name}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "desc")]}
            />,
        );

        const expectedDims = newTwoDimensional([ReferenceMd.Product.Name], [MeasureGroupIdentifier]);

        expect(CoreBubbleChart).toHaveBeenCalledWith(
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
