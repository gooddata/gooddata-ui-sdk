// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { ScatterPlot } from "../ScatterPlot";
import { ScatterPlot as CoreScatterPlot } from "../../core/ScatterPlot";
import { dummyExecuteAfmAdapterFactory } from "./utils/DummyExecuteAfmAdapter";

describe("ScatterPlot", () => {
    const afmWithAttr = {
        measures: [] as any,
        attributes: [
            {
                localIdentifier: "a1",
                displayForm: { uri: "abc" },
            },
        ],
    };

    it("should provide default resultSpec to core Scatter plot", () => {
        const wrapper = mount(
            <ScatterPlot
                projectId="prId"
                afm={{ measures: [] }}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreScatterPlot).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: [] }, { itemIdentifiers: ["measureGroup"] }]);
        });
    });

    it("should provide default resultSpec to core Scatter plot with attributes", () => {
        const wrapper = mount(
            <ScatterPlot
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreScatterPlot).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: ["a1"] }, { itemIdentifiers: ["measureGroup"] }]);
        });
    });
});
