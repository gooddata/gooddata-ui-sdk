// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { factory } from "@gooddata/gooddata-js";
import { AFM, VisualizationObject } from "@gooddata/typings";

import { ComboChart as AfmComboChart } from "../afm/ComboChart";
import { ComboChart } from "../ComboChart";
import { M1, M2, M3, M4 } from "./fixtures/buckets";
import { IChartConfig } from "../../interfaces/Config";
import { measure } from "../../helpers/model";

describe("ComboChart", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(
            <ComboChart
                projectId="foo"
                primaryMeasures={[M1]}
                secondaryMeasures={[M2]}
                sdk={factory({ domain: "example.com" })}
            />,
        );
        expect(wrapper.find(AfmComboChart)).toHaveLength(1);
    });

    it("should render AfmComboChart when columnMeasures & lineMeasures provided", () => {
        const wrapper = shallow(<ComboChart projectId="foo" columnMeasures={[M3]} lineMeasures={[M4]} />);
        expect(wrapper.find(AfmComboChart)).toHaveLength(1);
    });

    it("should override primaryMeasures & secondaryMeasures", () => {
        const wrapper = shallow(
            <ComboChart
                projectId="foo"
                columnMeasures={[M3]}
                lineMeasures={[M4]}
                primaryMeasures={[M1]}
                secondaryMeasures={[M2]}
            />,
        );
        const expectedAfm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: "m3",
                    definition: {
                        measure: {
                            item: {
                                identifier: "m3",
                            },
                        },
                    },
                },
                {
                    localIdentifier: "m4",
                    definition: {
                        measure: {
                            item: {
                                identifier: "m4",
                            },
                        },
                    },
                },
            ],
        };
        const afmComponent = wrapper.find(AfmComboChart);

        expect(afmComponent.prop("afm")).toEqual(expectedAfm);
    });

    describe("Stacking", () => {
        function renderChart(
            primaryMeasures: VisualizationObject.IMeasure[],
            secondaryMeasures: VisualizationObject.IMeasure[],
            config?: IChartConfig,
        ) {
            return shallow(
                <ComboChart
                    config={config}
                    projectId="foo"
                    primaryMeasures={primaryMeasures}
                    secondaryMeasures={secondaryMeasures}
                />,
            );
        }

        const config = { stackMeasures: true, stackMeasuresToPercent: true };
        const M5 = measure("m5").localIdentifier("m5");
        const M5WithRatio = measure("m5ratio")
            .localIdentifier("m5ratio")
            .ratio();

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([M5], [], config);
            const configProps = wrapper.find(AfmComboChart).prop("config");

            expect(configProps.stackMeasures).toBeTruthy();
            expect(configProps.stackMeasuresToPercent).toBeTruthy();
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([M5WithRatio], [], config);
            const configProps = wrapper.find(AfmComboChart).prop("config");

            expect(configProps.stackMeasures).toBeFalsy();
            expect(configProps.stackMeasuresToPercent).toBeFalsy();
        });

        it.each([["primary", [M5, M5WithRatio], []], ["secondary", [], [M5, M5WithRatio]]])(
            "should ignore computeRatio when %s measure bucket has multiple items",
            (
                _name: string,
                primaryMeasures: VisualizationObject.IMeasure[],
                secondaryMeasures: VisualizationObject.IMeasure[],
            ) => {
                const wrapper = renderChart(primaryMeasures, secondaryMeasures, config);
                const afmProps = wrapper.find(AfmComboChart).prop("afm");

                expect(afmProps).toEqual({
                    measures: [
                        {
                            localIdentifier: "m5",
                            definition: {
                                measure: {
                                    item: {
                                        identifier: "m5",
                                    },
                                },
                            },
                        },
                        {
                            localIdentifier: "m5ratio",
                            definition: {
                                measure: {
                                    item: {
                                        identifier: "m5ratio",
                                    },
                                },
                            },
                        },
                    ],
                });
            },
        );

        it("should ignore computeRatio when dual axis is OFF and # of measures > 1", () => {
            const M1WithRatio = measure("m1ratio")
                .localIdentifier("m1ratio")
                .ratio();
            const wrapper = renderChart([M1WithRatio], [M5WithRatio], {
                ...config,
                dualAxis: false,
            });
            const afmProps = wrapper.find(AfmComboChart).prop("afm");

            expect(afmProps).toEqual({
                measures: [
                    {
                        localIdentifier: "m1ratio",
                        definition: {
                            measure: {
                                item: {
                                    identifier: "m1ratio",
                                },
                            },
                        },
                    },
                    {
                        localIdentifier: "m5ratio",
                        definition: {
                            measure: {
                                item: {
                                    identifier: "m5ratio",
                                },
                            },
                        },
                    },
                ],
            });
        });

        it("should apply computeRatio when dual axis is OFF and # of measures = 1", () => {
            const wrapper = renderChart([], [M5WithRatio], {
                ...config,
                dualAxis: false,
            });
            const afmProps = wrapper.find(AfmComboChart).prop("afm");

            expect(afmProps).toEqual({
                measures: [
                    {
                        localIdentifier: "m5ratio",
                        format: "#,##0.00%",
                        definition: {
                            measure: {
                                item: {
                                    identifier: "m5ratio",
                                },
                                computeRatio: true,
                            },
                        },
                    },
                ],
            });
        });
    });
});
