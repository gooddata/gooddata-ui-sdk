// (C) 2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { HubspotConversionTouchPointDialogBase } from "../HubspotConversionTouchPointDialogBase";
import { DialogBase } from "../DialogBase";
import { GoodDataPricingPlansDialog } from "../GoodDataPricingPlansDialog";

import { Overlay } from "../../Overlay";

describe("GoodDataPricingPlansDialog", () => {
    function renderComponent() {
        return mount(
            <IntlWrapper locale="en-US">
                <GoodDataPricingPlansDialog
                    onClose={jest.fn()}
                    onFormSubmitted={jest.fn()}
                    hubspotPortalId="8934247"
                    hubspotFormId="94ade70f-4052-432d-9453-5cbf26981926"
                />
            </IntlWrapper>,
        );
    }

    it("should render content", () => {
        const wrapper = renderComponent();
        const talkToUsBtn = wrapper.findWhere((ele) => {
            if (ele.type() === "button") {
                return ele.hasClass("gd-button-upsell");
            }
            return false;
        });

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(DialogBase)).toHaveLength(1);
        expect(talkToUsBtn).toHaveLength(2);
        expect(wrapper.find(HubspotProvider)).toHaveLength(1);
        expect(wrapper.find(HubspotConversionTouchPointDialogBase)).toHaveLength(1);
    });

    it("Should display the Request sent lable when the Talk to us button is clicked", () => {
        const wrapper = renderComponent();
        const talkToUsBtn = wrapper.findWhere((ele) => {
            if (ele.type() === "button") {
                return ele.hasClass("gd-button-upsell");
            }
            return false;
        });

        expect(wrapper.find("label.request-sent")).toHaveLength(0);

        talkToUsBtn.at(0).simulate("click");
        wrapper.update();

        expect(wrapper.find("label.request-sent")).toHaveLength(1);

        talkToUsBtn.at(1).simulate("click");
        wrapper.update();

        expect(wrapper.find("label.request-sent")).toHaveLength(2);
    });
});
