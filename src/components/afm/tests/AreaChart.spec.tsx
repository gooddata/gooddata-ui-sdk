// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";

import { AreaChart } from "../AreaChart";
import { AreaChart as CoreAreaChart } from "../../core/AreaChart";
import { dummyExecuteAfmAdapterFactory } from "./utils/DummyExecuteAfmAdapter";

describe("Area chart", () => {
    const afmWithAttr = {
        measures: [] as any,
        attributes: [
            {
                localIdentifier: "area1",
                displayForm: { uri: "abc" },
            },
        ],
    };

    it("should provide default resultSpec to core AreaChart with attributes", () => {
        const wrapper = mount(
            <AreaChart
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();

            const dimensions = wrapper.find(CoreAreaChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([
                { itemIdentifiers: ["measureGroup"] },
                { itemIdentifiers: ["area1"] },
            ]);
        });
    });
});
