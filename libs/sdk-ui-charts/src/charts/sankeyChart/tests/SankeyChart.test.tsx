// (C) 2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { SankeyChart } from "../SankeyChart";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreSankeyChart } from "../CoreSankeyChart";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreSankeyChart", () => ({
    CoreSankeyChart: jest.fn(() => null),
}));

describe("SankeyChart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(
            <SankeyChart
                workspace="foo"
                backend={dummyBackend()}
                measure={ReferenceMd.Amount}
                attributeFrom={ReferenceMd.Product.Name}
                attributeTo={ReferenceMd.Region}
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
                attributeTo={ReferenceMd.Region}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [MeasureGroupIdentifier],
            [ReferenceMd.Product.Name, ReferenceMd.Region],
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
