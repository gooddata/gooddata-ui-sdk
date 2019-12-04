// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { LineChart } from "../LineChart";
import { IAttribute, IMeasure, IMeasureSortItem } from "@gooddata/sdk-model";
import { CoreLineChart } from "../CoreLineChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { M1 } from "../../tests/fixtures";

describe("LineChart", () => {
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
        const wrapper = mount(<LineChart workspace="foo" backend={dummyBackend()} measures={[M1]} />);
        expect(wrapper.find(CoreLineChart)).toHaveLength(1);
    });

    it("should render pie chart and convert the buckets to AFM", () => {
        const wrapper = mount(
            <LineChart
                workspace="foo"
                backend={dummyBackend()}
                measures={[measure]}
                trendBy={attribute}
                segmentBy={attribute2}
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

        expect(wrapper.find(CoreLineChart)).toHaveLength(1);
        expect(wrapper.find(CoreLineChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CoreLineChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
