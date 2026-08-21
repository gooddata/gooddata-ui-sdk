// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreAreaChart.js", () => ({
    CoreAreaChart: vi.fn(() => null),
}));

// AreaChart.js is imported by AreaChartStacking.test.ts as well, so with isolation off (see vitest.config.ts)
// an earlier file may have left it cached — wired to the *real* CoreAreaChart rather than the mock above.
// Dropping the cached graph re-imports it through the mock.
//
// This runs while the file is still being imported, not from a hook: static imports are already bound by the
// time any hook runs, so the reset has to be followed by re-importing the graph it dropped. CoreAreaChart has
// to come from that same fresh graph too — the reset drops the mocked module as well, so a statically imported
// binding would point at a stale mock instance that the re-imported AreaChart never calls.
vi.resetModules();
const { AreaChart } = await import("../AreaChart.js");
const { CoreAreaChart } = await import("../CoreAreaChart.js");

function renderChart(measures: IAttributeOrMeasure[], config?: IChartConfig) {
    return render(
        <AreaChart config={config} workspace="test" backend={dummyBackend()} measures={measures} />,
    );
}

describe("AreaChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with custom SDK", () => {
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
                undefined,
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
                undefined,
            );
        });
    });
});
