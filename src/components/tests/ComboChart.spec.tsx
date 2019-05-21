// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { factory } from "@gooddata/gooddata-js";
import { AFM } from "@gooddata/typings";

import { ComboChart as AfmComboChart } from "../afm/ComboChart";
import { ComboChart } from "../ComboChart";
import { M1, M2, M3, M4 } from "./fixtures/buckets";

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
});
