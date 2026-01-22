// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAttributeOrMeasure,
    MeasureGroupIdentifier,
    newAttributeSort,
    newTwoDimensional,
} from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { BarChart } from "../BarChart.js";
import { CoreBarChart } from "../CoreBarChart.js";

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig) {
    return render(<BarChart config={config} workspace="foo" backend={dummyBackend()} measures={measures} />);
}

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreBarChart", () => ({
    CoreBarChart: vi.fn(() => null),
}));

describe("BarChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        renderChart([]);
        expect(CoreBarChart).toHaveBeenCalled();
    });

    it("should render bar chart and create correct stacking dimensions", () => {
        // note: this test was previously verifying that AFM is created correctly; that is pointless now as the
        //  transformation is tested elsewhere. the important thing to test is that dimensions are built as expected.
        render(
            <BarChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                stackBy={ReferenceMd.Region.Default}
                sortBy={[newAttributeSort(ReferenceMd.Product.Name, "asc")]}
            />,
        );

        const expectedDimensions = newTwoDimensional(
            [ReferenceMd.Region.Default],
            [ReferenceMd.Product.Name, MeasureGroupIdentifier],
        );

        expect(CoreBarChart).toHaveBeenCalledWith(
            expect.objectContaining({
                execution: expect.objectContaining({
                    definition: expect.objectContaining({
                        dimensions: expectedDimensions,
                    }),
                }),
            }),
            undefined,
        );
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            renderChart([ReferenceMd.Amount], config);
            expect(CoreBarChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                }),
                undefined,
            );
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            renderChart([ReferenceMdExt.AmountWithRatio], config);
            expect(CoreBarChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        stackMeasures: false,
                        stackMeasuresToPercent: false,
                    },
                }),
                undefined,
            );
        });
    });
});
