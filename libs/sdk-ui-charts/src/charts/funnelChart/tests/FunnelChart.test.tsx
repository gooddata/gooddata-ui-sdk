// (C) 2007-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { MeasureGroupIdentifier, newAttributeSort, newTwoDimensional } from "@gooddata/sdk-model";

import { CoreFunnelChart } from "../CoreFunnelChart.js";
import { FunnelChart } from "../FunnelChart.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreFunnelChart", () => ({
    CoreFunnelChart: vi.fn(() => null),
}));

describe("FunnelChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
            undefined,
        );
    });
});
