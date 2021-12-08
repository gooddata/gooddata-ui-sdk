// (C) 2007-2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { Heatmap } from "../Heatmap";
import { CoreHeatmap } from "../CoreHeatmap";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

describe("Heatmap", () => {
    it("should render with custom SDK", () => {
        const wrapper = mount(
            <Heatmap workspace="foo" measure={ReferenceMd.Amount} backend={dummyBackend()} />,
        );
        expect(wrapper.find(CoreHeatmap)).toHaveLength(1);
    });
});
