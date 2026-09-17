// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHeaderCellAriaLabel } from "./useHeaderCellAriaLabel.js";

describe("useHeaderCellAriaLabel", () => {
    it("sets the aria-label when given a truthy value", () => {
        const eGridHeader = document.createElement("div");

        renderHook(() => useHeaderCellAriaLabel(eGridHeader, "Grand Total"));

        expect(eGridHeader.getAttribute("aria-label")).toBe("Grand Total");
    });

    it("never touches the attribute when ariaLabel is falsy and this hook has not previously labelled the element - AG Grid or a prior process owns whatever is (or isn't) there", () => {
        const eGridHeader = document.createElement("div");
        eGridHeader.setAttribute("aria-label", "Some pre-existing label");

        renderHook(() => useHeaderCellAriaLabel(eGridHeader, ""));

        expect(eGridHeader.getAttribute("aria-label")).toBe("Some pre-existing label");
    });

    it("removes a previously set aria-label once the value becomes falsy again, when no default is given", () => {
        const eGridHeader = document.createElement("div");
        const { rerender } = renderHook<void, { ariaLabel: string | undefined }>(
            ({ ariaLabel }) => useHeaderCellAriaLabel(eGridHeader, ariaLabel),
            { initialProps: { ariaLabel: "Grand Total" } },
        );

        expect(eGridHeader.getAttribute("aria-label")).toBe("Grand Total");

        rerender({ ariaLabel: undefined });

        expect(eGridHeader.hasAttribute("aria-label")).toBe(false);
    });

    it("falls back to the default label instead of leaving the element unnamed once a previously set alias is reset", () => {
        const eGridHeader = document.createElement("div");
        const { rerender } = renderHook<void, { ariaLabel: string | undefined }>(
            ({ ariaLabel }) => useHeaderCellAriaLabel(eGridHeader, ariaLabel, "Sum"),
            { initialProps: { ariaLabel: "Grand Total" } },
        );

        expect(eGridHeader.getAttribute("aria-label")).toBe("Grand Total");

        rerender({ ariaLabel: undefined });

        expect(eGridHeader.getAttribute("aria-label")).toBe("Sum");
    });

    it("does not set the default label on an element it has never labelled, even when one is provided", () => {
        const eGridHeader = document.createElement("div");

        renderHook(() => useHeaderCellAriaLabel(eGridHeader, "", "Sum"));

        expect(eGridHeader.hasAttribute("aria-label")).toBe(false);
    });
});
