// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IParameterAllowedValue } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { getFocusableElements } from "../utils/domUtilities.js";

import { AllowedValuesParameterControlDropdown } from "./AllowedValuesParameterControlDropdown.js";

const WrappedAllowedValuesParameterControlDropdown = withIntlForTest(AllowedValuesParameterControlDropdown);

const allowedValues: IParameterAllowedValue[] = [
    { value: "actual", title: "Actual results" },
    { value: "plan", title: "Plan" },
    { value: "forecast" },
];

const manyAllowedValues: IParameterAllowedValue[] = Array.from({ length: 8 }, (_, index) => ({
    value: `value-${index}`,
    title: `Title ${index}`,
}));

const renderDropdown = (
    props: Partial<React.ComponentProps<typeof AllowedValuesParameterControlDropdown>> = {},
) => {
    return render(
        <WrappedAllowedValuesParameterControlDropdown
            name="Scenario"
            value="actual"
            defaultValue="plan"
            allowedValues={allowedValues}
            onSelect={() => {}}
            onClose={() => {}}
            {...props}
        />,
    );
};

// Mirrors how Dropdown's autofocus falls back to the panel's first focusable element.
const firstFocusableOfPanel = () =>
    getFocusableElements(screen.getByTestId("parameter-control-allowed-values-dropdown"), true).firstElement;

describe("AllowedValuesParameterControlDropdown", () => {
    it("renders one row per allowed value, in list order, labeled with the effective title", async () => {
        renderDropdown();
        const items = await screen.findAllByRole("option");
        expect(items.map((item) => item.textContent)).toEqual([
            "Actual results",
            "Plan(Default)",
            "forecast",
        ]);
    });

    it("marks only the row matching the current value as selected", async () => {
        renderDropdown({ value: "plan" });
        const items = await screen.findAllByRole("option");
        expect(items.map((item) => item.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
    });

    it("selects the clicked row's raw value once", async () => {
        const onSelect = vi.fn();
        renderDropdown({ onSelect });
        fireEvent.click(await screen.findByText("Plan"));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith("plan");
    });

    it("renders no Apply or Cancel buttons", async () => {
        renderDropdown();
        await screen.findAllByRole("option");
        expect(screen.queryByTestId("parameter-control-dropdown-apply")).not.toBeInTheDocument();
        expect(screen.queryByTestId("parameter-control-dropdown-cancel")).not.toBeInTheDocument();
    });

    it("renders no search field for a list at the threshold", async () => {
        renderDropdown({ allowedValues: manyAllowedValues.slice(0, 7) });
        await screen.findAllByRole("option");
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("renders a search field for a list above the threshold", async () => {
        renderDropdown({ allowedValues: manyAllowedValues });
        await screen.findAllByRole("option");
        expect(screen.getByRole("textbox", { name: "Search values" })).toHaveAttribute(
            "placeholder",
            "Search…",
        );
    });

    it("filters rows by title, case-insensitively", async () => {
        renderDropdown({ allowedValues: manyAllowedValues });
        await screen.findAllByRole("option");
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "title 3" } });
        const items = await screen.findAllByRole("option");
        expect(items.map((item) => item.textContent)).toEqual(["Title 3"]);
    });

    it("shows the no-matching-data message when the search matches nothing", async () => {
        renderDropdown({ allowedValues: manyAllowedValues });
        await screen.findAllByRole("option");
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "nothing" } });
        expect(screen.queryAllByRole("option")).toHaveLength(0);
        expect(await screen.findByText("No matching data")).toBeInTheDocument();
    });

    it("suffixes only the row matching the default value with (Default), keeping its title", async () => {
        renderDropdown({ defaultValue: "plan" });
        const items = await screen.findAllByRole("option");
        expect(items.map((item) => item.textContent?.includes("(Default)"))).toEqual([false, true, false]);
        expect(items[1].textContent).toContain("Plan");
    });

    it("suffixes the default row even when it is the selected one", async () => {
        renderDropdown({ value: "plan", defaultValue: "plan" });
        const items = await screen.findAllByRole("option");
        expect(items[1]).toHaveAttribute("aria-selected", "true");
        expect(items[1].textContent).toContain("(Default)");
    });

    it("selects the default row's raw value when it is clicked", async () => {
        const onSelect = vi.fn();
        renderDropdown({ value: "plan", defaultValue: "actual", onSelect });
        fireEvent.click(await screen.findByText("Actual results"));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith("actual");
    });

    it("selects the keyboard-navigated row on Enter", async () => {
        const onSelect = vi.fn();
        renderDropdown({ onSelect });
        await screen.findAllByRole("option");
        const list = screen.getByRole("listbox");
        fireEvent.keyDown(list, { code: "ArrowDown", key: "ArrowDown" });
        fireEvent.keyDown(list, { code: "Enter", key: "Enter" });
        expect(onSelect).toHaveBeenCalledWith("plan");
    });

    it("closes without selecting on Escape in the list", async () => {
        const onSelect = vi.fn();
        const onClose = vi.fn();
        renderDropdown({ onSelect, onClose });
        await screen.findAllByRole("option");
        fireEvent.keyDown(screen.getByRole("listbox"), { code: "Escape", key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("exposes the list as a listbox named after the parameter", async () => {
        renderDropdown({ name: "Scenario" });
        await screen.findAllByRole("option");
        expect(screen.getByRole("listbox")).toHaveAttribute("aria-label", "Scenario");
    });

    it("offers the search field first for the initial focus, the list when there is no search", async () => {
        const { unmount } = renderDropdown({ allowedValues: manyAllowedValues });
        await screen.findAllByRole("option");
        expect(firstFocusableOfPanel()).toBe(screen.getByRole("textbox"));
        unmount();

        renderDropdown();
        await screen.findAllByRole("option");
        expect(firstFocusableOfPanel()).toBe(screen.getByRole("listbox"));
    });

    it("never displays the raw value of a titled allowed value", async () => {
        renderDropdown({ value: "sc-1", allowedValues: [{ value: "sc-1", title: "Actual results" }] });
        expect(await screen.findByText("Actual results")).toBeInTheDocument();
        expect(screen.getByTestId("parameter-control-allowed-values-dropdown").textContent).not.toContain(
            "sc-1",
        );
    });
});
