// (C) 2020-2025 GoodData Corporation
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "../Checkbox.js";

describe("ReactCheckbox", () => {
    function renderCheckbox(options = {}) {
        const props = {
            onChange: vi.fn(),
            ...options,
        };
        render(<Checkbox {...props} />);
        const checkbox = screen.getAllByRole("checkbox")[0];

        return {
            checkbox,
        };
    }

    describe("With configured callbacks", () => {
        it("should enable and un-check the checkbox", () => {
            const { checkbox } = renderCheckbox();

            expect(checkbox).not.toBeChecked();
            expect(checkbox).toBeEnabled();
        });

        it("should check the checkbox", () => {
            const { checkbox } = renderCheckbox({
                value: true,
            });

            expect(checkbox).toBeChecked();
        });

        it("should disable the checkbox", () => {
            const { checkbox } = renderCheckbox({
                disabled: true,
            });

            expect(checkbox).toBeDisabled();
        });

        it("should call onChange when value changed", async () => {
            const changedValue = true;
            const onChange = vi.fn();
            const { checkbox } = renderCheckbox({ onChange });

            await userEvent.click(checkbox);

            await waitFor(() => expect(onChange).toHaveBeenCalledWith(changedValue));
        });
    });
});
