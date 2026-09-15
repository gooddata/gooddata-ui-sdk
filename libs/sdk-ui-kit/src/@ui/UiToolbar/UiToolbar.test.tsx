// (C) 2026 GoodData Corporation

import { useState } from "react";

import { act, fireEvent, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";
import { UiToolbarButton } from "../UiToolbarButton/UiToolbarButton.js";
import { UiToolbarDivider } from "../UiToolbarDivider/UiToolbarDivider.js";
import { UiToolbarIconButton } from "../UiToolbarIconButton/UiToolbarIconButton.js";
import { UiToolbarSegmentedControl } from "../UiToolbarSegmentedControl/UiToolbarSegmentedControl.js";
import { UiToolbarStepper } from "../UiToolbarStepper/UiToolbarStepper.js";

import { TOOLBAR_SKIP_ATTR } from "./rovingFocusUtils.js";
import { UiToolbar } from "./UiToolbar.js";

function ThreeButtons() {
    return (
        <>
            <button type="button">before</button>
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <UiToolbarDivider />
                <UiToolbarButton label="Two" />
                <UiToolbarIconButton icon="plus" label="Three" hideTooltip />
            </UiToolbar>
            <button type="button">after</button>
        </>
    );
}

describe("UiToolbar", () => {
    it("renders a named horizontal toolbar", () => {
        render(<ThreeButtons />);

        const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
        expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("is one tab stop: only the first item is tabbable and Tab leaves the toolbar", async () => {
        const { user } = render(<ThreeButtons />);

        expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("button", { name: "Three" })).toHaveAttribute("tabindex", "-1");

        await user.click(screen.getByText("before"));
        await user.tab();
        expect(screen.getByRole("button", { name: "One" })).toHaveFocus();

        await user.tab();
        expect(screen.getByText("after")).toHaveFocus();
    });

    it("moves focus with arrow keys, Home and End, and wraps", async () => {
        const { user } = render(<ThreeButtons />);
        const one = screen.getByRole("button", { name: "One" });
        const two = screen.getByRole("button", { name: "Two" });
        const three = screen.getByRole("button", { name: "Three" });

        one.focus();
        await user.keyboard("{ArrowRight}");
        expect(two).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(three).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(one).toHaveFocus();

        await user.keyboard("{ArrowLeft}");
        expect(three).toHaveFocus();

        await user.keyboard("{Home}");
        expect(one).toHaveFocus();

        await user.keyboard("{End}");
        expect(three).toHaveFocus();
    });

    it("leaves arrow keys held with a system modifier to the browser", async () => {
        const { user } = render(<ThreeButtons />);
        const one = screen.getByRole("button", { name: "One" });

        one.focus();
        await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
        expect(one).toHaveFocus();

        await user.keyboard("{Meta>}{ArrowRight}{/Meta}");
        expect(one).toHaveFocus();
    });

    it("does not wrap when loop is off", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }} loop={false}>
                <UiToolbarButton label="One" />
                <UiToolbarButton label="Two" />
            </UiToolbar>,
        );
        const two = screen.getByRole("button", { name: "Two" });

        two.focus();
        await user.keyboard("{ArrowRight}");
        expect(two).toHaveFocus();
    });

    it("remembers the last focused item when focus leaves and comes back", async () => {
        const { user } = render(<ThreeButtons />);
        const two = screen.getByRole("button", { name: "Two" });

        two.focus();
        await user.tab();
        expect(screen.getByText("after")).toHaveFocus();
        expect(two).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("tabindex", "-1");

        await user.tab({ shift: true });
        expect(two).toHaveFocus();
    });

    it("keeps aria-disabled items reachable and skips natively disabled ones", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <UiToolbarButton label="Two" isDisabled />
                <button type="button" disabled>
                    Native
                </button>
                <UiToolbarButton label="Three" />
            </UiToolbar>,
        );
        const one = screen.getByRole("button", { name: "One" });
        const two = screen.getByRole("button", { name: "Two" });

        one.focus();
        await user.keyboard("{ArrowRight}");
        expect(two).toHaveFocus();
        expect(two).toHaveAttribute("aria-disabled", "true");

        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("button", { name: "Three" })).toHaveFocus();
    });

    it("skips aria-disabled items when isDisabledFocusable is off", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }} isDisabledFocusable={false}>
                <UiToolbarButton label="One" />
                <UiToolbarButton label="Two" isDisabled />
                <UiToolbarButton label="Three" />
            </UiToolbar>,
        );

        screen.getByRole("button", { name: "One" }).focus();
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("button", { name: "Three" })).toHaveFocus();
    });

    it("does not fire the click handler of a disabled item", async () => {
        const onClick = vi.fn();
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" isDisabled onClick={onClick} />
            </UiToolbar>,
        );

        await user.click(screen.getByRole("button", { name: "One" }));
        expect(onClick).not.toHaveBeenCalled();
    });

    it("leaves Left/Right/Home/End to the caret inside a text input", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <UiToolbarStepper
                    variant="value"
                    value="100%"
                    onStep={() => {}}
                    onCommit={() => {}}
                    accessibilityConfig={{ ariaLabel: "Zoom", incrementLabel: "In", decrementLabel: "Out" }}
                />
            </UiToolbar>,
        );
        const input = screen.getByRole("textbox", { name: "Zoom" }) as HTMLInputElement;

        input.focus();
        input.setSelectionRange(2, 2);
        await user.keyboard("{ArrowLeft}{Home}{End}");
        expect(input).toHaveFocus();
    });

    it("treats a segmented control as one stop that handles its own arrows", async () => {
        function Harness() {
            const [value, setValue] = useState("cell");
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" />
                    <UiToolbarSegmentedControl
                        value={value}
                        onChange={setValue}
                        accessibilityConfig={{ ariaLabel: "Scope" }}
                    >
                        <UiToolbarButton value="cell" label="Cell" />
                        <UiToolbarButton value="row" label="Row" />
                    </UiToolbarSegmentedControl>
                    <UiToolbarButton label="Two" />
                </UiToolbar>
            );
        }
        const { user } = render(<Harness />);
        const one = screen.getByRole("button", { name: "One" });
        const cell = screen.getByRole("radio", { name: "Cell" });
        const row = screen.getByRole("radio", { name: "Row" });
        const two = screen.getByRole("button", { name: "Two" });

        one.focus();
        await user.keyboard("{ArrowRight}");
        expect(cell).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(row).toHaveFocus();
        expect(row).toHaveAttribute("aria-checked", "true");
        expect(cell).toHaveAttribute("aria-checked", "false");

        await user.keyboard("{ArrowRight}");
        expect(two).toHaveFocus();
        expect(row).toHaveAttribute("aria-checked", "true");

        await user.keyboard("{ArrowLeft}");
        expect(row).toHaveFocus();

        await user.keyboard("{ArrowDown}");
        expect(cell).toHaveFocus();
        expect(cell).toHaveAttribute("aria-checked", "true");

        await user.keyboard("{Home}");
        expect(one).toHaveFocus();
    });

    it("does not pull focus back after the user clicked away and the toolbar re-rendered", async () => {
        function Harness() {
            const [count, setCount] = useState(1);
            return (
                <>
                    <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                        <UiToolbarButton label="One" />
                        {count > 1 ? <UiToolbarButton label="Two" /> : null}
                    </UiToolbar>
                    <p onClick={() => setCount(2)}>outside</p>
                </>
            );
        }
        const { user } = render(<Harness />);

        screen.getByRole("button", { name: "One" }).focus();
        await user.click(screen.getByText("outside"));

        expect(screen.getByRole("button", { name: "Two" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "One" })).not.toHaveFocus();
    });

    it("leaves caret keys to a text input until the caret reaches an edge", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <input type="search" aria-label="Filter" defaultValue="abc" />
                <UiToolbarButton label="Two" />
            </UiToolbar>,
        );
        const input = screen.getByRole("searchbox", { name: "Filter" }) as HTMLInputElement;

        input.focus();
        input.setSelectionRange(1, 1);
        await user.keyboard("{ArrowLeft}{Home}{End}");
        expect(input).toHaveFocus();

        input.setSelectionRange(3, 3);
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();

        await user.keyboard("{ArrowLeft}");
        expect(input).toHaveFocus();
        input.setSelectionRange(0, 0);
        await user.keyboard("{ArrowLeft}");
        expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
    });

    it("leaves arrow keys to the input method while it is composing", () => {
        render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <input type="search" aria-label="Filter" defaultValue="abc" />
                <UiToolbarButton label="Two" />
            </UiToolbar>,
        );
        const input = screen.getByRole("searchbox", { name: "Filter" }) as HTMLInputElement;

        // Caret at the end, which would otherwise hand ArrowRight to the toolbar.
        input.focus();
        input.setSelectionRange(3, 3);
        fireEvent.keyDown(input, { code: "ArrowRight", key: "ArrowRight", isComposing: true });

        expect(input).toHaveFocus();
    });

    it("swaps the hand-off edges for a right-to-left value", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <input type="search" aria-label="Filter" defaultValue="abc" dir="rtl" />
                <UiToolbarButton label="Two" />
            </UiToolbar>,
        );
        const input = screen.getByRole("searchbox", { name: "Filter" }) as HTMLInputElement;

        // Offset 0 is the visual right edge, so ArrowLeft moves deeper into the text and only
        // ArrowRight leaves it. Which neighbour the toolbar then focuses still follows DOM order.
        input.focus();
        input.setSelectionRange(0, 0);
        await user.keyboard("{ArrowLeft}");
        expect(input).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();

        input.focus();
        input.setSelectionRange(3, 3);
        await user.keyboard("{ArrowRight}");
        expect(input).toHaveFocus();

        await user.keyboard("{ArrowLeft}");
        expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
    });

    it("falls back to the first item when the remembered item disappears", async () => {
        function Harness() {
            const [hasTwo, setHasTwo] = useState(true);
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" />
                    {hasTwo ? <UiToolbarButton label="Two" onClick={() => setHasTwo(false)} /> : null}
                    <UiToolbarButton label="Three" />
                </UiToolbar>
            );
        }
        const { user } = render(<Harness />);

        await user.click(screen.getByRole("button", { name: "Two" }));

        expect(screen.queryByRole("button", { name: "Two" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("button", { name: "Three" })).toHaveAttribute("tabindex", "-1");
    });

    it("moves focus to the fallback item when the focused item becomes hidden", async () => {
        function Harness() {
            const [isHidden, setIsHidden] = useState(false);
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" />
                    <span hidden={isHidden}>
                        <UiToolbarButton label="Two" onClick={() => setIsHidden(true)} />
                    </span>
                    <UiToolbarButton label="Three" />
                </UiToolbar>
            );
        }
        const { user } = render(<Harness />);

        await user.click(screen.getByRole("button", { name: "Two" }));

        expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
        expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("tabindex", "0");
    });

    it("leaves items rendered through a portal tabbable", () => {
        render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                {createPortal(
                    <div>
                        <UiToolbarButton label="Portaled" />
                        <UiToolbarSegmentedControl
                            value="a"
                            onChange={() => {}}
                            accessibilityConfig={{ ariaLabel: "Portaled group" }}
                        >
                            <UiToolbarButton value="a" label="A" />
                            <UiToolbarButton value="b" label="B" />
                        </UiToolbarSegmentedControl>
                    </div>,
                    document.body,
                )}
            </UiToolbar>,
        );

        expect(screen.getByRole("button", { name: "Portaled" })).not.toHaveAttribute("tabindex");
        expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("tabindex", "0");
        expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("tabindex", "0");
    });

    it("moves focus to the fallback item when the focused item is hidden by style", async () => {
        function Harness() {
            const [isHidden, setIsHidden] = useState(false);
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" />
                    <span style={isHidden ? { display: "none" } : undefined}>
                        <UiToolbarButton label="Two" onClick={() => setIsHidden(true)} />
                    </span>
                </UiToolbar>
            );
        }
        const { user } = render(<Harness />);

        await user.click(screen.getByRole("button", { name: "Two" }));

        expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
    });

    it("hands off from a textarea only at the caret edges", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <textarea aria-label="Note" defaultValue="abc" />
                <UiToolbarButton label="Two" />
            </UiToolbar>,
        );
        const note = screen.getByRole("textbox", { name: "Note" }) as HTMLTextAreaElement;

        note.focus();
        note.setSelectionRange(1, 1);
        await user.keyboard("{ArrowRight}");
        expect(note).toHaveFocus();

        note.setSelectionRange(3, 3);
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("button", { name: "Two" })).toHaveFocus();
    });

    it("never hands off from an input without a caret selection", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <input type="number" aria-label="Size" defaultValue="12" />
                <UiToolbarButton label="Two" />
            </UiToolbar>,
        );
        const size = screen.getByRole("spinbutton", { name: "Size" });

        size.focus();
        await user.keyboard("{ArrowRight}{ArrowLeft}");
        expect(size).toHaveFocus();
    });

    it("keeps focus on an item whose subtree opts out at runtime", async () => {
        function Harness() {
            const [isSkipped, setIsSkipped] = useState(false);
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" />
                    <div {...(isSkipped ? { [TOOLBAR_SKIP_ATTR]: "" } : {})}>
                        <UiToolbarButton label="Custom" onClick={() => setIsSkipped(true)} />
                    </div>
                </UiToolbar>
            );
        }
        const { user } = render(<Harness />);
        const custom = screen.getByRole("button", { name: "Custom" });

        await user.click(custom);

        expect(custom).toHaveFocus();
        expect(custom).not.toHaveAttribute("tabindex");
        expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("tabindex", "0");
    });

    it("leaves keyboard handling to a skipped subtree", async () => {
        const { user } = render(
            <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                <UiToolbarButton label="One" />
                <div {...{ [TOOLBAR_SKIP_ATTR]: "" }}>
                    <button type="button">Custom</button>
                </div>
            </UiToolbar>,
        );
        const custom = screen.getByRole("button", { name: "Custom" });

        custom.focus();
        await user.keyboard("{ArrowLeft}{Home}{End}{ArrowRight}");

        expect(custom).toHaveFocus();
        expect(custom).not.toHaveAttribute("tabindex");
    });

    it("moves focus off a disabled item when disabled items stop being focusable", () => {
        let setFocusable: (value: boolean) => void = () => {};
        function Harness() {
            const [isDisabledFocusable, setIsDisabledFocusable] = useState(true);
            setFocusable = setIsDisabledFocusable;
            return (
                <UiToolbar
                    accessibilityConfig={{ ariaLabel: "Formatting" }}
                    isDisabledFocusable={isDisabledFocusable}
                >
                    <UiToolbarButton label="One" />
                    <UiToolbarButton label="Two" isDisabled />
                </UiToolbar>
            );
        }
        render(<Harness />);

        screen.getByRole("button", { name: "Two" }).focus();
        act(() => setFocusable(false));

        expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
        expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute("tabindex", "-1");
    });

    it("keeps vertical arrows inside a fully disabled segmented control", async () => {
        const outsideKeyDown = vi.fn();
        const { user } = render(
            <div onKeyDown={outsideKeyDown}>
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" />
                    <UiToolbarSegmentedControl
                        value="cell"
                        onChange={() => {}}
                        accessibilityConfig={{ ariaLabel: "Scope" }}
                        isDisabled
                    >
                        <UiToolbarButton value="cell" label="Cell" />
                        <UiToolbarButton value="row" label="Row" />
                    </UiToolbarSegmentedControl>
                </UiToolbar>
            </div>,
        );
        const cell = screen.getByRole("radio", { name: "Cell" });

        cell.focus();
        await user.keyboard("{ArrowDown}{ArrowUp}");

        expect(cell).toHaveFocus();
        expect(outsideKeyDown).not.toHaveBeenCalled();

        await user.keyboard("{ArrowLeft}");
        expect(screen.getByRole("button", { name: "One" })).toHaveFocus();
    });

    it("manages an element that becomes focusable through its own attributes", async () => {
        function Harness() {
            const [href, setHref] = useState<string | undefined>(undefined);
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" onClick={() => setHref("#details")} />
                    <a href={href}>Details</a>
                </UiToolbar>
            );
        }
        const { user } = render(<Harness />);

        expect(screen.getByText("Details")).not.toHaveAttribute("tabindex");
        await user.click(screen.getByRole("button", { name: "One" }));

        expect(screen.getByRole("link", { name: "Details" })).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("button", { name: "One" })).toHaveAttribute("tabindex", "0");
    });

    it("gives newly added items tabindex -1", async () => {
        function Harness() {
            const [hasMore, setHasMore] = useState(false);
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarButton label="One" onClick={() => setHasMore(true)} />
                    {hasMore ? <UiToolbarButton label="Two" /> : null}
                </UiToolbar>
            );
        }
        const { user } = render(<Harness />);

        await user.click(screen.getByRole("button", { name: "One" }));

        expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute("tabindex", "-1");
    });
});
