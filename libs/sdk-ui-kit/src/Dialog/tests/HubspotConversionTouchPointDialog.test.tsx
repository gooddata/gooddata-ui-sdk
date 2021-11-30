// (C) 2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { Overlay } from "../../Overlay";
import { HubspotConversionTouchPointDialog } from "../HubspotConversionTouchPointDialog";
import { HubspotConversionTouchPointDialogBase } from "../HubspotConversionTouchPointDialogBase";
import { DialogBase } from "../DialogBase";

describe("ConversionTouchPointDialog", () => {
    it("should render content", () => {
        const wrapper = mount(
            <IntlWrapper locale="en-US">
                <HubspotConversionTouchPointDialog
                    onClose={jest.fn()}
                    onFormSubmitted={jest.fn()}
                    dialogTitle="How can we help"
                    hubspotPortalId="8934247"
                    hubspotFormId="94ade70f-4052-432d-9453-5cbf26981926"
                />
            </IntlWrapper>,
        );

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(DialogBase)).toHaveLength(1);
        expect(wrapper.find(HubspotProvider)).toHaveLength(1);
        expect(wrapper.find(HubspotConversionTouchPointDialogBase)).toHaveLength(1);
    });
});
