// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IRelativeRangeDynamicSelectProps,
    RelativeRangeDynamicSelect,
} from "./RelativeRangeDynamicSelect.js";
import { type DynamicSelectItem } from "./types.js";

const items: DynamicSelectItem[] = [
    { type: "option", value: -1, label: "yesterday" },
    { type: "option", value: 0, label: "today" },
    { type: "option", value: 1, label: "tomorrow" },
];

const waitForOverlayAlign = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)));

describe("RelativeRangeDynamicSelect", () => {
    const renderSelect = (props: Partial<IRelativeRangeDynamicSelectProps> = {}) => {
        const defaultProps: IRelativeRangeDynamicSelectProps = {
            getItems: () => items,
            inputValue: "",
            onInputValueChange: () => {},
            ...props,
        };
        const result = render(<RelativeRangeDynamicSelect {...defaultProps} />);
        return {
            ...result,
            rerenderWithSameProps: () => result.rerender(<RelativeRangeDynamicSelect {...defaultProps} />),
        };
    };

    describe.each([
        ["inline", false],
        ["in an overlay", true],
    ])("with the menu rendered %s", (_, renderMenuAsOverlay) => {
        it("should select the clicked option", async () => {
            const onChange = vi.fn();
            renderSelect({ onChange, renderMenuAsOverlay });

            fireEvent.focus(screen.getByRole("combobox"));
            await waitForOverlayAlign();
            fireEvent.click(screen.getByText("tomorrow"));

            expect(onChange).toHaveBeenCalledWith(1);
        });

        it("should select the clicked option after a re-render with the same props", async () => {
            const onChange = vi.fn();
            const { rerenderWithSameProps } = renderSelect({ onChange, renderMenuAsOverlay });

            fireEvent.focus(screen.getByRole("combobox"));
            await waitForOverlayAlign();
            // Downshift drops its registered items on every render, so the options must register again
            rerenderWithSameProps();
            fireEvent.click(screen.getByText("tomorrow"));

            expect(onChange).toHaveBeenCalledWith(1);
        });
    });
});
