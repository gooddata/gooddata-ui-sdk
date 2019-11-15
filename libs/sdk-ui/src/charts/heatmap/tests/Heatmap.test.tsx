// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";

import { Heatmap } from "../Heatmap";
import { CoreHeatmap } from "../CoreHeatmap";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { M1 } from "../../tests/fixtures";

describe("Heatmap", () => {
    it("should render with custom SDK", () => {
        const wrapper = shallow(<Heatmap workspace="foo" measure={M1} backend={dummyBackend()} />);
        expect(wrapper.find(CoreHeatmap)).toHaveLength(1);
    });
});
