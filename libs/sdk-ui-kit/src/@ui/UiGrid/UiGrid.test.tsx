// (C) 2026 GoodData Corporation

import { type KeyboardEventHandler } from "react";

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import { type IUiGridCellProps, type IUiGridCellWrapperProps, type IUiGridProps } from "./types.js";
import { UiGrid } from "./UiGrid.js";

const GROUPS = [["a1", "a2", "a3"], ["b1", "b2", "b3"], ["c1"]];

function TextCell({ item }: IUiGridCellProps<string>) {
    return <span>{item}</span>;
}

function renderGrid(props: Partial<IUiGridProps<string>> = {}) {
    const onPick = vi.fn<(item: string) => void>();
    const result = render(
        <UiGrid
            groups={GROUPS}
            getItemId={(item) => item}
            onPick={onPick}
            columns={4}
            accessibilityConfig={{ ariaLabel: "Letters" }}
            Cell={TextCell}
            {...props}
        />,
    );
    return { onPick, ...result };
}

function renderInAncestor(props: Partial<IUiGridProps<string>> = {}) {
    const onAncestorKeyDown = vi.fn<KeyboardEventHandler>();
    render(
        <div onKeyDown={onAncestorKeyDown}>
            <UiGrid
                groups={GROUPS}
                getItemId={(item) => item}
                onPick={() => {}}
                columns={3}
                accessibilityConfig={{ ariaLabel: "Letters" }}
                Cell={TextCell}
                {...props}
            />
        </div>,
    );
    return onAncestorKeyDown;
}

function spyOnCells() {
    const seen = vi.fn<(props: IUiGridCellProps<string>) => void>();
    function SpyCell(props: IUiGridCellProps<string>) {
        seen(props);
        return <span>{props.item}</span>;
    }
    const lastSeen = (item: string) => seen.mock.calls.filter(([props]) => props.item === item).at(-1)?.[0];
    return { SpyCell, lastSeen };
}

function cell(name: string): HTMLElement {
    return screen.getByRole("gridcell", { name });
}

function focusCell(name: string) {
    act(() => cell(name).focus());
}

function press(code: string, modifiers: { ctrlKey?: boolean; metaKey?: boolean } = {}) {
    const target = document.activeElement;
    if (target === null) {
        throw new Error("Nothing holds the focus.");
    }
    fireEvent.keyDown(target, { code, ...modifiers });
}

function focusedName() {
    return document.activeElement?.textContent;
}

function tabStops(): Array<string | null> {
    return screen
        .getAllByRole("gridcell")
        .filter((gridCell) => gridCell.tabIndex === 0)
        .map((gridCell) => gridCell.textContent);
}

