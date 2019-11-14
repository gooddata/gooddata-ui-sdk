// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { FunnelChart } from "../FunnelChart";
import { IAttribute, IMeasure, IMeasureSortItem } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreFunnelChart } from "../CoreFunnelChart";
import { M1 } from "../../tests/fixtures";

describe("FunnelChart", () => {
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
        const wrapper = shallow(<FunnelChart workspace="foo" backend={dummyBackend()} measures={[M1]} />);
        expect(wrapper.find(CoreFunnelChart)).toHaveLength(1);
    });

    it("should render funnel chart and convert the buckets to AFM", () => {
        const wrapper = shallow(
            <FunnelChart
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

        expect(wrapper.find(CoreFunnelChart)).toHaveLength(1);
        expect(wrapper.find(CoreFunnelChart).prop("execution").definition.dimensions).toEqual(expectedDims);
    });
});
