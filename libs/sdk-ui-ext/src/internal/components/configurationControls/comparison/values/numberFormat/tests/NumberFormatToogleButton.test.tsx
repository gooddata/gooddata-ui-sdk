// (C) 2023 GoodData Corporation
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { IFormatPreset, IToggleButtonProps } from "@gooddata/sdk-ui-kit";

import NumberFormatToggleButton from "../NumberFormatToggleButton.js";
import { TEST_PERCENT_ROUNDED_FORMAT_PRESET } from "../../../../../../tests/testDataProvider.js";

const DROPDOWN_BUTTON_SELECTOR = ".dropdown-button";

describe("NumberFormatToggleButton", () => {
    const mockToggleDropdown = vi.fn();

    const DEFAULT_PROPS: IToggleButtonProps = {
        text: `Format: ${TEST_PERCENT_ROUNDED_FORMAT_PRESET.name}`,
        isOpened: false,
        toggleDropdown: mockToggleDropdown,
        selectedPreset: TEST_PERCENT_ROUNDED_FORMAT_PRESET,
        disabled: false,
    };

    const renderNumberFormatToggleButton = (
        params: {
            isOpened?: boolean;
            toggleDropdown?: (e: React.SyntheticEvent) => void;
            selectedPreset?: IFormatPreset;
            disabled?: boolean;
        } = {},
    ) => {
        const props: IToggleButtonProps = {
            ...DEFAULT_PROPS,
            ...params,
        };

        return render(<NumberFormatToggleButton {...props} />);
    };

    it("Should render based on dropdown-button", () => {
        const { container } = renderNumberFormatToggleButton();
        expect(container.querySelector(DROPDOWN_BUTTON_SELECTOR)).toBeInTheDocument();
    });

    it("Should render button title based on selected-preset name", () => {
        const { getByText } = renderNumberFormatToggleButton();
        expect(getByText(TEST_PERCENT_ROUNDED_FORMAT_PRESET.name)).toBeInTheDocument();
    });

    describe("Disabled", () => {
        it("Should disabled dropdown button", () => {
            const { container } = renderNumberFormatToggleButton({ disabled: true });
            expect(container.querySelector("button")).toHaveClass("disabled");
        });

        it("Should disabled dropdown button", () => {
            const { container } = renderNumberFormatToggleButton();
            expect(container.querySelector("button")).not.toHaveClass("disabled");
        });
    });
});
