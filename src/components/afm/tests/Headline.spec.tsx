// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { Headline as AfmHeadline } from "../Headline";
import { Headline } from "../../core/Headline";
import { dummyHeadlineExecuteAfmAdapterFactory } from "./utils/DummyHeadlineExecuteAfmAdapter";
import { executionRequest } from "./utils/dummyHeadlineFixture";

describe("Headline", () => {
    it("should provide default resultSpec to core Headline with measures", () => {
        const wrapper = mount(
            <AfmHeadline
                projectId="prId"
                afm={executionRequest.execution.afm}
                resultSpec={{}}
                adapterFactory={dummyHeadlineExecuteAfmAdapterFactory}
            />,
        );

        return testUtils.delay().then(() => {
            wrapper.update();
            const dimensions = wrapper.find(Headline).props().resultSpec.dimensions;
            expect(dimensions).toEqual([
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ]);
        });
    });
});
