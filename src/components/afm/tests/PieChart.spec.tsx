// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { PieChart } from "../PieChart";
import { PieChart as CorePieChart } from "../../core/PieChart";
import { dummyExecuteAfmAdapterFactory } from "./utils/DummyExecuteAfmAdapter";

describe("PieChart", () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: "a1",
                displayForm: { uri: "abc" },
            },
        ],
    };

    it("should provide default resultSpec to core PieChart", () => {
        const wrapper = mount(
            <PieChart
                projectId="prId"
                afm={{ measures: [] }}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CorePieChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: [] }, { itemIdentifiers: ["measureGroup"] }]);
        });
    });

    it("should provide default resultSpec to core PieChart with attributes", () => {
        const wrapper = mount(
            <PieChart
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CorePieChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: ["measureGroup"] }, { itemIdentifiers: ["a1"] }]);
        });
    });
});
