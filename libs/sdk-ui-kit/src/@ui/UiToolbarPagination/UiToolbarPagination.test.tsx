// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { type IUiToolbarPaginationProps, UiToolbarPagination } from "./UiToolbarPagination.js";

const A11Y = { ariaLabel: "Page", previousLabel: "Previous page", nextLabel: "Next page" };

function renderPagination(props: Partial<IUiToolbarPaginationProps> = {}) {
    const onPageChange = vi.fn();
    const result = render(
        <UiToolbarPagination
            currentPage={3}
            totalPages={12}
            onPageChange={onPageChange}
            accessibilityConfig={A11Y}
            {...props}
        />,
    );
    return { ...result, onPageChange };
}

describe("UiToolbarPagination", () => {
    it("shows the position as a readout by default and announces it", () => {
        renderPagination({ accessibilityConfig: { ...A11Y, valueText: "Page 3 of 12" } });

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        expect(screen.getByText("3 / 12")).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Page 3 of 12");
    });

    it("moves to the previous and next page", async () => {
        const { user, onPageChange } = renderPagination();

        await user.click(screen.getByRole("button", { name: "Previous page" }));
        await user.click(screen.getByRole("button", { name: "Next page" }));

        expect(onPageChange.mock.calls).toEqual([[2], [4]]);
    });

    it("disables the side control at each end of the range", async () => {
        const { user, onPageChange, rerender } = renderPagination({ currentPage: 1 });

        const previous = screen.getByRole("button", { name: "Previous page" });
        expect(previous).toHaveAttribute("aria-disabled", "true");
        await user.click(previous);
        expect(onPageChange).not.toHaveBeenCalled();

        rerender(
            <UiToolbarPagination
                currentPage={12}
                totalPages={12}
                onPageChange={onPageChange}
                accessibilityConfig={A11Y}
            />,
        );
        expect(screen.getByRole("button", { name: "Next page" })).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByRole("button", { name: "Previous page" })).not.toHaveAttribute("aria-disabled");
    });

    it("goes to a typed page on Enter, with the total as its description", async () => {
        const { user, onPageChange } = renderPagination({
            isValueEditable: true,
            accessibilityConfig: { ...A11Y, totalLabel: "of 12" },
        });
        const input = screen.getByRole("textbox", { name: "Page" });
        expect(input).toHaveAccessibleDescription("of 12");

        await user.clear(input);
        await user.type(input, "7");
        await user.keyboard("{Enter}");

        expect(onPageChange).toHaveBeenCalledWith(7);
    });

    it("clamps a typed page to the range and ignores text that is not a number", async () => {
        const { user, onPageChange } = renderPagination({ isValueEditable: true });
        const input = screen.getByRole("textbox", { name: "Page" });

        await user.clear(input);
        await user.type(input, "99{Enter}");
        expect(onPageChange).toHaveBeenLastCalledWith(12);

        await user.clear(input);
        await user.type(input, "abc{Enter}");
        expect(onPageChange).toHaveBeenCalledTimes(1);
        expect(input).toHaveValue("3");
    });

    it("reverts the typed page on Escape and goes to it on blur", async () => {
        const { user, onPageChange } = renderPagination({ isValueEditable: true });
        const input = screen.getByRole("textbox", { name: "Page" });

        await user.clear(input);
        await user.type(input, "5{Escape}");
        expect(input).toHaveValue("3");
        expect(onPageChange).not.toHaveBeenCalled();

        await user.clear(input);
        await user.type(input, "5");
        await user.tab();
        expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it("keeps a disabled editable page read-only", async () => {
        const { user, onPageChange } = renderPagination({ isValueEditable: true, isDisabled: true });
        const input = screen.getByRole("textbox", { name: "Page" });

        expect(input).toHaveAttribute("readonly");
        await user.click(screen.getByRole("button", { name: "Next page" }));
        expect(onPageChange).not.toHaveBeenCalled();
    });
});
