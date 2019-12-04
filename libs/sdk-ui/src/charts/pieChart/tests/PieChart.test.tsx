// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { PieChart } from "../PieChart";
import { IAttribute, IMeasure, IMeasureSortItem } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CorePieChart } from "../CorePieChart";
import { M1 } from "../../tests/fixtures";

describe("PieChart", () => {
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
        const wrapper = mount(<PieChart workspace="foo" backend={dummyBackend()} measures={[M1]} />);
        expect(wrapper.find(CorePieChart)).toHaveLength(1);
    });

    it("should render pie chart and convert the buckets to AFM", () => {
        const wrapper = mount(
            <PieChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[measure]}
                viewBy={attribute}
                sortBy={[measureSortItem]}
            />,
        );

        const expectedDims = [
            {
                itemIdentifiers: ["measureGroup"],
            },
            {
                itemIdentifiers: ["a1"],
            },
        ];

        expect(wrapper.find(CorePieChart)).toHaveLength(1);
        expect(wrapper.find(CorePieChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CorePieChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
