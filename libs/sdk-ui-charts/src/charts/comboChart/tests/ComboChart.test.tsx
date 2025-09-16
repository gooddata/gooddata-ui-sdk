// (C) 2007-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IMeasure, measureLocalId, modifyMeasure, modifySimpleMeasure } from "@gooddata/sdk-model";

import { IChartConfig } from "../../../interfaces/index.js";
import { ComboChart } from "../ComboChart.js";
import { CoreComboChart } from "../CoreComboChart.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreComboChart", () => ({
    CoreComboChart: vi.fn(() => null),
}));

// need to turn off ratio in the ReferenceMdExt.AmountWithRatio
describe("ComboChart", () => {
    it("should render with custom SDK", () => {
        render(
            <ComboChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasures={[ReferenceMd.Amount]}
                secondaryMeasures={[ReferenceMd.Won]}
            />,
        );
        expect(CoreComboChart).toHaveBeenCalled();
    });

    it("should render CoreComboChart", () => {
        render(
            <ComboChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasures={[ReferenceMd.Amount]}
                secondaryMeasures={[ReferenceMd.Won]}
            />,
        );
        expect(CoreComboChart).toHaveBeenCalled();
    });

    describe("Stacking", () => {
        function renderChart(
            primaryMeasures: IMeasure[],
            secondaryMeasures: IMeasure[],
            config?: IChartConfig,
        ) {
            return render(
                <ComboChart
                    config={config}
                    workspace="foo"
                    backend={dummyBackend()}
                    primaryMeasures={primaryMeasures}
                    secondaryMeasures={secondaryMeasures}
                />,
            );
        }

        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            renderChart([ReferenceMd.Amount], [], config);

            expect(CoreComboChart).toHaveBeenCalledWith(
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
            renderChart([ReferenceMdExt.AmountWithRatio], [], config);

            expect(CoreComboChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        stackMeasures: false,
                        stackMeasuresToPercent: false,
                    },
                }),
                undefined,
            );
        });

        it.each([
            ["primary", [ReferenceMd.Amount, ReferenceMdExt.AmountWithRatio], []],
            ["secondary", [], [ReferenceMd.Amount, ReferenceMdExt.AmountWithRatio]],
        ])(
            "should ignore computeRatio when %s measure bucket has multiple items",
            (_name: any, primaryMeasures: any, secondaryMeasures: any) => {
                renderChart(primaryMeasures, secondaryMeasures, config);
                const expectedMeasures = [
                    ReferenceMd.Amount,
                    modifySimpleMeasure(ReferenceMdExt.AmountWithRatio, (m) => m.noRatio()),
                ];

                expect(CoreComboChart).toHaveBeenCalledWith(
                    expect.objectContaining({
                        execution: expect.objectContaining({
                            definition: expect.objectContaining({
                                measures: expectedMeasures,
                            }),
                        }),
                    }),
                    undefined,
                );
            },
        );

        it("should ignore computeRatio when dual axis is OFF and # of measures > 1", () => {
            renderChart(
                [ReferenceMdExt.AmountWithRatio],
                [
                    modifyMeasure(ReferenceMdExt.AmountWithRatio, (m) =>
                        m.localId(`${measureLocalId(ReferenceMdExt.AmountWithRatio)}_1`),
                    ),
                ],
                {
                    ...config,
                    dualAxis: false,
                },
            );
            const expectedMeasures = [
                modifySimpleMeasure(ReferenceMdExt.AmountWithRatio, (m) => m.noRatio()),
                modifySimpleMeasure(ReferenceMdExt.AmountWithRatio, (m) =>
                    m.noRatio().localId(`${measureLocalId(ReferenceMdExt.AmountWithRatio)}_1`),
                ),
            ];

            expect(CoreComboChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    execution: expect.objectContaining({
                        definition: expect.objectContaining({
                            measures: expectedMeasures,
                        }),
                    }),
                }),
                undefined,
            );
        });

        it("should apply computeRatio when dual axis is OFF and # of measures = 1", () => {
            renderChart([], [ReferenceMdExt.AmountWithRatio], {
                ...config,
                dualAxis: false,
            });
            const expectedMeasure = [ReferenceMdExt.AmountWithRatio];

            expect(CoreComboChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    execution: expect.objectContaining({
                        definition: expect.objectContaining({
                            measures: expectedMeasure,
                        }),
                    }),
                }),
                undefined,
            );
        });
    });
});
