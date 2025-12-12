// (C) 2023-2025 GoodData Corporation

import { type SyntheticEvent } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IFormatPreset, type IToggleButtonProps } from "@gooddata/sdk-ui-kit";

import { TEST_PERCENT_ROUNDED_FORMAT_PRESET } from "../../../../../../tests/testDataProvider.js";
import { NumberFormatToggleButton } from "../NumberFormatToggleButton.js";

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
            toggleDropdown?: (e: SyntheticEvent) => void;
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

        // eslint-disable-next-line @vitest/no-identical-title
        it("Should disabled dropdown button", () => {
            const { container } = renderNumberFormatToggleButton();
            expect(container.querySelector("button")).not.toHaveClass("disabled");
        });
    });
});
