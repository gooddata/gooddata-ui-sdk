// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { factory } from "@gooddata/gooddata-js";
import { AFM, VisualizationInput, VisualizationObject } from "@gooddata/typings";
import { BarChart } from "../BarChart";
import { BarChart as AfmBarChart } from "../afm/BarChart";
import { M1, M1WithRatio } from "./fixtures/buckets";
import { IChartConfig } from "../../interfaces/Config";

function renderChart(
    measures: VisualizationInput.AttributeOrMeasure[],
    config?: IChartConfig,
): ShallowWrapper {
    return shallow(
        <BarChart
            config={config}
            projectId="foo"
            measures={measures}
            sdk={factory({ domain: "example.com" })}
        />,
    );
}

describe("BarChart", () => {
    const measure: VisualizationObject.IMeasure = {
        measure: {
            localIdentifier: "m1",
            definition: {
                measureDefinition: {
                    item: {
                        identifier: "xyz123",
                    },
                },
            },
        },
    };

    const attribute: VisualizationObject.IVisualizationAttribute = {
        visualizationAttribute: {
            localIdentifier: "a1",
            displayForm: {
                identifier: "attribute1",
            },
        },
    };

    const attribute2: VisualizationObject.IVisualizationAttribute = {
        visualizationAttribute: {
            localIdentifier: "a2",
            displayForm: {
                identifier: "attribute2",
            },
        },
    };

    const measureSortItem: AFM.IMeasureSortItem = {
        measureSortItem: {
            direction: "asc",
            locators: [
                {
                    measureLocatorItem: {
                        measureIdentifier: "m1",
                    },
                },
            ],
        },
    };

    it("should render with custom SDK", () => {
        const wrapper = renderChart([M1]);
        expect(wrapper.find(AfmBarChart)).toHaveLength(1);
    });

    it("should render column chart and convert the buckets to AFM and ResultSpec", () => {
        const wrapper = shallow(
            <BarChart
                projectId="foo"
                measures={[measure]}
                viewBy={attribute}
                stackBy={attribute2}
                sortBy={[measureSortItem]}
            />,
        );

        const expectedAfm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: "m1",
                    definition: {
                        measure: {
                            item: {
                                identifier: "xyz123",
                            },
                        },
                    },
                },
            ],
            attributes: [
                {
                    localIdentifier: "a1",
                    displayForm: {
                        identifier: "attribute1",
                    },
                },
                {
                    localIdentifier: "a2",
                    displayForm: {
                        identifier: "attribute2",
                    },
                },
            ],
        };

        const expectedResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ["a2"],
                },
                {
                    itemIdentifiers: ["a1", "measureGroup"],
                },
            ],
            sorts: [
                {
                    measureSortItem: {
                        direction: "asc",
                        locators: [
                            {
                                measureLocatorItem: {
                                    measureIdentifier: "m1",
                                },
                            },
                        ],
                    },
                },
            ],
        };

        expect(wrapper.find(AfmBarChart)).toHaveLength(1);
        expect(wrapper.find(AfmBarChart).prop("afm")).toEqual(expectedAfm);
        expect(wrapper.find(AfmBarChart).prop("resultSpec")).toEqual(expectedResultSpec);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([M1], config);
            expect(wrapper.find(AfmBarChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([M1WithRatio], config);
            expect(wrapper.find(AfmBarChart).prop("config")).toEqual({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
