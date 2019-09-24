// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { BarChart } from "../BarChart";
import { M1, M1WithRatio } from "../../tests/fixtures/buckets";
import { IChartConfig } from "../../../highcharts";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    attributeId,
    AttributeOrMeasure,
    IAttribute,
    IMeasure,
    IMeasureSortItem,
    MeasureGroupIdentifier,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { CoreBarChart } from "../CoreBarChart";

function renderChart(measures: AttributeOrMeasure[], config?: IChartConfig): ShallowWrapper {
    return shallow(<BarChart config={config} workspace="foo" backend={dummyBackend()} measures={measures} />);
}

describe("BarChart", () => {
    const measure: IMeasure = {
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

    const attribute: IAttribute = {
        attribute: {
            localIdentifier: "a1",
            displayForm: {
                identifier: "attribute1",
            },
        },
    };

    const attribute2: IAttribute = {
        attribute: {
            localIdentifier: "a2",
            displayForm: {
                identifier: "attribute2",
            },
        },
    };

    const measureSortItem: IMeasureSortItem = {
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
        expect(wrapper.find(CoreBarChart)).toHaveLength(1);
    });

    it("should render column chart and create correct stacking dimensions", () => {
        // note: this test was previously verifying that AFM is created correctly; that is pointless now as the
        //  transformation is tested elsewhere. the important thing to test is that dimensions are built as expected.
        const wrapper = shallow(
            <BarChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[measure]}
                viewBy={attribute}
                stackBy={attribute2}
                sortBy={[measureSortItem]}
            />,
        );

        const exceptedDimensions = newTwoDimensional(
            [attributeId(attribute2)],
            [attributeId(attribute), MeasureGroupIdentifier],
        );

        expect(wrapper.find(CoreBarChart)).toHaveLength(1);
        expect(wrapper.find(CoreBarChart).prop("execution")).toBeDefined();

        const definition = wrapper.find(CoreBarChart).prop("execution").definition;

        expect(definition.dimensions).toEqual(exceptedDimensions);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([M1], config);
            expect(wrapper.find(CoreBarChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([M1WithRatio], config);
            expect(wrapper.find(CoreBarChart).prop("config")).toEqual({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
