// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { Kpi } from "../Kpi";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { newMeasure } from "@gooddata/sdk-model";
import { FormattedNumber } from "../FormattedNumber";
import { createDummyPromise } from "../../base/promise/tests/toolkit";
import { LoadingComponent } from "../../base/simple/LoadingComponent";

const testCustomFormat = "$#,#.##";
const testMeasure = newMeasure("m1", m => m.localId("m1").format(testCustomFormat));
const testWorkspace = "dummyWorkspace";

describe("Kpi", () => {
    it("should render loading indicator", () => {
        const wrapper = mount(
            <Kpi backend={dummyBackend()} workspace={testWorkspace} measure={testMeasure} />,
        );

        expect(wrapper.find(LoadingComponent)).toHaveLength(1);
    });

    it("should render formatted number when loaded", async done => {
        const wrapper = mount(
            <Kpi backend={dummyBackend()} workspace={testWorkspace} measure={testMeasure} />,
        );

        await createDummyPromise({ delay: 100 });
        wrapper.update();
        expect(wrapper.find(FormattedNumber)).toHaveLength(1);
        done();
    });

    it("should propagate custom measure format", async done => {
        const wrapper = mount(
            <Kpi backend={dummyBackend()} workspace={testWorkspace} measure={testMeasure} />,
        );

        await createDummyPromise({ delay: 100 });
        wrapper.update();
        expect(wrapper.find(FormattedNumber).prop("format")).toBe(testCustomFormat);
        done();
    });
});
