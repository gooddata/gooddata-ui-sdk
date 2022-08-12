// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor, screen, fireEvent } from "@testing-library/react";
import noop from "lodash/noop";

import { Textarea, ITextareaProps } from "../Textarea";

import { IntlWrapper } from "../../../../localization/IntlWrapper";
import { setupComponent } from "../../../../../tests/testHelper";

describe("Textarea", () => {
    function renderComponent(customProps: Partial<ITextareaProps> = {}) {
        const defaultProps = {
            hasError: false,
            hasWarning: false,
            label: "",
            maxlength: 100,
            placeholder: "",
            value: "",
            rows: 4,
            onChange: noop,
            ...customProps,
        };

        return setupComponent(
            <IntlWrapper>
                <Textarea {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render label and text area with value", () => {
        const label = "subject";
        const value = "value";
        renderComponent({ label, value });
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
    });

    it("should trigger onChange event", async () => {
        const value = "new value";
        const onChange = jest.fn();
        renderComponent({ onChange });

        fireEvent.change(screen.getByRole("textbox"), { target: { value } });
        await waitFor(() => {
            expect(onChange).toBeCalledWith(expect.stringContaining(value));
        });
    });
});
