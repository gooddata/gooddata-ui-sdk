// (C) 2019-2020 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { ReactWrapper, mount } from "enzyme";
import { IUser, uriRef } from "@gooddata/sdk-model";

import { IRecipientsSelectRendererProps, RecipientsSelectRenderer } from "../RecipientsSelectRenderer";
import { IScheduleEmailRecipient } from "../../../interfaces";
import { IntlWrapper } from "../../../../../localization/IntlWrapper";

const author: IScheduleEmailRecipient = {
    user: {
        login: "user@gooddata.com",
        ref: uriRef("/gdc/user"),
        email: "user@gooddata.com",
        fullName: "John Doe",
    },
};

const currentUser: IUser = {
    login: "user@gooddata.com",
    ref: uriRef("/gdc/user"),
    email: "user@gooddata.com",
    fullName: "John Doe",
};

const options: IScheduleEmailRecipient[] = [
    {
        user: {
            login: "user2@gooddata.com",
            ref: uriRef("/gdc/user2"),
            email: "user2@gooddata.com",
            fullName: "Jack Sparrow",
        },
    },
    {
        email: "stephen.hawking@gooddata.com",
    },
];

describe("RecipientsSelect", () => {
    function renderComponent(customProps: Partial<IRecipientsSelectRendererProps> = {}): ReactWrapper {
        const defaultProps = {
            options,
            value: [author],
            originalValue: [],
            currentUser,
            author,
            isMulti: false,
            onChange: noop,
            onLoad: noop,
            ...customProps,
        };

        return mount(
            <IntlWrapper>
                <RecipientsSelectRenderer {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render single Select component", () => {
        const component = renderComponent();

        expect(component).toExist();
        expect(component.find(".s-gd-recipients-value .single-value")).toHaveLength(1);
    });

    it("should render multiple Select component", () => {
        const component = renderComponent({ isMulti: true });

        expect(component).toExist();
        expect(component.find(".s-gd-recipients-value .multiple-value")).toHaveLength(1);
    });

    it("should render Owner value in recipient component", () => {
        const singleSelectComponent = renderComponent();
        const multipleSelectComponent = renderComponent({ isMulti: true });

        expect(singleSelectComponent.find(".s-gd-recipient-value-item").text()).toEqual("John Doe");
        expect(multipleSelectComponent.find(".s-gd-recipient-value-item").text()).toEqual("John Doe");
    });

    it("should render Owner user without icon remove", () => {
        const selectComponent = renderComponent();
        expect(selectComponent.find(".s-gd-recipient-remove")).toHaveLength(0);
    });

    it("should shorten Owner user label if it's so long", () => {
        const selectComponent = renderComponent();
        expect(selectComponent.find(".s-gd-recipient-value-item .gd-recipient-label")).toHaveLength(1);
    });

    it("should trigger onChange action when input new value", () => {
        const onChange = jest.fn();
        const recipientComponent = renderComponent({ isMulti: true, onChange });
        const inputContainer = recipientComponent.find(".s-gd-recipient-input input");
        inputContainer.simulate("keyDown", { key: "ArrowDown", keyCode: 40 });
        inputContainer.simulate("keyDown", { key: "Enter", keyCode: 13 });

        expect(inputContainer).toExist();
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("should max width be added in owner container", () => {
        const recipientComponent = renderComponent({ isMulti: true });
        const owner = recipientComponent.find(".gd-owner-user");
        const ownerStyle = owner.props().style;

        expect(ownerStyle).toEqual({ maxWidth: "100%" });
    });
});
