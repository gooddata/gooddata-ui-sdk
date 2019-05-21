// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { DonutChart } from "../DonutChart";
import { DonutChart as CoreDonutChart } from "../../core/DonutChart";
import { dummyExecuteAfmAdapterFactory } from "./utils/DummyExecuteAfmAdapter";

describe("DonutChart", () => {
    const afmWithAttr = {
        measures: [] as any,
        attributes: [
            {
                localIdentifier: "a1",
                displayForm: { uri: "abc" },
            },
        ],
    };

    it("should provide default resultSpec to core DonutChart", () => {
        const wrapper = mount(
            <DonutChart
                projectId="prId"
                afm={{ measures: [] }}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreDonutChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: [] }, { itemIdentifiers: ["measureGroup"] }]);
        });
    });

    it("should provide default resultSpec to core DonutChart with attributes", () => {
        const wrapper = mount(
            <DonutChart
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreDonutChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: ["measureGroup"] }, { itemIdentifiers: ["a1"] }]);
        });
    });
});
