// (C) 2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { WaterfallChart } from "../WaterfallChart";
import { CoreWaterfallChart } from "../CoreWaterfallChart";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreWaterfallChart", () => ({
    CoreWaterfallChart: jest.fn(() => null),
}));

describe("WaterfallChart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
