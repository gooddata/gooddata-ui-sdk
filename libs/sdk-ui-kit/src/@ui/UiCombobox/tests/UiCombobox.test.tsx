// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IUiComboboxOption } from "../types.js";
import { type IUiComboboxProps, UiCombobox } from "../UiCombobox.js";
import { UiComboboxInput } from "../UiComboboxInput.js";
import { UiComboboxList } from "../UiComboboxList.js";
import { UiComboboxListItem } from "../UiComboboxListItem.js";
import { UiComboboxPopup } from "../UiComboboxPopup.js";

const options: IUiComboboxOption[] = [
    { id: "apple", label: "Apple" },
    { id: "banana", label: "Banana" },
    { id: "apricot", label: "Apricot" },
];

function TestCombobox(props: IUiComboboxProps) {
    return (
        <UiCombobox {...props}>
            <UiComboboxInput placeholder="Search..." />
            <UiComboboxPopup>
                <UiComboboxList>
                    {(option: IUiComboboxOption, index: number) => (
                        <UiComboboxListItem option={option} index={index} key={option.id} />
                    )}
                </UiComboboxList>
            </UiComboboxPopup>
        </UiCombobox>
    );
}

describe("UiCombobox", () => {
    it("filters options by input value using default filter", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        // Open the popup
        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });

        // All options are visible initially

        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Banana")).toBeInTheDocument();
        expect(screen.getByText("Apricot")).toBeInTheDocument();

        // Type "ap" to filter
        fireEvent.change(input, { target: { value: "ap" } });

        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Apricot")).toBeInTheDocument();
        expect(screen.queryByText("Banana")).not.toBeInTheDocument();
    });

    it("selects active option on Enter key", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        // Open the popup
        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });

        // Select with Enter
        fireEvent.keyDown(input, { code: "Enter" });

        expect(input.value).toBe("Apple");
    });

    it("shows all options again after selecting a value", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });

        fireEvent.change(input, { target: { value: "ap" } });
        fireEvent.click(screen.getByText("Apple"));

        expect(input.value).toBe("Apple");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });

        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Banana")).toBeInTheDocument();
        expect(screen.getByText("Apricot")).toBeInTheDocument();
    });

    it("resets input value to selected option on blur", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "Enter" });

        fireEvent.change(input, { target: { value: "ap" } });
        expect(input.value).toBe("ap");

        fireEvent.blur(input);

        expect(input.value).toBe("Apple");
        expect(screen.queryByText("Apricot")).not.toBeInTheDocument();
    });

    it("closes popup on blur when creatable and value is changed", () => {
        render(<TestCombobox options={options} creatable />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "ap" } });

        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Apricot")).toBeInTheDocument();
        expect(screen.getByText("ap")).toBeInTheDocument();

        fireEvent.blur(input);

        expect(screen.queryByText("Apple")).not.toBeInTheDocument();
        expect(screen.queryByText("Apricot")).not.toBeInTheDocument();
        expect(screen.queryByText("ap")).not.toBeInTheDocument();
    });

    it("closes popup on blur when value is changed", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "ap" } });

        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Apricot")).toBeInTheDocument();

        fireEvent.blur(input);

        expect(screen.queryByText("Apple")).not.toBeInTheDocument();
        expect(screen.queryByText("Apricot")).not.toBeInTheDocument();
    });

    it("keeps popup open on blur when focus moves to popup content", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "ap" } });

        const apricotOption = screen.getByText("Apricot");
        const mouseDownEvent = createEvent.mouseDown(apricotOption);

        fireEvent(apricotOption, mouseDownEvent);

        expect(mouseDownEvent.defaultPrevented).toBe(true);
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Apricot")).toBeInTheDocument();
    });

    it("does show creatable option when typing non-matching text", () => {
        render(<TestCombobox options={options} creatable />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "Mango" } });

        // No matching options, so no creatable option should appear
        expect(screen.queryByText("Apple")).not.toBeInTheDocument();
        expect(screen.queryByText("Mango")).toBeInTheDocument();
        expect(screen.queryAllByRole("option")).toHaveLength(1);
    });

    it("shows creatable option alongside matching options when multiple matches exist", () => {
        render(<TestCombobox options={options} creatable />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "ap" } });

        // Multiple matches + creatable option
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Apricot")).toBeInTheDocument();
        expect(screen.getByText("ap")).toBeInTheDocument(); // creatable option
    });

    it("does not show creatable option when input matches an existing option label", () => {
        const optionsWithExactMatch: IUiComboboxOption[] = [
            { id: "apple", label: "Apple" },
            { id: "apple-pie", label: "Apple Pie" },
        ];

        render(<TestCombobox options={optionsWithExactMatch} creatable />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "apple" } });

        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Apple Pie")).toBeInTheDocument();
        expect(screen.queryByText("apple")).not.toBeInTheDocument(); // no creatable option
        expect(screen.queryAllByText("Apple")).toHaveLength(1); // no duplicate
    });

    it("shows creatable option when exactly one partial match exists", () => {
        render(<TestCombobox options={options} creatable />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "Bana" } });

        expect(screen.getByText("Banana")).toBeInTheDocument();
        expect(screen.getByText("Bana")).toBeInTheDocument(); // creatable option
        expect(screen.queryAllByRole("option")).toHaveLength(2);
    });

    it("shows creatable option when no match exists", () => {
        render(<TestCombobox options={options} creatable />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "XXXXXXXXXX" } });

        expect(screen.getByText("XXXXXXXXXX")).toBeInTheDocument(); // creatable option
        expect(screen.queryAllByRole("option")).toHaveLength(1);
    });

    it("resets input value on blur when not creatable and something is selected and input was changed", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "Enter" });

        expect(input.value).toBe("Apple");

        fireEvent.change(input, { target: { value: "ap" } });
        expect(input.value).toBe("ap");

        fireEvent.blur(input);

        expect(input.value).toBe("Apple");
    });

    it("do not resets input value on blur when creatable and something is selected and input was changed", () => {
        render(<TestCombobox options={options} creatable />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "Enter" });

        expect(input.value).toBe("Apple");

        fireEvent.change(input, { target: { value: "ap" } });
        expect(input.value).toBe("ap");

        fireEvent.blur(input);

        expect(input.value).toBe("ap");
    });

    it("resets input value on Escape key when popup is closed", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "test" } });
        expect(input.value).toBe("test");

        // Close popup first
        fireEvent.keyDown(input, { code: "Escape" });
        // Then Escape again to reset
        fireEvent.keyDown(input, { code: "Escape" });

        expect(input.value).toBe("");
    });

    it("uses defaultValue as initial input value", () => {
        render(<TestCombobox options={options} defaultValue="Banana" />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        expect(input.value).toBe("Banana");
    });

    it("calls onValueChange when value changes in controlled mode", () => {
        const handleValueChange = vi.fn();

        function ControlledCombobox() {
            const [value, setValue] = useState("");
            return (
                <TestCombobox
                    options={options}
                    value={value}
                    onValueChange={(newValue) => {
                        setValue(newValue);
                        handleValueChange(newValue);
                    }}
                />
            );
        }

        render(<ControlledCombobox />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "Enter" });

        expect(handleValueChange).toHaveBeenCalledWith("Apple");
        expect(input.value).toBe("Apple");
    });

    it("navigates options with ArrowUp key", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });

        // Navigate down to second option
        fireEvent.keyDown(input, { code: "ArrowDown" });
        // Navigate back up
        fireEvent.keyDown(input, { code: "ArrowUp" });
        fireEvent.keyDown(input, { code: "Enter" });

        expect(input.value).toBe("Apple");
    });

    it("loops navigation when reaching the end of options", () => {
        render(<TestCombobox options={options} />);

        const input: HTMLInputElement = screen.getByRole("combobox");

        fireEvent.focus(input);
        fireEvent.keyDown(input, { code: "ArrowDown" });

        // Navigate past the last option (3 options, so 3 more ArrowDowns should loop back)
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "ArrowDown" });
        fireEvent.keyDown(input, { code: "Enter" });

        expect(input.value).toBe("Apple");
    });
});
