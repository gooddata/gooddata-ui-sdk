// (C) 2026 GoodData Corporation

import { useState } from "react";

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";
import { UiToolbarButton } from "../UiToolbarButton/UiToolbarButton.js";
import { UiToolbarIconButton } from "../UiToolbarIconButton/UiToolbarIconButton.js";

import { UiToolbarSegmentedControl } from "./UiToolbarSegmentedControl.js";

function Harness({ onChange = () => {} }: { onChange?: (value: string) => void }) {
    const [value, setValue] = useState<string | undefined>("cell");
    return (
        <UiToolbarSegmentedControl
            value={value}
            onChange={(next) => {
                setValue(next);
                onChange(next);
            }}
            accessibilityConfig={{ ariaLabel: "Scope" }}
        >
            <UiToolbarButton value="cell" label="Cell" />
            <UiToolbarButton value="row" label="Row" />
            <UiToolbarIconButton value="table" icon="plus" label="Table" hideTooltip />
        </UiToolbarSegmentedControl>
    );
}

describe("UiToolbarSegmentedControl", () => {
    it("renders a named radiogroup whose items are radios with aria-checked", () => {
        render(<Harness />);

        screen.getByRole("radiogroup", { name: "Scope" });
        const cell = screen.getByRole("radio", { name: "Cell" });
        const row = screen.getByRole("radio", { name: "Row" });

        expect(cell).toHaveAttribute("aria-checked", "true");
        expect(row).toHaveAttribute("aria-checked", "false");
        expect(cell).not.toHaveAttribute("aria-pressed");
        expect(cell).toHaveClass("gd-ui-kit-toolbar-button--isSelected");
        expect(row).not.toHaveClass("gd-ui-kit-toolbar-button--isSelected");
    });

    it("makes only the checked radio tabbable when standalone", () => {
        render(<Harness />);

        expect(screen.getByRole("radio", { name: "Cell" })).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("radio", { name: "Row" })).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("radio", { name: "Table" })).toHaveAttribute("tabindex", "-1");
    });

    it("selects on click", async () => {
        const onChange = vi.fn();
        const { user } = render(<Harness onChange={onChange} />);

        await user.click(screen.getByRole("radio", { name: "Row" }));

        expect(onChange).toHaveBeenCalledWith("row");
        expect(screen.getByRole("radio", { name: "Row" })).toHaveAttribute("aria-checked", "true");
        expect(screen.getByRole("radio", { name: "Row" })).toHaveAttribute("tabindex", "0");
    });

    it("moves selection and focus with arrow keys and wraps", async () => {
        const onChange = vi.fn();
        const { user } = render(<Harness onChange={onChange} />);
        const cell = screen.getByRole("radio", { name: "Cell" });
        const row = screen.getByRole("radio", { name: "Row" });
        const table = screen.getByRole("radio", { name: "Table" });

        cell.focus();
        await user.keyboard("{ArrowRight}");
        expect(row).toHaveFocus();
        expect(onChange).toHaveBeenLastCalledWith("row");

        await user.keyboard("{ArrowDown}");
        expect(table).toHaveFocus();
        expect(onChange).toHaveBeenLastCalledWith("table");

        await user.keyboard("{ArrowRight}");
        expect(cell).toHaveFocus();
        expect(onChange).toHaveBeenLastCalledWith("cell");

        await user.keyboard("{ArrowLeft}");
        expect(table).toHaveFocus();
    });

    it("ignores arrow keys held with a system modifier", async () => {
        const onChange = vi.fn();
        const { user } = render(<Harness onChange={onChange} />);
        const cell = screen.getByRole("radio", { name: "Cell" });

        cell.focus();
        await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
        expect(cell).toHaveFocus();
        expect(onChange).not.toHaveBeenCalled();
    });

    it("leaves the selection alone when a radio cancels the arrow key", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <UiToolbarSegmentedControl
                value="cell"
                onChange={onChange}
                accessibilityConfig={{ ariaLabel: "Scope" }}
            >
                <UiToolbarButton value="cell" label="Cell" onKeyDown={(event) => event.preventDefault()} />
                <UiToolbarButton value="row" label="Row" />
            </UiToolbarSegmentedControl>,
        );
        const cell = screen.getByRole("radio", { name: "Cell" });

        cell.focus();
        await user.keyboard("{ArrowRight}");
        expect(cell).toHaveFocus();
        expect(onChange).not.toHaveBeenCalled();
    });

    it("skips disabled radios when a disabled one is checked", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <UiToolbarSegmentedControl
                value="row"
                onChange={onChange}
                accessibilityConfig={{ ariaLabel: "Scope" }}
            >
                <UiToolbarButton value="cell" label="Cell" />
                <UiToolbarButton value="row" label="Row" isDisabled />
                <UiToolbarButton value="table" label="Table" />
            </UiToolbarSegmentedControl>,
        );

        screen.getByRole("radio", { name: "Row" }).focus();
        await user.keyboard("{ArrowRight}");
        expect(onChange).toHaveBeenLastCalledWith("table", expect.anything());
        expect(screen.getByRole("radio", { name: "Table" })).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(onChange).toHaveBeenLastCalledWith("cell", expect.anything());
    });

    it("skips hidden radios", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <UiToolbarSegmentedControl
                value="cell"
                onChange={onChange}
                accessibilityConfig={{ ariaLabel: "Scope" }}
            >
                <UiToolbarButton value="cell" label="Cell" />
                <span hidden>
                    <UiToolbarButton value="row" label="Row" />
                </span>
                <UiToolbarButton value="table" label="Table" />
            </UiToolbarSegmentedControl>,
        );

        screen.getByRole("radio", { name: "Cell" }).focus();
        await user.keyboard("{ArrowRight}");

        expect(onChange).toHaveBeenLastCalledWith("table", expect.anything());
        expect(screen.getByRole("radio", { name: "Table" })).toHaveFocus();
    });

    it("does not re-select the only navigable radio", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <UiToolbarSegmentedControl
                value="cell"
                onChange={onChange}
                accessibilityConfig={{ ariaLabel: "Scope" }}
            >
                <UiToolbarButton value="cell" label="Cell" />
                <UiToolbarButton value="row" label="Row" isDisabled />
            </UiToolbarSegmentedControl>,
        );

        screen.getByRole("radio", { name: "Cell" }).focus();
        await user.keyboard("{ArrowRight}{ArrowLeft}");

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("radio", { name: "Cell" })).toHaveFocus();
    });

    it("moves the tab stop when the checked radio hides itself", async () => {
        function Harness() {
            const [isHidden, setIsHidden] = useState(false);
            return (
                <UiToolbarSegmentedControl
                    value="cell"
                    onChange={() => setIsHidden(true)}
                    accessibilityConfig={{ ariaLabel: "Scope" }}
                >
                    <span hidden={isHidden}>
                        <UiToolbarButton value="cell" label="Cell" />
                    </span>
                    <UiToolbarButton value="row" label="Row" />
                </UiToolbarSegmentedControl>
            );
        }
        const { user } = render(<Harness />);

        await user.click(screen.getByRole("radio", { name: "Cell" }));

        expect(screen.getByRole("radio", { name: "Row" })).toHaveAttribute("tabindex", "0");
    });

    it("owns its tab stop under a foreign role=toolbar element", () => {
        render(
            <div role="toolbar" aria-label="Foreign">
                <UiToolbarSegmentedControl
                    value="row"
                    onChange={() => {}}
                    accessibilityConfig={{ ariaLabel: "Scope" }}
                >
                    <UiToolbarButton value="cell" label="Cell" />
                    <UiToolbarButton value="row" label="Row" />
                </UiToolbarSegmentedControl>
            </div>,
        );

        expect(screen.getByRole("radio", { name: "Cell" })).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("radio", { name: "Row" })).toHaveAttribute("tabindex", "0");
    });

    it("disables every item when the group is disabled", async () => {
        const onChange = vi.fn();
        const { user } = render(
            <UiToolbarSegmentedControl
                value="cell"
                onChange={onChange}
                accessibilityConfig={{ ariaLabel: "Scope" }}
                isDisabled
            >
                <UiToolbarButton value="cell" label="Cell" />
                <UiToolbarButton value="row" label="Row" />
            </UiToolbarSegmentedControl>,
        );

        expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByRole("radio", { name: "Row" })).toHaveAttribute("aria-disabled", "true");

        await user.click(screen.getByRole("radio", { name: "Row" }));
        expect(onChange).not.toHaveBeenCalled();
    });
});
