// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getCsvDelimiterState } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { CsvDelimiterPicker, type ICsvDelimiterPickerProps } from "./CsvDelimiterPicker.js";

const Wrapped = withIntlForTest(CsvDelimiterPicker);

function renderPicker(props: Partial<ICsvDelimiterPickerProps> = {}) {
    const onChange = vi.fn();
    render(<Wrapped value={getCsvDelimiterState(",")} onChange={onChange} {...props} />);
    return { onChange };
}

function getTrigger() {
    return document.querySelector(".s-csv-delimiter-dropdown")!;
}

function openMenu() {
    fireEvent.click(getTrigger());
}

describe("CsvDelimiterPicker", () => {
    it("shows the Inherit option by default", () => {
        renderPicker();
        openMenu();

        expect(screen.getByText("Inherit")).toBeInTheDocument();
        expect(screen.getByText("Comma")).toBeInTheDocument();
    });

    it("hides the Inherit option when hideInherit is set", () => {
        renderPicker({ hideInherit: true });
        openMenu();

        expect(screen.queryByText("Inherit")).not.toBeInTheDocument();
        expect(screen.getByText("Comma")).toBeInTheDocument();
    });

    it("falls back to the default preset when hideInherit is set but value is inherit", () => {
        renderPicker({ hideInherit: true, value: getCsvDelimiterState(undefined) });

        expect(document.querySelector(".s-csv-delimiter-dropdown")).not.toHaveTextContent("Inherit");
        expect(document.querySelector(".s-csv-delimiter-dropdown")).toHaveTextContent("Comma");
    });

    it("exposes the trigger as a button controlling a menu only while open", () => {
        renderPicker();

        expect(getTrigger()).not.toHaveAttribute("role");
        expect(screen.getByRole("button", { name: "CSV delimiter Comma (,)" })).toBe(getTrigger());
        expect(getTrigger()).toHaveAttribute("aria-haspopup", "menu");
        expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
        expect(getTrigger()).not.toHaveAttribute("aria-controls");

        openMenu();

        const menu = screen.getByRole("menu", { name: "CSV delimiter" });
        expect(getTrigger()).toHaveAttribute("aria-expanded", "true");
        expect(getTrigger()).toHaveAttribute("aria-controls", menu.id);
    });

    it("exposes the current delimiter as a checked radio item", () => {
        renderPicker();
        openMenu();

        const items = screen.getAllByRole("menuitemradio");
        expect(items.map((item) => item.getAttribute("aria-checked"))).toEqual([
            "false",
            "true",
            "false",
            "false",
            "false",
            "false",
        ]);
        expect(screen.getByRole("menuitemradio", { name: /Comma/ })).toHaveAttribute("aria-checked", "true");
    });

    it("selects an item and closes the menu", () => {
        const { onChange } = renderPicker();
        openMenu();

        fireEvent.click(screen.getByText("Semicolon"));

        expect(onChange).toHaveBeenCalledWith({ selectedPreset: "semicolon", customDelimiter: "" });
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("associates the label with the trigger and names it with the current value", () => {
        renderPicker({ label: "Delimiter" });

        const label = screen.getByText("Delimiter", { selector: "label" });
        expect(label).toHaveClass("gd-label");
        expect(label).toHaveAttribute("for", getTrigger().id);
        expect(screen.getByRole("button", { name: "Delimiter Comma (,)" })).toBe(getTrigger());
    });
});
