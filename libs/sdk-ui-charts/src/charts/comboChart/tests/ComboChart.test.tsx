// (C) 2007-2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { ComboChart } from "../ComboChart";
import { IChartConfig } from "../../../interfaces";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { CoreComboChart } from "../CoreComboChart";
import { IMeasure, measureLocalId, modifyMeasure, modifySimpleMeasure } from "@gooddata/sdk-model";

// need to turn off ratio in the ReferenceMdExt.AmountWithRatio
describe("ComboChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <ComboChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasures={[ReferenceMd.Amount]}
                secondaryMeasures={[ReferenceMd.Won]}
            />,
        );
        expect(wrapper.find(CoreComboChart)).toHaveLength(1);
    });

    it("should render CoreComboChart", () => {
        const wrapper = mount(
            <ComboChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasures={[ReferenceMd.Amount]}
                secondaryMeasures={[ReferenceMd.Won]}
            />,
        );
        expect(wrapper.find(CoreComboChart)).toHaveLength(1);
    });

    describe("Stacking", () => {
        function renderChart(
            primaryMeasures: IMeasure[],
            secondaryMeasures: IMeasure[],
            config?: IChartConfig,
        ) {
            return mount(
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
            const wrapper = renderChart([ReferenceMd.Amount], [], config);
            const configProps = wrapper.find(CoreComboChart).prop("config");

            expect(configProps.stackMeasures).toBeTruthy();
            expect(configProps.stackMeasuresToPercent).toBeTruthy();
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([ReferenceMdExt.AmountWithRatio], [], config);
            const configProps = wrapper.find(CoreComboChart).prop("config");

            expect(configProps.stackMeasures).toBeFalsy();
            expect(configProps.stackMeasuresToPercent).toBeFalsy();
        });

        it.each([
            ["primary", [ReferenceMd.Amount, ReferenceMdExt.AmountWithRatio], []],
            ["secondary", [], [ReferenceMd.Amount, ReferenceMdExt.AmountWithRatio]],
        ])(
            "should ignore computeRatio when %s measure bucket has multiple items",
            (_name: any, primaryMeasures: any, secondaryMeasures: any) => {
                const wrapper = renderChart(primaryMeasures, secondaryMeasures, config);
                const execution = wrapper.find(CoreComboChart).prop("execution");
                const expectedMeasures = [
                    ReferenceMd.Amount,
                    modifySimpleMeasure(ReferenceMdExt.AmountWithRatio, (m) => m.noRatio()),
                ];

                expect(execution.definition.measures).toEqual(expectedMeasures);
            },
        );

        it("should ignore computeRatio when dual axis is OFF and # of measures > 1", () => {
            const wrapper = renderChart(
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
            const execution = wrapper.find(CoreComboChart).prop("execution");
            const expectedMeasures = [
                modifySimpleMeasure(ReferenceMdExt.AmountWithRatio, (m) => m.noRatio()),
                modifySimpleMeasure(ReferenceMdExt.AmountWithRatio, (m) =>
                    m.noRatio().localId(`${measureLocalId(ReferenceMdExt.AmountWithRatio)}_1`),
                ),
            ];

            expect(execution.definition.measures).toEqual(expectedMeasures);
        });

        it("should apply computeRatio when dual axis is OFF and # of measures = 1", () => {
            const wrapper = renderChart([], [ReferenceMdExt.AmountWithRatio], {
                ...config,
                dualAxis: false,
            });
            const execution = wrapper.find(CoreComboChart).prop("execution");
            const expectedMeasure = [ReferenceMdExt.AmountWithRatio];

            expect(execution.definition.measures).toEqual(expectedMeasure);
        });
    });
});
