// (C) 2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { DropdownButton } from "@gooddata/sdk-ui-kit";

import PushpinSizeControl, { IPushpinSizeControl } from "../PushpinSizeControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";

describe("PushpinSizeControl", () => {
    const defaultProps = {
        disabled: false,
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IPushpinSizeControl> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(
            <InternalIntlWrapper>
                <PushpinSizeControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render PushpinSizeControl", () => {
            const wrapper = createComponent();

            expect(wrapper.find(PushpinSizeControl).length).toBe(1);
        });

        it("should render disabled PushpinSizeControl", () => {
            const wrapper = createComponent({
                disabled: true,
            });
            const smallestDropdown = wrapper.find(DropdownButton).first();
            const largestDropdown = wrapper.find(DropdownButton).last();

            expect(smallestDropdown.prop("disabled")).toBe(true);
            expect(largestDropdown.prop("disabled")).toBe(true);
        });
    });
});
