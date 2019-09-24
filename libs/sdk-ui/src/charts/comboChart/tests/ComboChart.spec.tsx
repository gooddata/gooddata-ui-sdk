// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { ComboChart } from "../ComboChart";
import { M1, M2, M3, M4 } from "../../tests/fixtures/buckets";
import { IChartConfig } from "../../../base/interfaces/Config";
import { measure } from "../../../base/helpers/model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreComboChart } from "../CoreComboChart";
import { IMeasure } from "@gooddata/sdk-model";
import { Model } from "../../../index";

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
        const M5 = measure("m5")
            .localIdentifier("m5")
            .build();
        const M5WithRatio = measure("m5ratio")
            .localIdentifier("m5ratio")
            .ratio()
            .build();

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
            (_name: string, primaryMeasures: IMeasure[], secondaryMeasures: IMeasure[]) => {
                const wrapper = renderChart(primaryMeasures, secondaryMeasures, config);
                const execution = wrapper.find(CoreComboChart).prop("execution");
                const expectedMeasures = [
                    Model.measure("m5")
                        .localIdentifier("m5")
                        .build(),
                    Model.measure("m5ratio")
                        .localIdentifier("m5ratio")
                        .build(),
                ];

                expect(execution.definition.measures).toEqual(expectedMeasures);
            },
        );

        it("should ignore computeRatio when dual axis is OFF and # of measures > 1", () => {
            const M1WithRatio = measure("m1ratio")
                .localIdentifier("m1ratio")
                .ratio()
                .build();
            const wrapper = renderChart([M1WithRatio], [M5WithRatio], {
                ...config,
                dualAxis: false,
            });
            const execution = wrapper.find(CoreComboChart).prop("execution");
            const expectedMeasures = [
                Model.measure("m1ratio")
                    .localIdentifier("m1ratio")
                    .build(),
                Model.measure("m5ratio")
                    .localIdentifier("m5ratio")
                    .build(),
            ];

            expect(execution.definition.measures).toEqual(expectedMeasures);
        });

        it("should apply computeRatio when dual axis is OFF and # of measures = 1", () => {
            const wrapper = renderChart([], [M5WithRatio], {
                ...config,
                dualAxis: false,
            });
            const execution = wrapper.find(CoreComboChart).prop("execution");
            const expectedMeasure = [
                measure("m5ratio")
                    .localIdentifier("m5ratio")
                    .ratio()
                    .build(),
            ];

            expect(execution.definition.measures).toEqual(expectedMeasure);
        });
    });
});
