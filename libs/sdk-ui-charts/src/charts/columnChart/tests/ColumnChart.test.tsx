// (C) 2007-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAttributeOrMeasure,
    MeasureGroupIdentifier,
    newMeasureSort,
    newTwoDimensional,
} from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../interfaces/index.js";
import { ColumnChart } from "../ColumnChart.js";
import { CoreColumnChart } from "../CoreColumnChart.js";

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig) {
    return render(
        <ColumnChart config={config} workspace="foo" backend={dummyBackend()} measures={measures} />,
    );
}

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreColumnChart", () => ({
    CoreColumnChart: vi.fn(() => null),
}));

describe("ColumnChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
        renderChart([]);
        expect(CoreColumnChart).toHaveBeenCalled();
    });

    it("should render column chart and convert the buckets to AFM", () => {
        render(
            <ColumnChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[ReferenceMd.Amount]}
                viewBy={ReferenceMd.Product.Name}
                stackBy={ReferenceMd.Region.Default}
                sortBy={[newMeasureSort(ReferenceMd.Amount, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [ReferenceMd.Region.Default],
            [ReferenceMd.Product.Name, MeasureGroupIdentifier],
        );

        expect(CoreColumnChart).toHaveBeenCalledWith(
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

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            renderChart([ReferenceMd.Amount], config);
            expect(CoreColumnChart).toHaveBeenCalledWith(
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
            expect(CoreColumnChart).toHaveBeenCalledWith(
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
