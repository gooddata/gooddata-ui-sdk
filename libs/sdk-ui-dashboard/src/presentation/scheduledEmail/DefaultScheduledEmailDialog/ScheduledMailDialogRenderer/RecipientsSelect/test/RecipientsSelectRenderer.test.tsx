// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import { IUser, uriRef } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";
import { defaultImport } from "default-import";

import { IRecipientsSelectRendererProps, RecipientsSelectRenderer } from "../RecipientsSelectRenderer.js";

import { IScheduleEmailRecipient } from "../../../interfaces.js";
import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

const author: IScheduleEmailRecipient = {
    user: {
        login: "user@gooddata.com",
        ref: uriRef("/gdc/user"),
        email: "user@gooddata.com",
        fullName: "John Doe",
    },
};

const extraUser: IScheduleEmailRecipient = {
    user: {
        login: "extraUser@gooddata.com",
        ref: uriRef("/gdc/extraUser"),
        email: "extraUser@gooddata.com",
        fullName: "Adam Bradley",
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
    function renderComponent(customProps: Partial<IRecipientsSelectRendererProps> = {}) {
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

        return render(
            <IntlWrapper>
                <RecipientsSelectRenderer {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render single Select component", () => {
        renderComponent();

        expect(screen.getByText(`${author.user.fullName}`)).toBeInTheDocument();
    });

    it("should render multiple Select component", () => {
        renderComponent({ isMulti: true, value: [author, extraUser] });

        expect(screen.getByText(`${author.user.fullName}`)).toBeInTheDocument();
        expect(screen.getByText(`${extraUser.user.email}`)).toBeInTheDocument();
    });

    it("should render Owner user without icon remove", () => {
        renderComponent();
        expect(screen.queryByLabelText("remove-icon")).not.toBeInTheDocument();
    });

    it("should change input when adding new value", async () => {
        renderComponent({ isMulti: true });
        await userEvent.type(screen.getByRole("combobox"), "extraUser@gooddata.com");

        expect(screen.getByText(`${author.user.fullName}`)).toBeInTheDocument();

        expect(screen.getByDisplayValue(`${extraUser.user.email}`)).toBeInTheDocument();
    });
});
