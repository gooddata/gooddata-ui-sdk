// (C) 2020-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { Checkbox } from "../Checkbox.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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
