// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { FunnelChart } from "../FunnelChart";
import { newAttributeSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreFunnelChart } from "../CoreFunnelChart";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreFunnelChart", () => ({
    CoreFunnelChart: jest.fn(() => null),
}));

describe("FunnelChart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        render(<FunnelChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />);
        expect(CoreFunnelChart).toHaveBeenCalled();
    });

    it("should render funnel chart and convert the buckets to AFM", () => {
        render(
            <FunnelChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional([MeasureGroupIdentifier], [ReferenceMd.Product.Name]);

        expect(CoreFunnelChart).toHaveBeenCalledWith(
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
