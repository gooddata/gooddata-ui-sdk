// (C) 2019 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";

import { DisabledBubbleMessage } from "../DisabledBubbleMessage";
import { createInternalIntl } from "../../utils/internalIntlProvider";

function createComponent(showDisabledMessage: boolean = true) {
    return shallow(
        <DisabledBubbleMessage intl={createInternalIntl()} showDisabledMessage={showDisabledMessage}>
            <div className={"bubble-trigger"}>{"Foo"}</div>
        </DisabledBubbleMessage>,
    );
}

describe("DisabledBubbleMessage", () => {
    it("should create Bubble component without invisible class by default", () => {
        const wrapper = createComponent();
        expect(wrapper.find(".bubble-primary.invisible").length).toBe(0);
    });

    it("should create Bubble component with invisible class", () => {
        const wrapper = createComponent(false);
        expect(wrapper.find(".bubble-primary.invisible").length).toBe(1);
    });
});
