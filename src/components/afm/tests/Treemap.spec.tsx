// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { Treemap } from "../Treemap";
import { Treemap as CoreTreemap } from "../../core/Treemap";
import { dummyExecuteAfmAdapterFactory } from "./utils/DummyExecuteAfmAdapter";

describe("Treemap", () => {
    const afmWithAttr = {
        attributes: [
            {
                localIdentifier: "a1",
                displayForm: { uri: "abc" },
            },
        ],
    };

    it("should provide default resultSpec to core Treemap", () => {
        const wrapper = mount(
            <Treemap
                projectId="prId"
                afm={{}}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreTreemap).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: [] }, { itemIdentifiers: ["measureGroup"] }]);
        });
    });

    it("should provide default resultSpec to core Treemap with attributes", () => {
        const wrapper = mount(
            <Treemap
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreTreemap).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: ["measureGroup"] }, { itemIdentifiers: ["a1"] }]);
        });
    });
});
