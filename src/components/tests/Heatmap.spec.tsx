// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { factory } from "@gooddata/gooddata-js";

import { Heatmap as AfmHeatmap } from "../afm/Heatmap";
import { Heatmap } from "../Heatmap";
import { M1 } from "./fixtures/buckets";

describe("Heatmap", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(
            <Heatmap projectId="foo" measure={M1} sdk={factory({ domain: "example.com" })} />,
        );
        expect(wrapper.find(AfmHeatmap)).toHaveLength(1);
    });
});
