// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { ColumnChart } from "../ColumnChart";
import { M1, M1WithRatio } from "../../tests/fixtures/buckets";
import { IChartConfig } from "../../../base/interfaces/Config";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { AttributeOrMeasure, IAttribute, IMeasure, IMeasureSortItem } from "@gooddata/sdk-model";
import { CoreColumnChart } from "../CoreColumnChart";

function renderChart(measures: AttributeOrMeasure[], config?: IChartConfig): ShallowWrapper {
    return shallow(
        <ColumnChart config={config} workspace="foo" backend={dummyBackend()} measures={measures} />,
    );
}

describe("ColumnChart", () => {
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
        expect(wrapper.find(CoreColumnChart)).toHaveLength(1);
    });

    it("should render column chart and convert the buckets to AFM", () => {
        const wrapper = shallow(
            <ColumnChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[measure]}
                viewBy={attribute}
                stackBy={attribute2}
                sortBy={[measureSortItem]}
            />,
        );

        const expectedDims = [
            {
                itemIdentifiers: ["a2"],
            },
            {
                itemIdentifiers: ["a1", "measureGroup"],
            },
        ];

        expect(wrapper.find(CoreColumnChart)).toHaveLength(1);
        expect(wrapper.find(CoreColumnChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CoreColumnChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });

    describe("Stacking", () => {
        const config = { stackMeasures: true, stackMeasuresToPercent: true };

        it("should NOT reset stackMeasuresToPercent in case of one measure", () => {
            const wrapper = renderChart([M1], config);
            expect(wrapper.find(CoreColumnChart).prop("config")).toEqual({
                stackMeasures: true,
                stackMeasuresToPercent: true,
            });
        });

        it("should reset stackMeasures, stackMeasuresToPercent in case of one measure and computeRatio", () => {
            const wrapper = renderChart([M1WithRatio], config);
            expect(wrapper.find(CoreColumnChart).prop("config")).toEqual({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        });
    });
});
