// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { ComboChart } from "../ComboChart";
import { IChartConfig } from "../../../highcharts";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreComboChart } from "../CoreComboChart";
import { IMeasure, newMeasure } from "@gooddata/sdk-model";
import { M1, M2, M3, M4 } from "../../tests/fixtures";

describe("ComboChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(
            <ComboChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasures={[M1]}
                secondaryMeasures={[M2]}
            />,
        );
        expect(wrapper.find(CoreComboChart)).toHaveLength(1);
    });

    it("should render CoreComboChart", () => {
        const wrapper = shallow(
            <ComboChart
                workspace="foo"
                backend={dummyBackend()}
                primaryMeasures={[M3]}
                secondaryMeasures={[M4]}
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
            return shallow(
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
        const M5 = newMeasure("m5", m => m.localId("m5"));
        const M5WithRatio = newMeasure("m5ratio", m => m.localId("m5ratio").ratio());

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([M5], [], config);
            const configProps = wrapper.find(CoreComboChart).prop("config");

            expect(configProps.stackMeasures).toBeTruthy();
            expect(configProps.stackMeasuresToPercent).toBeTruthy();
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([M5WithRatio], [], config);
            const configProps = wrapper.find(CoreComboChart).prop("config");

            expect(configProps.stackMeasures).toBeFalsy();
            expect(configProps.stackMeasuresToPercent).toBeFalsy();
        });

        it.each([["primary", [M5, M5WithRatio], []], ["secondary", [], [M5, M5WithRatio]]])(
            "should ignore computeRatio when %s measure bucket has multiple items",
            (_name: any, primaryMeasures: any, secondaryMeasures: any) => {
                const wrapper = renderChart(primaryMeasures, secondaryMeasures, config);
                const execution = wrapper.find(CoreComboChart).prop("execution");
                const expectedMeasures = [
                    newMeasure("m5", m => m.localId("m5")),
                    newMeasure("m5ratio", m => m.localId("m5ratio")),
                ];

                expect(execution.definition.measures).toEqual(expectedMeasures);
            },
        );

        it("should ignore computeRatio when dual axis is OFF and # of measures > 1", () => {
            const M1WithRatio = newMeasure("m1ratio", m => m.localId("m1ratio").ratio());
            const wrapper = renderChart([M1WithRatio], [M5WithRatio], {
                ...config,
                dualAxis: false,
            });
            const execution = wrapper.find(CoreComboChart).prop("execution");
            const expectedMeasures = [
                newMeasure("m1ratio", m => m.localId("m1ratio")),
                newMeasure("m5ratio", m => m.localId("m5ratio")),
            ];

            expect(execution.definition.measures).toEqual(expectedMeasures);
        });

        it("should apply computeRatio when dual axis is OFF and # of measures = 1", () => {
            const wrapper = renderChart([], [M5WithRatio], {
                ...config,
                dualAxis: false,
            });
            const execution = wrapper.find(CoreComboChart).prop("execution");
            const expectedMeasure = [newMeasure("m5ratio", m => m.localId("m5ratio").ratio())];

            expect(execution.definition.measures).toEqual(expectedMeasure);
        });
    });
});
