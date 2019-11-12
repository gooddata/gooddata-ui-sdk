// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import { legacyRecordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { MasterIndex } from "../../../../__mocks__/recordings/playlist";
import { waitForAsync } from "../../../../testUtils/synchronization";

import { AttributeFilter } from "../AttributeFilter";
import { AttributeDropdown } from "../AttributeDropdown/AttributeDropdown";

describe("AttributeFilter", () => {
    const backend = legacyRecordedBackend(MasterIndex);
    const workspace = "testWorkspace";

    it("should be in loading state until attribute display form title is loaded", async () => {
        const rendered = mount(
            <AttributeFilter
                identifier="label.method.method"
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        expect(rendered.exists(".s-button-loading")).toEqual(true);
    });

    it("should download attribute display form title", async () => {
        const rendered = mount(
            <AttributeFilter
                identifier="label.method.method"
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.find(AttributeDropdown).prop("title")).toEqual("Method");
    });

    it("should display error if attribute display form title load fails", async () => {
        const rendered = mount(
            <AttributeFilter
                identifier="non existing display form"
                backend={backend}
                onApply={noop}
                workspace={workspace}
            />,
        );

        await waitForAsync();
        rendered.update();

        expect(rendered.exists(".s-button-error")).toEqual(true);
    });
});
