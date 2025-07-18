// (C) 2007-2025 GoodData Corporation
import { render } from "@testing-library/react";

import { AreaChart } from "../AreaChart.js";
import { IChartConfig } from "../../../interfaces/index.js";
import { IAttributeOrMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { CoreAreaChart } from "../CoreAreaChart.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig) {
    return render(
        <AreaChart config={config} workspace="test" backend={dummyBackend()} measures={measures} />,
    );
}

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreAreaChart", () => ({
    CoreAreaChart: vi.fn(() => null),
}));

describe("AreaChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", async () => {
        renderChart([ReferenceMd.Amount]);
        expect(CoreAreaChart).toHaveBeenCalled();
    });

    describe("Stacking", () => {
        const config = {
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            renderChart([ReferenceMd.Amount], config);
            expect(CoreAreaChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        stacking: true,
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    },
                }),
                expect.anything(),
            );
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            renderChart([ReferenceMdExt.AmountWithRatio], config);
            expect(CoreAreaChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        stacking: true,
                        stackMeasures: false,
                        stackMeasuresToPercent: false,
                    },
                }),
                expect.anything(),
            );
        });
    });
});
