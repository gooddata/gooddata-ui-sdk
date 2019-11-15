// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { BubbleChart } from "../BubbleChart";
import { IAttribute, IAttributeSortItem, IMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreBubbleChart } from "../CoreBubbleChart";
import { M1 } from "../../tests/fixtures";

describe("BubbleChart", () => {
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

    const secondaryMeasure: IMeasure = {
        measure: {
            localIdentifier: "m2",
            definition: {
                measureDefinition: {
                    item: {
                        identifier: "abc321",
                    },
                },
            },
        },
    };

    const tertiaryMeasure: IMeasure = {
        measure: {
            localIdentifier: "m3",
            definition: {
                measureDefinition: {
                    item: {
                        identifier: "size",
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

    const attributeSortItem: IAttributeSortItem = {
        attributeSortItem: {
            direction: "desc",
            attributeIdentifier: "attribute1",
        },
    };

    it("should render with custom SDK", () => {
        const wrapper = shallow(<BubbleChart workspace="foo" backend={dummyBackend()} xAxisMeasure={M1} />);
        expect(wrapper.find(CoreBubbleChart)).toHaveLength(1);
    });

    it("should render scatter plot and convert the buckets to AFM", () => {
        const wrapper = shallow(
            <BubbleChart
                workspace="foo"
                backend={dummyBackend()}
                xAxisMeasure={measure}
                yAxisMeasure={secondaryMeasure}
                size={tertiaryMeasure}
                viewBy={attribute}
                sortBy={[attributeSortItem]}
            />,
        );

        const expectedDims = [
            {
                itemIdentifiers: ["a1"],
            },
            {
                itemIdentifiers: ["measureGroup"],
            },
        ];

        expect(wrapper.find(CoreBubbleChart)).toHaveLength(1);
        expect(wrapper.find(CoreBubbleChart).prop("execution")).toBeDefined();
        expect(wrapper.find(CoreBubbleChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
