// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { ColumnChart } from "../ColumnChart";
import { ColumnChart as CoreColumnChart } from "../../core/ColumnChart";
import { dummyExecuteAfmAdapterFactory } from "./utils/DummyExecuteAfmAdapter";

describe("ColumnChart", () => {
    const afmWithAttr = {
        measures: [] as any,
        attributes: [
            {
                localIdentifier: "a1",
                displayForm: { uri: "abc" },
            },
        ],
    };

    it("should provide default resultSpec to core ColumnChart with attributes", () => {
        const wrapper = mount(
            <ColumnChart
                projectId="prId"
                afm={afmWithAttr}
                resultSpec={{}}
                adapterFactory={dummyExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(CoreColumnChart).props().resultSpec.dimensions;
            expect(dimensions).toEqual([{ itemIdentifiers: ["measureGroup"] }, { itemIdentifiers: ["a1"] }]);
        });
    });
});
