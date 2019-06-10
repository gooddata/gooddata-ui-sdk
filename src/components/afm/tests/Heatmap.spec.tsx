// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import { testUtils } from "@gooddata/js-utils";

import { Heatmap } from "../Heatmap";
import { Heatmap as CoreHeatmap } from "../../core/Heatmap";
import { dummyExecuteAfmAdapterFactory } from "./utils/DummyExecuteAfmAdapter";

describe("Heatmap", () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: "heat",
                displayForm: { uri: "abc" },
            },
        ],
    };

    it("should provide default resultSpec to core Heatmap with attributes", async () => {
        const wrapper = shallow(
            <Heatmap
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        await testUtils.delay();
        wrapper.update();
        const dimensions = wrapper.find(CoreHeatmap).props().resultSpec.dimensions;
        expect(dimensions).toEqual([{ itemIdentifiers: ["measureGroup"] }, { itemIdentifiers: ["heat"] }]);
    });
});