describe("UiGrid", () => {
    describe("structure", () => {
        it("is a named grid of numbered rows of cells", () => {
            renderGrid();

            const grid = screen.getByRole("grid", { name: "Letters" });
            expect(grid).toHaveAttribute("aria-rowcount", "3");
            const rows = within(grid).getAllByRole("row");
            expect(rows.map((row) => row.getAttribute("aria-rowindex"))).toEqual(["1", "2", "3"]);
            expect(
                rows.map((row) =>
                    within(row)
                        .getAllByRole("gridcell")
                        .map((gridCell) => gridCell.textContent),
                ),
            ).toEqual(GROUPS);
        });

        it("wraps a group longer than the columns onto further rows, each group starting a new row", () => {
            renderGrid({ groups: [["a1", "a2", "a3", "a4", "a5"], ["b1"]], columns: 2 });

            const grid = screen.getByRole("grid");
            expect(grid).toHaveAttribute("aria-rowcount", "4");
            const rows = within(grid).getAllByRole("row");
            expect(rows.map((row) => row.getAttribute("aria-rowindex"))).toEqual(["1", "2", "3", "4"]);
            expect(
                rows.map((row) =>
                    within(row)
                        .getAllByRole("gridcell")
                        .map((gridCell) => gridCell.textContent),
                ),
            ).toEqual([["a1", "a2"], ["a3", "a4"], ["a5"], ["b1"]]);
        });

        it("can be named by another element", () => {
            render(<h2 id="letters-heading">Pick a letter</h2>);
            renderGrid({ accessibilityConfig: { ariaLabelledBy: "letters-heading" } });

            expect(screen.getByRole("grid", { name: "Pick a letter" })).toBeInTheDocument();
        });

        it("marks only the selected cell as selected", () => {
            renderGrid({ selectedItemId: "b2" });

            expect(
                screen.getAllByRole("gridcell", { selected: true }).map((gridCell) => gridCell.textContent),
            ).toEqual(["b2"]);
            expect(cell("a1")).toHaveAttribute("aria-selected", "false");
        });

        it("lays the rows out in the given columns, cell width and gap", () => {
            renderGrid({ columns: 10, cellWidth: 30, gap: 4 });

            const { style } = screen.getByRole("grid");
            expect(style.getPropertyValue("--ui-grid-columns")).toBe("10");
            expect(style.getPropertyValue("--ui-grid-cell-width")).toBe("30px");
            expect(style.getPropertyValue("--ui-grid-gap")).toBe("4px");
        });

        it("leaves the cell width and the gap to the stylesheet by default", () => {
            renderGrid();

            const { style } = screen.getByRole("grid");
            expect(style.getPropertyValue("--ui-grid-columns")).toBe("4");
            expect(style.getPropertyValue("--ui-grid-cell-width")).toBe("");
            expect(style.getPropertyValue("--ui-grid-gap")).toBe("");
        });
    });

    describe("tab stop", () => {
        it("puts only the selected cell in the tab order", () => {
            renderGrid({ selectedItemId: "b2" });

            expect(tabStops()).toEqual(["b2"]);
        });

        it.each([
            ["nothing is selected", undefined],
            ["the selected id is not in the grid", "z9"],
        ])("puts only the first cell in the tab order when %s", (_case, selectedItemId) => {
            renderGrid({ selectedItemId });

            expect(tabStops()).toEqual(["a1"]);
        });

        it("moves the tab stop with the focus", () => {
            renderGrid();
            focusCell("a1");

            press("ArrowDown");

            expect(tabStops()).toEqual(["b1"]);
        });

        it("moves the tab stop to a cell focused another way", () => {
            renderGrid();

            focusCell("b3");

            expect(tabStops()).toEqual(["b3"]);
        });
    });

    describe("keys", () => {
        it.each([
            ["ArrowRight", "b2", "b3"],
            ["ArrowLeft", "b2", "b1"],
            ["ArrowDown", "a2", "b2"],
            ["ArrowUp", "b2", "a2"],
        ])("%s moves the focus from %s to %s", (code, from, to) => {
            renderGrid();
            focusCell(from);

            press(code);

            expect(focusedName()).toBe(to);
        });

        it.each([
            ["ArrowLeft", "b1"],
            ["ArrowRight", "b3"],
            ["ArrowUp", "a2"],
            ["ArrowDown", "c1"],
        ])("%s stays on %s at the edge of the grid", (code, at) => {
            renderGrid();
            focusCell(at);

            press(code);

            expect(focusedName()).toBe(at);
        });

        it("goes down onto the last cell of a shorter row, and back up in that cell's column", () => {
            renderGrid();
            focusCell("b3");

            press("ArrowDown");
            expect(focusedName()).toBe("c1");
            press("ArrowUp");
            expect(focusedName()).toBe("b1");
        });

        it("goes up onto the last cell of a shorter row", () => {
            renderGrid({ groups: [["a1"], ["b1", "b2", "b3"]] });
            focusCell("b3");

            press("ArrowUp");

            expect(focusedName()).toBe("a1");
        });

        it("goes to the first and the last cell of its row with Home and End", () => {
            renderGrid();
            focusCell("b2");

            press("End");
            expect(focusedName()).toBe("b3");
            press("Home");
            expect(focusedName()).toBe("b1");
        });

        it("moves over the rows a group wraps onto", () => {
            renderGrid({ groups: [["a1", "a2", "a3", "a4", "a5"], ["b1"]], columns: 2 });
            focusCell("a2");

            press("ArrowRight");
            expect(focusedName()).toBe("a2");
            press("ArrowDown");
            expect(focusedName()).toBe("a4");
            press("Home");
            expect(focusedName()).toBe("a3");
            press("ArrowDown");
            expect(focusedName()).toBe("a5");
            press("ArrowDown");
            expect(focusedName()).toBe("b1");
        });

        it("goes to the last cell of a shorter row with End", () => {
            renderGrid({
                groups: [
                    ["a1", "a2", "a3"],
                    ["b1", "b2"],
                ],
            });
            focusCell("b1");

            press("End");

            expect(focusedName()).toBe("b2");
        });

        it.each([
            ["Ctrl", { ctrlKey: true }],
            ["Cmd", { metaKey: true }],
        ])(
            "goes to the first and the last cell of the whole grid with %s+Home and %s+End",
            (_key, modifiers) => {
                renderGrid({ groups: [["a1"], ["b1", "b2", "b3"], ["c1", "c2"]] });
                focusCell("b2");

                press("End", modifiers);
                expect(focusedName()).toBe("c2");
                press("Home", modifiers);
                expect(focusedName()).toBe("a1");
            },
        );

        it.each(["Enter", "Space"])("picks the focused cell with %s", (code) => {
            const { onPick } = renderGrid();
            focusCell("b2");

            press("ArrowRight");
            press(code);

            expect(onPick).toHaveBeenCalledExactlyOnceWith("b3");
        });

        it("picks a clicked cell", () => {
            const { onPick } = renderGrid();

            fireEvent.click(cell("c1"));

            expect(onPick).toHaveBeenCalledExactlyOnceWith("c1");
        });

        it.each(["Space", "Enter", "ArrowLeft", "ArrowDown", "Home", "End"])(
            "leaves %s typed into a cell's content to that content",
            (code) => {
                function InputCell({ item }: IUiGridCellProps<string>) {
                    return item === "a2" ? <input aria-label="Note" /> : <span>{item}</span>;
                }
                const { onPick } = renderGrid({ Cell: InputCell });
                const input = screen.getByRole("textbox", { name: "Note" });
                act(() => input.focus());

                const isNotPrevented = fireEvent.keyDown(input, { code });

                expect(isNotPrevented).toBe(true);
                expect(onPick).not.toHaveBeenCalled();
                expect(document.activeElement).toBe(input);
            },
        );

        it("passes Escape typed into a cell's content to onEscape and keeps it from the ancestors", () => {
            function InputCell({ item }: IUiGridCellProps<string>) {
                return item === "a2" ? <input aria-label="Note" /> : <span>{item}</span>;
            }
            const onEscape = vi.fn<NonNullable<IUiGridProps<string>["onEscape"]>>();
            const onAncestorKeyDown = renderInAncestor({ Cell: InputCell, onEscape });
            const input = screen.getByRole("textbox", { name: "Note" });
            act(() => input.focus());

            fireEvent.keyDown(input, { code: "Escape" });

            expect(onEscape).toHaveBeenCalledOnce();
            expect(onAncestorKeyDown).not.toHaveBeenCalled();
        });

        it("keeps the keys it handles from its ancestors", () => {
            const onAncestorKeyDown = renderInAncestor();
            focusCell("b2");

            for (const code of [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Home",
                "End",
                "Enter",
                "Space",
            ]) {
                press(code);
            }

            expect(onAncestorKeyDown).not.toHaveBeenCalled();
        });
    });

    describe("Escape", () => {
        it("lets Escape go on to the ancestors when the grid does not handle it", () => {
            const onAncestorKeyDown = renderInAncestor();
            focusCell("a1");

            press("Escape");

            expect(onAncestorKeyDown).toHaveBeenCalledOnce();
        });

        it("handles Escape itself and keeps it from the ancestors when given onEscape", () => {
            const onEscape = vi.fn<NonNullable<IUiGridProps<string>["onEscape"]>>();
            const onAncestorKeyDown = renderInAncestor({ onEscape });
            focusCell("a1");

            press("Escape");

            expect(onEscape).toHaveBeenCalledOnce();
            expect(onAncestorKeyDown).not.toHaveBeenCalled();
        });
    });

    describe("pluggable components", () => {
        it("tells the cell whether it is selected and whether it holds the keyboard focus", () => {
            const { SpyCell, lastSeen } = spyOnCells();
            renderGrid({ Cell: SpyCell, selectedItemId: "a2" });

            expect(lastSeen("a2")).toEqual({ item: "a2", isSelected: true, isKeyboardFocused: false });
            focusCell("b1");
            expect(lastSeen("b1")).toEqual({ item: "b1", isSelected: false, isKeyboardFocused: true });
            press("ArrowRight");
            expect(lastSeen("b1")?.isKeyboardFocused).toBe(false);
            expect(lastSeen("b2")?.isKeyboardFocused).toBe(true);
        });

        it("tells the cell it lost the keyboard focus when the focus leaves the grid", () => {
            const { SpyCell, lastSeen } = spyOnCells();
            render(<button type="button">Outside</button>);
            renderGrid({ Cell: SpyCell });
            focusCell("b1");

            act(() => screen.getByRole("button", { name: "Outside" }).focus());

            expect(lastSeen("b1")?.isKeyboardFocused).toBe(false);
        });

        it("does not count the focus a click gives a cell as keyboard focus", () => {
            const { SpyCell, lastSeen } = spyOnCells();
            renderGrid({ Cell: SpyCell });

            fireEvent.pointerDown(cell("b1"));
            focusCell("b1");
            fireEvent.pointerUp(cell("b1"));
            fireEvent.click(cell("b1"));

            expect(focusedName()).toBe("b1");
            expect(lastSeen("b1")?.isKeyboardFocused).toBe(false);
        });

        it("counts the focus coming back from outside the grid after a click as keyboard focus", () => {
            const { SpyCell, lastSeen } = spyOnCells();
            render(<button type="button">Outside</button>);
            renderGrid({ Cell: SpyCell });
            fireEvent.pointerDown(cell("b1"));
            focusCell("b1");
            fireEvent.pointerUp(cell("b1"));
            fireEvent.click(cell("b1"));
            act(() => screen.getByRole("button", { name: "Outside" }).focus());

            focusCell("b1");

            expect(lastSeen("b1")?.isKeyboardFocused).toBe(true);
        });

        it.each([
            ["released", fireEvent.pointerUp],
            ["cancelled", fireEvent.pointerCancel],
        ])(
            "counts the focus coming back from outside as keyboard focus after a press %s without a click",
            (_case, endPress) => {
                const { SpyCell, lastSeen } = spyOnCells();
                render(<button type="button">Outside</button>);
                renderGrid({ Cell: SpyCell });
                fireEvent.pointerDown(screen.getByRole("grid"));
                endPress(document.body);
                act(() => screen.getByRole("button", { name: "Outside" }).focus());

                focusCell("b1");

                expect(lastSeen("b1")?.isKeyboardFocused).toBe(true);
            },
        );

        it("stops listening for the end of a press once it unmounts", () => {
            const addListener = vi.spyOn(document, "addEventListener");
            const removeListener = vi.spyOn(document, "removeEventListener");
            const { unmount } = renderGrid();
            const added = addListener.mock.calls.filter(
                ([type]) => type === "pointerup" || type === "pointercancel",
            );

            unmount();

            expect(added).toHaveLength(2);
            for (const [type, listener, options] of added) {
                expect(removeListener).toHaveBeenCalledWith(type, listener, options);
            }
        });

        it("does not count a focus the browser draws no focus ring for as keyboard focus", () => {
            const { SpyCell, lastSeen } = spyOnCells();
            renderGrid({ Cell: SpyCell });
            vi.spyOn(cell("b1"), "matches").mockReturnValue(false);

            focusCell("b1");

            expect(lastSeen("b1")?.isKeyboardFocused).toBe(false);
        });

        it("drops the keyboard focus once the pointer moves over the grid", () => {
            const { SpyCell, lastSeen } = spyOnCells();
            renderGrid({ Cell: SpyCell });
            focusCell("b1");

            fireEvent.mouseMove(screen.getByRole("grid"));

            expect(lastSeen("b1")?.isKeyboardFocused).toBe(false);
        });

        it("lets a cell wrapper take over the gridcell, with the grid still driving it", () => {
            function MarkedCellWrapper({
                item,
                isTabStop,
                isSelected,
                cellRef,
                onPick,
                onFocus,
                onBlur,
                Cell,
                isKeyboardFocused,
            }: IUiGridCellWrapperProps<string>) {
                return (
                    <button
                        ref={cellRef}
                        type="button"
                        role="gridcell"
                        aria-selected={isSelected}
                        tabIndex={isTabStop ? 0 : -1}
                        data-marked
                        onClick={onPick}
                        onFocus={onFocus}
                        onBlur={onBlur}
                    >
                        <Cell item={item} isSelected={isSelected} isKeyboardFocused={isKeyboardFocused} />
                    </button>
                );
            }
            const { onPick } = renderGrid({ CellWrapper: MarkedCellWrapper });
            focusCell("a1");

            press("ArrowDown");
            press("Enter");

            expect(cell("b1")).toHaveAttribute("data-marked");
            expect(focusedName()).toBe("b1");
            expect(onPick).toHaveBeenCalledExactlyOnceWith("b1");
        });

        it("lets a cell show a tooltip while it holds the keyboard focus", async () => {
            function TooltipCell({ item, isKeyboardFocused }: IUiGridCellProps<string>) {
                return (
                    <UiTooltip
                        anchor={<span>{item}</span>}
                        content={`Letter ${item}`}
                        triggerBy={["hover"]}
                        isOpen={isKeyboardFocused || undefined}
                        accessibilityHidden
                    />
                );
            }
            renderGrid({ Cell: TooltipCell });

            focusCell("a1");
            press("ArrowRight");

            await waitFor(() =>
                expect(
                    screen.getAllByRole("tooltip", { hidden: true }).map((tooltip) => tooltip.textContent),
                ).toEqual(["Letter a2"]),
            );
        });
    });
});
