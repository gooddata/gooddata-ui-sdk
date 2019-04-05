// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { factory } from "@gooddata/gooddata-js";
import { VisualizationObject, AFM } from "@gooddata/typings";
import { Treemap } from "../Treemap";
import { Treemap as AfmTreemap } from "../afm/Treemap";
import { M1 } from "./fixtures/buckets";

describe("Treemap", () => {
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

    it("should render with custom SDK", () => {
        const wrapper = shallow(
            <Treemap projectId="foo" measures={[M1]} sdk={factory({ domain: "example.com" })} />,
        );
        expect(wrapper.find(AfmTreemap)).toHaveLength(1);
    });

    it("should render treemap and convert the buckets to AFM", () => {
        const wrapper = shallow(<Treemap projectId="foo" measures={[measure]} viewBy={attribute} />);

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
            ],
        };

        expect(wrapper.find(AfmTreemap)).toHaveLength(1);
        expect(wrapper.find(AfmTreemap).prop("afm")).toEqual(expectedAfm);
    });
});
