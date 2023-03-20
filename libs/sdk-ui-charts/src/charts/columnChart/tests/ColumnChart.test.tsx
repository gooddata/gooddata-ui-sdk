// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { ColumnChart } from "../ColumnChart";
import { IChartConfig } from "../../../interfaces";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    IAttributeOrMeasure,
    newMeasureSort,
    newTwoDimensional,
    MeasureGroupIdentifier,
} from "@gooddata/sdk-model";
import { CoreColumnChart } from "../CoreColumnChart";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig) {
    return render(
        <ColumnChart config={config} workspace="foo" backend={dummyBackend()} measures={measures} />,
    );
}

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreColumnChart", () => ({
    CoreColumnChart: jest.fn(() => null),
}));

describe("ColumnChart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
                stackBy={ReferenceMd.Region}
                sortBy={[newMeasureSort(ReferenceMd.Amount, "asc")]}
            />,
        );

        const expectedDims = newTwoDimensional(
            [ReferenceMd.Region],
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
            expect.anything(),
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
                expect.anything(),
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
                expect.anything(),
            );
        });
    });
});
