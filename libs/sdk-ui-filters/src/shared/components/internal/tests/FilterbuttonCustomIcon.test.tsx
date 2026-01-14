// (C) 2023-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IFilterButtonCustomIcon } from "../../../interfaces/index.js";
import { FilterButtonCustomIcon } from "../FilterButtonCustomIcon.js";

const CUSTOM_ICON_WRAPPER_SELECTOR = ".s-gd-filter-button-custom-icon-wrapper";
const DISABLED_SELECTOR = ".s-disabled";

describe("FilterButtonCustomIcon", () => {
    const renderCustomIcon = (params?: { customIcon?: IFilterButtonCustomIcon; disabled?: boolean }) => {
        return render(<FilterButtonCustomIcon {...params} />);
    };

    const customIcon: IFilterButtonCustomIcon = {
        icon: "gd-icon-lock",
        tooltip: "This filter is locked, its value cannot be changed outside of edit mode.",
        bubbleClassNames: "bubble-primary",
        bubbleAlignPoints: [{ align: "bc tl", offset: { x: 0, y: 7 } }],
    };

    it("should render custom icon correctly", async () => {
        renderCustomIcon({ customIcon });
        const icon = document.querySelector(`.${customIcon.icon}`);
        expect(icon).toBeInTheDocument();

        fireEvent.mouseOver(document.querySelector(`.${customIcon.icon}`)!);
        await waitFor(() => {
            expect(screen.queryByText(customIcon.tooltip)).toBeInTheDocument();
        });
    });

    it("should not render custom icon when customIcon is undefined", () => {
        const { container } = renderCustomIcon();
        expect(container.querySelector(CUSTOM_ICON_WRAPPER_SELECTOR)).toBeFalsy();
    });

    it("should render disabled icon", () => {
        const { container } = renderCustomIcon({ customIcon, disabled: true });
        expect(container.querySelector(DISABLED_SELECTOR)).toBeInTheDocument();
    });

    it("should not render disabled icon", () => {
        const { container } = renderCustomIcon({ customIcon });
        expect(container.querySelector(DISABLED_SELECTOR)).toBeFalsy();
    });
});
