// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/js-utils";
import { AttributeFilter } from "../AttributeFilter";
import { AttributeDropdown } from "../AttributeDropdown";
import { createMetadataMock } from "./utils";

describe("AttributeFilter", () => {
    function renderComponent(customProps = {}) {
        const sdk = {
            md: createMetadataMock(),
            clone: () => sdk,
            config: {
                setJsPackage: () => false,
                setRequestHeader: () => false,
            },
        };

        const props = {
            projectId: "storybook",
            onApply: () => ({}),
            sdk,
            ...customProps,
        };
        return mount(<AttributeFilter {...props as any} />);
    }

    it("should render loading button after mount", () => {
        const wrapper = renderComponent({ uri: "/gdc/md/projectId/obj/123" });
        expect(wrapper.find(".s-button-loading")).toHaveLength(1);
    });

    it("should detect usage of identifier and pass it to the AttributeDropdown", () => {
        const wrapper = renderComponent({ identifier: "id123" });

        return testUtils.delay().then(() => {
            wrapper.update();
            expect(wrapper.find(AttributeDropdown).prop("isUsingIdentifier")).toBeTruthy();
        });
    });
});
