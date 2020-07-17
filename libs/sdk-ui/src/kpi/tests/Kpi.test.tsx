// (C) 2007-2018 GoodData Corporation
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { newMeasure } from "@gooddata/sdk-model";
import { mount } from "enzyme";
import React from "react";
import { LoadingComponent } from "../../base/react/LoadingComponent";
import { createDummyPromise } from "../../base/react/tests/toolkit";
import { FormattedNumber } from "../FormattedNumber";
import { Kpi } from "../Kpi";

const testCustomFormat = "$#,#.##";
const testMeasure = newMeasure("m1", (m) => m.localId("m1").format(testCustomFormat));
const testWorkspace = "dummyWorkspace";

describe("Kpi", () => {
    it("should render loading indicator", () => {
        const wrapper = mount(
            <Kpi backend={dummyBackendEmptyData()} workspace={testWorkspace} measure={testMeasure} />,
        );

        expect(wrapper.find(LoadingComponent)).toHaveLength(1);
    });

    it("should render formatted number when loaded", async () => {
        const wrapper = mount(
            <Kpi backend={dummyBackendEmptyData()} workspace={testWorkspace} measure={testMeasure} />,
        );

        await createDummyPromise({ delay: 100 });
        wrapper.update();
        expect(wrapper.find(FormattedNumber)).toHaveLength(1);
    });

    it("should propagate custom measure format", async () => {
        const wrapper = mount(
            <Kpi backend={dummyBackendEmptyData()} workspace={testWorkspace} measure={testMeasure} />,
        );

        await createDummyPromise({ delay: 100 });
        wrapper.update();
        expect(wrapper.find(FormattedNumber).prop("format")).toBe(testCustomFormat);
    });
});
