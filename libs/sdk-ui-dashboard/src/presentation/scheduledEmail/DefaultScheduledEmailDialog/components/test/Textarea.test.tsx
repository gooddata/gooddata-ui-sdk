// (C) 2019-2025 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import { ITextareaProps, Textarea } from "../Textarea.js";

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
            onChange: () => {},
            validationError: null,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <Textarea {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should trigger onChange event", async () => {
        const value = "new value";
        const onChange = vi.fn();
        renderComponent({ onChange });

        fireEvent.change(screen.getByRole("textbox"), { target: { value } });
        await waitFor(() => {
            expect(onChange).toBeCalledWith(expect.stringContaining(value));
        });
    });
});
