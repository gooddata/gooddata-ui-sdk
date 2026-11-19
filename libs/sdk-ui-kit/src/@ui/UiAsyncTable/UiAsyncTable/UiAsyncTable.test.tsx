// (C) 2026 GoodData Corporation

import { type ReactNode, useEffect, useState } from "react";

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiAsyncTableColumn } from "../types.js";

import { UiAsyncTable } from "./UiAsyncTable.js";

interface IItem {
    id: string;
    title: string;
}

const open: IItem = { id: "open", title: "Open" };
const locked: IItem = { id: "locked", title: "Locked" };
const columns: IUiAsyncTableColumn<IItem>[] = [{ key: "title", getTextContent: (i) => i.title }];
const isItemClickable = (item: IItem) => item.id !== locked.id;

const renderWithIntl = (ui: ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

const renderTable = (onItemClick: (item: IItem) => void, items: IItem[] = [open, locked]) =>
    renderWithIntl(
        <UiAsyncTable
            items={items}
            totalItemsCount={2}
            columns={columns}
            onItemClick={onItemClick}
            isItemClickable={isItemClickable}
        />,
    );

const getRowsContainer = () => screen.getByRole("grid");

const getRow = (text: string) => {
    const row = screen.getByText(text).closest<HTMLElement>("[role='row']");
    if (!row) {
        throw new Error(`No row contains "${text}".`);
    }
    return row;
};

describe("UiAsyncTable isItemClickable", () => {
    it("calls onItemClick only for clickable rows", () => {
        const onItemClick = vi.fn<(item: IItem) => void>();
        renderTable(onItemClick);

        expect(screen.getByText("Open").closest('[role="row"]')?.className).toContain("--active");
        expect(screen.getByText("Locked").closest('[role="row"]')?.className).not.toContain("--active");

        fireEvent.click(screen.getByText("Locked"));
        expect(onItemClick).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText("Open"));
        expect(onItemClick).toHaveBeenCalledWith(open);
    });

    // ArrowDown in the rows container moves to the second row, Enter selects it
    const selectSecondRowByKeyboard = () => {
        const rows = getRowsContainer();
        fireEvent.keyDown(rows, { key: "ArrowDown", code: "ArrowDown" });
        fireEvent.keyDown(rows, { key: "Enter", code: "Enter" });
    };

    it("calls onItemClick on keyboard select of a clickable row", () => {
        const onItemClick = vi.fn<(item: IItem) => void>();
        renderTable(onItemClick, [locked, open]);

        selectSecondRowByKeyboard();

        expect(onItemClick).toHaveBeenCalledWith(open);
    });

    it("ignores keyboard select on a row that is not clickable", () => {
        const onItemClick = vi.fn<(item: IItem) => void>();
        renderTable(onItemClick, [open, locked]);

        selectSecondRowByKeyboard();

        expect(onItemClick).not.toHaveBeenCalled();
    });
});

describe("UiAsyncTable row click", () => {
    it("makes the clicked row the active row", () => {
        renderTable(vi.fn(), [open, locked, { id: "third", title: "Third" }]);

        fireEvent.click(screen.getByText("Third"));

        expect(getRowsContainer()).toHaveAttribute("aria-activedescendant", getRow("Third").id);
    });

    it("keeps DOM focus on the grid and navigates from a clicked non-actionable row", async () => {
        const user = userEvent.setup();
        const onItemClick = vi.fn();
        renderTable(onItemClick, [open, locked, { id: "third", title: "Third" }]);

        await user.click(screen.getByText("Locked"));

        expect(getRowsContainer()).toHaveFocus();
        expect(onItemClick).not.toHaveBeenCalled();
        await user.keyboard("{ArrowDown}{Enter}");
        expect(onItemClick).toHaveBeenCalledWith({ id: "third", title: "Third" });
    });

    it("keeps DOM focus on the grid when a skeleton row is clicked", async () => {
        const user = userEvent.setup();
        renderWithIntl(
            <UiAsyncTable
                items={[open, locked]}
                columns={columns}
                hasNextPage
                isLoading
                skeletonItemsCount={2}
                loadNextPage={vi.fn()}
            />,
        );
        const grid = getRowsContainer();

        await user.click(grid.querySelector(".gd-ui-kit-skeleton")!);

        expect(grid).toHaveFocus();
        await user.keyboard("{ArrowDown}");
        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Locked").id);
    });

    it("preserves focus on an interactive cell control", async () => {
        const user = userEvent.setup();
        renderWithIntl(
            <UiAsyncTable
                items={[open]}
                columns={[{ key: "title", renderButton: () => <button>Cell action</button> }]}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Cell action" }));

        expect(screen.getByRole("button", { name: "Cell action" })).toHaveFocus();
    });

    it("preserves focus moved outside the grid by a row action", async () => {
        const user = userEvent.setup();
        renderWithIntl(
            <>
                <button>Action destination</button>
                <UiAsyncTable
                    items={[open]}
                    columns={columns}
                    onItemClick={() => screen.getByRole("button", { name: "Action destination" }).focus()}
                />
            </>,
        );

        await user.click(screen.getByText("Open"));

        expect(screen.getByRole("button", { name: "Action destination" })).toHaveFocus();
    });
});

describe("UiAsyncTable column isLocked", () => {
    it("shows a lock before the first line of locked items only", () => {
        const multiLineColumns: IUiAsyncTableColumn<IItem>[] = [
            {
                key: "title",
                getMultiLineTextContent: (i) => [i.title, `${i.title} subtitle`],
                isLocked: (i) => i.id === locked.id,
            },
        ];
        renderWithIntl(
            <UiAsyncTable items={[open, locked]} totalItemsCount={2} columns={multiLineColumns} />,
        );

        const lockIn = (text: string) =>
            screen.getByText(text).parentElement?.querySelector("[class*='__lock-icon']");

        expect(lockIn("Locked")).toBeInTheDocument();
        expect(lockIn("Locked subtitle")).toBeNull();
        expect(lockIn("Open")).toBeNull();
    });
});

describe("UiAsyncTable pointer focus", () => {
    const tooltip = "No access";
    const getItemTooltip = (item: IItem) => (item.id === locked.id ? tooltip : undefined);
    const usePointerFocus = (grid: HTMLElement) => {
        const matches = grid.matches.bind(grid);
        // happy-dom does not track the browser's pointer/keyboard focus-visible modality.
        return vi
            .spyOn(grid, "matches")
            .mockImplementation((selector) => (selector === ":focus-visible" ? false : matches(selector)));
    };

    it.each(["grid", "rowgroup", "skeleton"])(
        "does not activate the first row or its tooltip when the pointer focuses the %s",
        async (target) => {
            const user = userEvent.setup();
            const onItemClick = vi.fn();
            renderWithIntl(
                <UiAsyncTable
                    items={[locked, open]}
                    columns={columns}
                    getItemTooltip={getItemTooltip}
                    onItemClick={onItemClick}
                    hasNextPage
                    isLoading
                    skeletonItemsCount={2}
                />,
            );
            const grid = getRowsContainer();
            usePointerFocus(grid);
            const clicked =
                target === "grid"
                    ? grid
                    : target === "rowgroup"
                      ? within(grid).getByRole("rowgroup")
                      : grid.querySelector(".gd-ui-kit-skeleton");
            if (!clicked) throw new Error("The loading table must render a skeleton.");

            await user.click(clicked);

            expect(grid).toHaveFocus();
            expect(grid).not.toHaveAttribute("aria-activedescendant");
            expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
            await user.keyboard("{Enter}");
            expect(onItemClick).not.toHaveBeenCalled();

            await user.keyboard("{ArrowDown}");
            expect(grid).toHaveAttribute("aria-activedescendant", getRow("Open").id);
            await user.keyboard("{ArrowUp}");
            expect(grid).toHaveAttribute("aria-activedescendant", getRow("Locked").id);
            expect(await screen.findByRole("tooltip")).toHaveTextContent(tooltip);
        },
    );

    it("does not activate arriving rows while the grid only has pointer focus", async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <UiAsyncTable items={[]} columns={columns} isLoading skeletonItemsCount={2} />,
        );
        const grid = getRowsContainer();
        usePointerFocus(grid);
        await user.click(within(grid).getByRole("rowgroup"));
        expect(grid).toHaveFocus();
        expect(grid).not.toHaveAttribute("aria-activedescendant");

        rerender(<UiAsyncTable items={[locked, open]} columns={columns} getItemTooltip={getItemTooltip} />);

        expect(grid).toHaveFocus();
        expect(grid).not.toHaveAttribute("aria-activedescendant");
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it.each(["before blur", "after blur"])(
        "does not restore keyboard activation on pointer refocus when scrolling resets %s",
        async (resetOrder) => {
            const user = userEvent.setup();
            const table = (items: IItem[], scrollToIndex?: number) => (
                <>
                    <button>Outside table</button>
                    <UiAsyncTable
                        items={items}
                        columns={columns}
                        getItemTooltip={getItemTooltip}
                        scrollToIndex={scrollToIndex}
                    />
                </>
            );
            const { rerender } = render(table([locked, open]));
            const grid = getRowsContainer();
            act(() => grid.focus());
            expect(grid).toHaveAttribute("aria-activedescendant", getRow("Locked").id);
            expect(await screen.findByRole("tooltip")).toHaveTextContent(tooltip);

            if (resetOrder === "before blur") {
                rerender(table([locked, open], 0));
            }
            expect(grid).toHaveAttribute("aria-activedescendant", getRow("Locked").id);
            await user.click(screen.getByRole("button", { name: "Outside table" }));
            if (resetOrder === "after blur") rerender(table([locked, open], 0));
            expect(grid).not.toHaveAttribute("aria-activedescendant");
            await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
            usePointerFocus(grid);
            await user.click(within(grid).getByRole("rowgroup"));

            expect(grid).toHaveFocus();
            expect(grid).not.toHaveAttribute("aria-activedescendant");
            expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
        },
    );

    it("does not activate a row when scrolling resets during pointer-only focus", async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <UiAsyncTable items={[locked, open]} columns={columns} getItemTooltip={getItemTooltip} />,
        );
        const grid = getRowsContainer();
        usePointerFocus(grid);
        await user.click(within(grid).getByRole("rowgroup"));
        expect(grid).not.toHaveAttribute("aria-activedescendant");

        rerender(
            <UiAsyncTable
                items={[locked, open]}
                columns={columns}
                getItemTooltip={getItemTooltip}
                scrollToIndex={1}
            />,
        );

        expect(grid).toHaveFocus();
        expect(grid).not.toHaveAttribute("aria-activedescendant");
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("recovers an actionable row after a deliberately clicked row is reset", async () => {
        const user = userEvent.setup();
        const onItemClick = vi.fn();
        const table = (scrollToIndex?: number) => (
            <UiAsyncTable
                items={[open, locked]}
                columns={columns}
                onItemClick={onItemClick}
                isItemClickable={isItemClickable}
                scrollToIndex={scrollToIndex}
            />
        );
        const { rerender } = render(table());
        const grid = getRowsContainer();
        usePointerFocus(grid);
        await user.click(screen.getByText("Locked"));
        expect(grid).toHaveFocus();
        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Locked").id);
        expect(onItemClick).not.toHaveBeenCalled();

        rerender(table(1));

        expect(grid).toHaveFocus();
        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Open").id);
        await user.keyboard("{Enter}");
        expect(onItemClick).toHaveBeenCalledWith(open);
    });

    it.each([
        { key: "ArrowRight", cell: "Locked" },
        { key: "Home", cell: "Locked" },
        { key: "End", cell: "locked" },
    ])("activates the first row's $cell cell with $key after pointer entry", async ({ key, cell }) => {
        const user = userEvent.setup();
        render(
            <UiAsyncTable
                items={[locked, open]}
                columns={[...columns, { key: "id", getTextContent: (item) => item.id }]}
            />,
        );
        const grid = getRowsContainer();
        usePointerFocus(grid);
        await user.click(grid);
        expect(grid).not.toHaveAttribute("aria-activedescendant");

        await user.keyboard(`{${key}}`);

        expect(grid).toHaveFocus();
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            within(getRow("Locked")).getByRole("gridcell", { name: cell }).id,
        );
    });

    it.each(["ArrowLeft", "ArrowDown"])(
        "moves right immediately after %s enters the empty table header from pointer focus",
        async (key) => {
            const user = userEvent.setup();
            render(
                <UiAsyncTable
                    items={[]}
                    columns={[
                        { key: "title", label: "Title" },
                        { key: "id", label: "ID" },
                    ]}
                    isLoading
                    skeletonItemsCount={2}
                />,
            );
            const grid = getRowsContainer();
            usePointerFocus(grid);
            await user.click(within(grid).getByRole("rowgroup"));
            expect(grid).not.toHaveAttribute("aria-activedescendant");

            await user.keyboard(`{${key}}`);
            expect(grid).toHaveAttribute(
                "aria-activedescendant",
                within(grid).getByRole("columnheader", { name: "Title" }).id,
            );
            await user.keyboard("{ArrowRight}");

            expect(grid).toHaveAttribute(
                "aria-activedescendant",
                within(grid).getByRole("columnheader", { name: "ID" }).id,
            );
            expect(grid).toHaveFocus();
        },
    );

    it("does not activate a row for keys that do not navigate the grid", async () => {
        const user = userEvent.setup();
        const onItemClick = vi.fn();
        render(
            <UiAsyncTable
                items={[locked, open]}
                columns={columns}
                getItemTooltip={getItemTooltip}
                onItemClick={onItemClick}
            />,
        );
        const grid = getRowsContainer();
        usePointerFocus(grid);
        await user.click(grid);

        for (const keys of ["x", "{Escape}", "{Enter}", " "]) {
            await user.keyboard(keys);
            expect(grid).not.toHaveAttribute("aria-activedescendant");
            expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
        }
        expect(onItemClick).not.toHaveBeenCalled();
    });
});

describe("UiAsyncTable getItemTooltip", () => {
    const onOuterKeyDown = vi.fn<() => void>();
    const renderTooltipTable = () =>
        renderWithIntl(
            <div onKeyDown={onOuterKeyDown}>
                <UiAsyncTable
                    items={[open, locked]}
                    totalItemsCount={2}
                    columns={columns}
                    getItemTooltip={(item) => (item.id === locked.id ? "No access" : undefined)}
                />
            </div>,
        );
    const expectNoTooltip = () =>
        waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

    it("adds the tooltip only to the rows it returns one for", async () => {
        renderTooltipTable();
        const lockedRow = getRow("Locked");

        fireEvent.mouseEnter(getRow("Open"));
        fireEvent.mouseEnter(lockedRow.parentElement ?? lockedRow);

        expect(await screen.findByRole("tooltip")).toHaveTextContent("No access");
        expect(screen.getAllByRole("tooltip")).toHaveLength(1);
        expect(getRow("Open")).not.toHaveAttribute("aria-describedby");
        expect(document.getElementById(lockedRow.getAttribute("aria-describedby") ?? "")).toHaveTextContent(
            "No access",
        );
    });

    it("shows the tooltip on the keyboard-active row while the table has focus", async () => {
        renderTooltipTable();
        const rows = getRowsContainer();
        act(() => rows.focus());

        fireEvent.keyDown(rows, { key: "ArrowDown", code: "ArrowDown" });
        expect(await screen.findByRole("tooltip")).toHaveTextContent("No access");

        act(() => rows.blur());
        await expectNoTooltip();
    });

    it("dismisses the tooltip on Escape without letting Escape through, until the row changes", async () => {
        renderTooltipTable();
        const rows = getRowsContainer();
        act(() => rows.focus());
        fireEvent.keyDown(rows, { key: "ArrowDown", code: "ArrowDown" });
        await screen.findByRole("tooltip");
        onOuterKeyDown.mockClear();

        fireEvent.keyDown(rows, { key: "Escape", code: "Escape" });
        await expectNoTooltip();
        expect(onOuterKeyDown).not.toHaveBeenCalled();

        fireEvent.keyDown(rows, { key: "ArrowUp", code: "ArrowUp" });
        fireEvent.keyDown(rows, { key: "ArrowDown", code: "ArrowDown" });
        expect(await screen.findByRole("tooltip")).toHaveTextContent("No access");
    });
});

describe("UiAsyncTable column headerTooltip", () => {
    const sortableColumns: IUiAsyncTableColumn<IItem>[] = [
        { key: "title", label: "Title", sortable: true, headerTooltip: "The name of the item" },
        { key: "id", label: "Id", sortable: true },
    ];
    const renderHeaderTable = () =>
        renderWithIntl(
            <UiAsyncTable items={[open]} totalItemsCount={1} columns={sortableColumns} onSort={() => {}} />,
        );
    const getHeader = () => {
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
        return grid;
    };
    const tooltipText = "The name of the item";
    const expectNoTooltip = () =>
        waitFor(() => expect(screen.queryByText(tooltipText)).not.toBeInTheDocument());

    it("describes the column header with the tooltip text", () => {
        renderHeaderTable();

        expect(screen.getByRole("columnheader", { name: "Title" })).toHaveAttribute(
            "aria-description",
            "The name of the item",
        );
        expect(screen.getByRole("columnheader", { name: "Id" })).not.toHaveAttribute("aria-description");
    });

    it("shows the tooltip on hover", async () => {
        renderHeaderTable();

        const label = screen.getByText("Title");
        fireEvent.mouseEnter(label.parentElement ?? label);

        expect(await screen.findByText(tooltipText)).toBeInTheDocument();
    });

    it("shows the tooltip while keyboard navigation is on the column and hides it on Escape", async () => {
        renderHeaderTable();
        const header = getHeader();
        act(() => header.focus());

        fireEvent.keyDown(header, { key: "ArrowRight", code: "ArrowRight" });
        await expectNoTooltip();

        fireEvent.keyDown(header, { key: "ArrowLeft", code: "ArrowLeft" });
        expect(await screen.findByText(tooltipText)).toBeInTheDocument();

        fireEvent.keyDown(header, { key: "Escape", code: "Escape" });
        await expectNoTooltip();
    });

    it("reaches the tooltip of a column that is not sortable by keyboard without sorting it", async () => {
        const onSort = vi.fn();
        renderWithIntl(
            <UiAsyncTable
                items={[open]}
                totalItemsCount={1}
                columns={[{ key: "title", label: "Title", headerTooltip: tooltipText }]}
                onSort={onSort}
            />,
        );
        const header = getHeader();
        act(() => header.focus());

        fireEvent.keyDown(header, { key: "ArrowRight", code: "ArrowRight" });
        expect(await screen.findByText(tooltipText)).toBeInTheDocument();

        fireEvent.keyDown(header, { key: "Enter", code: "Enter" });
        expect(onSort).not.toHaveBeenCalled();
    });

    it("points the header row at the column that keyboard navigation reached", () => {
        renderHeaderTable();
        const header = getHeader();
        act(() => header.focus());

        fireEvent.keyDown(header, { key: "ArrowRight", code: "ArrowRight" });

        const active = document.getElementById(header.getAttribute("aria-activedescendant") ?? "");
        expect(active).toHaveAttribute("role", "columnheader");
        expect(active).toHaveTextContent("Id");
    });

    it("keeps the active header inside its own table when two tables share column keys", () => {
        renderWithIntl(
            <>
                <UiAsyncTable
                    items={[open]}
                    totalItemsCount={1}
                    columns={sortableColumns}
                    onSort={() => {}}
                />
                <UiAsyncTable
                    items={[open]}
                    totalItemsCount={1}
                    columns={sortableColumns}
                    onSort={() => {}}
                />
            </>,
        );
        const headers = screen
            .getAllByRole("columnheader", { name: "Title" })
            .map((cell) => cell.parentElement!);
        expect(headers).toHaveLength(2);
        const secondHeader = headers[1].closest<HTMLElement>('[role="grid"]')!;
        act(() => secondHeader.focus());
        fireEvent.keyDown(secondHeader, { key: "Home", code: "Home", ctrlKey: true });

        fireEvent.keyDown(secondHeader, { key: "ArrowRight", code: "ArrowRight" });

        const active = document.getElementById(secondHeader.getAttribute("aria-activedescendant") ?? "");
        expect(secondHeader.contains(active)).toBe(true);
    });
});

describe("UiAsyncTable grid focus", () => {
    const manyItems = Array.from({ length: 50 }, (_, index) => ({
        id: `item-${index}`,
        title: `Item ${index}`,
    }));
    const gridColumns: IUiAsyncTableColumn<IItem>[] = [
        { key: "title", label: "Title", sortable: true },
        { key: "id", label: "ID" },
    ];

    it("keeps active rows, cells, and row labels in their own grid when item IDs repeat", () => {
        renderWithIntl(
            <>
                <UiAsyncTable items={[open]} columns={gridColumns} />
                <UiAsyncTable items={[{ ...open, title: "Second table item" }]} columns={gridColumns} />
            </>,
        );
        const [, grid] = screen.getAllByRole("grid");
        const cell = within(grid).getByRole("gridcell", { name: "Second table item" });
        const row = cell.closest('[role="row"]');
        const activeItem = () => document.getElementById(grid.getAttribute("aria-activedescendant") ?? "");

        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "ArrowDown", code: "ArrowDown" });
        expect(activeItem()).toBe(row);
        expect(row).toHaveAccessibleName("Second table item");

        fireEvent.keyDown(grid, { key: "ArrowRight", code: "ArrowRight" });
        expect(activeItem()).toBe(cell);
    });

    it("omits a generated active descendant for custom rows but keeps it for the standard header", () => {
        renderWithIntl(
            <UiAsyncTable
                items={[open]}
                columns={gridColumns}
                renderItem={(item) => (
                    <div role="row">
                        <div role="gridcell">{item.title}</div>
                    </div>
                )}
            />,
        );
        const grid = screen.getByRole("grid");

        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "ArrowDown", code: "ArrowDown" });
        expect(grid).not.toHaveAttribute("aria-activedescendant");

        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            within(grid).getByRole("columnheader", { name: "Title" }).id,
        );
    });

    it("keeps the active cell in the grid when the active column is hidden", () => {
        const { rerender } = render(<UiAsyncTable items={[open]} columns={gridColumns} />);
        const grid = screen.getByRole("grid");

        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "End", code: "End" });
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            within(grid).getByRole("gridcell", { name: "open" }).id,
        );

        rerender(<UiAsyncTable items={[open]} columns={[gridColumns[0]]} />);

        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            within(grid).getByRole("gridcell", { name: "Open" }).id,
        );
        expect(grid).toHaveFocus();
    });

    it("keeps the fallback cell active when a different column is added", () => {
        const initialColumns: IUiAsyncTableColumn<IItem>[] = [
            ...gridColumns,
            { getTextContent: () => "Original third column" },
        ];
        const { rerender } = render(<UiAsyncTable items={[open]} columns={initialColumns} />);
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "End", code: "End" });
        expect(document.getElementById(grid.getAttribute("aria-activedescendant") ?? "")).toHaveTextContent(
            "Original third column",
        );

        rerender(<UiAsyncTable items={[open]} columns={gridColumns} />);
        const fallbackCell = within(grid).getByRole("gridcell", { name: "open" });
        expect(grid).toHaveAttribute("aria-activedescendant", fallbackCell.id);

        rerender(
            <UiAsyncTable
                items={[open]}
                columns={[...gridColumns, { getTextContent: () => "Replacement third column" }]}
            />,
        );
        expect(grid).toHaveAttribute("aria-activedescendant", fallbackCell.id);
        expect(grid).toHaveFocus();
    });

    it("stays in row mode when columns return after all columns were removed", () => {
        const onItemClick = vi.fn();
        const { rerender } = render(
            <UiAsyncTable items={[open]} columns={gridColumns} onItemClick={onItemClick} />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "End", code: "End" });

        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            within(grid).getByRole("gridcell", { name: "open" }).id,
        );
        const rowId = getRow("Open").id;
        rerender(<UiAsyncTable items={[open]} columns={[]} onItemClick={onItemClick} />);
        expect(grid).toHaveAttribute("aria-activedescendant", rowId);

        rerender(<UiAsyncTable items={[open]} columns={gridColumns} onItemClick={onItemClick} />);
        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Open").id);
        fireEvent.keyDown(grid, { key: "Enter", code: "Enter" });
        expect(onItemClick).toHaveBeenCalledWith(open);
        expect(grid).toHaveFocus();
    });

    it.each(["hide header", "remove columns"])(
        "returns to an actionable row when the active header disappears: %s",
        (change) => {
            const onItemClick = vi.fn();
            const { rerender } = render(
                <UiAsyncTable items={[open]} columns={gridColumns} onItemClick={onItemClick} />,
            );
            const grid = screen.getByRole("grid");
            act(() => grid.focus());
            fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
            expect(document.getElementById(grid.getAttribute("aria-activedescendant") ?? "")).toHaveAttribute(
                "role",
                "columnheader",
            );

            const rowId = getRow("Open").id;
            rerender(
                <UiAsyncTable
                    items={[open]}
                    columns={change === "remove columns" ? [] : gridColumns}
                    hideHeader={change === "hide header"}
                    onItemClick={onItemClick}
                />,
            );
            expect(grid).toHaveAttribute("aria-activedescendant", rowId);
            fireEvent.keyDown(grid, { key: "Enter", code: "Enter" });
            expect(onItemClick).toHaveBeenCalledWith(open);
            expect(grid).toHaveFocus();
        },
    );

    it("clears active header focus when no rows remain and keeps it cleared when the header returns", () => {
        const { rerender } = render(<UiAsyncTable items={[]} columns={gridColumns} />);
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
        expect(grid).toHaveAttribute("aria-activedescendant");

        rerender(<UiAsyncTable items={[]} columns={gridColumns} hideHeader />);
        expect(grid).not.toHaveAttribute("aria-activedescendant");
        expect(grid).toHaveAttribute("tabindex", "-1");

        rerender(<UiAsyncTable items={[]} columns={gridColumns} />);
        expect(grid).not.toHaveAttribute("aria-activedescendant");
    });

    it("keeps the recovered row active when header removal also resets scrolling", () => {
        const onItemClick = vi.fn();
        const { rerender } = render(
            <UiAsyncTable items={[open, locked]} columns={gridColumns} onItemClick={onItemClick} />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "Title" }).id,
        );

        rerender(
            <UiAsyncTable
                items={[open, locked]}
                columns={gridColumns}
                onItemClick={onItemClick}
                hideHeader
                scrollToIndex={0}
            />,
        );

        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Open").id);
        expect(grid).toHaveFocus();
        fireEvent.keyDown(grid, { key: "Enter", code: "Enter" });
        expect(onItemClick).toHaveBeenCalledWith(open);
    });

    it("activates the first arriving row when an empty grid keeps focus after header removal", () => {
        const onItemClick = vi.fn();
        const { rerender } = render(
            <UiAsyncTable items={[]} columns={gridColumns} isLoading skeletonItemsCount={2} />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });

        rerender(
            <UiAsyncTable items={[]} columns={gridColumns} isLoading skeletonItemsCount={2} hideHeader />,
        );
        expect(grid).toHaveFocus();
        expect(grid).not.toHaveAttribute("aria-activedescendant");

        rerender(
            <UiAsyncTable
                items={[open, locked]}
                columns={gridColumns}
                hideHeader
                onItemClick={onItemClick}
            />,
        );

        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Open").id);
        expect(grid).toHaveFocus();
        fireEvent.keyDown(grid, { key: "Enter", code: "Enter" });
        expect(onItemClick).toHaveBeenCalledWith(open);
        fireEvent.keyDown(grid, { key: "ArrowDown", code: "ArrowDown" });
        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Locked").id);
    });

    it("leaves focus outside the grid when rows arrive after header removal", () => {
        const { rerender } = render(
            <>
                <button>Outside table</button>
                <UiAsyncTable items={[]} columns={gridColumns} isLoading skeletonItemsCount={2} />
            </>,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
        rerender(
            <>
                <button>Outside table</button>
                <UiAsyncTable items={[]} columns={gridColumns} isLoading skeletonItemsCount={2} hideHeader />
            </>,
        );
        const outside = screen.getByRole("button", { name: "Outside table" });
        act(() => outside.focus());

        rerender(
            <>
                <button>Outside table</button>
                <UiAsyncTable items={[open, locked]} columns={gridColumns} hideHeader />
            </>,
        );

        expect(outside).toHaveFocus();
        expect(grid).not.toHaveAttribute("aria-activedescendant");
    });

    it("omits the row label when multiline content is empty", () => {
        const getMultiLineTextContent = vi.fn(() => []);
        render(
            <UiAsyncTable
                items={[open]}
                columns={[{ key: "title", getTextContent: () => "Unused fallback", getMultiLineTextContent }]}
            />,
        );
        const row = screen.getByRole("gridcell").closest('[role="row"]');
        expect(row).not.toHaveAttribute("aria-labelledby");
        expect(screen.queryByText("Unused fallback")).not.toBeInTheDocument();
        expect(getMultiLineTextContent).toHaveBeenCalledTimes(1);
    });

    it("labels a multiline row with its first rendered line", () => {
        const getMultiLineTextContent = vi.fn(() => ["First line", "Second line"]);
        render(
            <UiAsyncTable
                items={[open]}
                columns={[{ key: "title", getTextContent: () => "Unused fallback", getMultiLineTextContent }]}
            />,
        );
        const row = screen.getByRole("gridcell").closest('[role="row"]');
        expect(row).toHaveAccessibleName("First line");
        expect(document.getElementById(row?.getAttribute("aria-labelledby") ?? "")).toBe(
            screen.getByText("First line"),
        );
        expect(screen.queryByText("Unused fallback")).not.toBeInTheDocument();
        expect(getMultiLineTextContent).toHaveBeenCalledTimes(1);
    });

    it("keeps focus, headers and the active cell in one grid with one tab stop", () => {
        renderWithIntl(
            <UiAsyncTable items={manyItems} totalItemsCount={50} columns={gridColumns} maxHeight={100} />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        expect(grid).toHaveFocus();
        expect(grid).toHaveAttribute("tabindex", "0");
        expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
        expect(within(grid).getAllByRole("columnheader")).toHaveLength(2);
        expect(grid).toHaveAttribute("aria-rowcount", "51");
        expect(grid.querySelector('[role="rowgroup"]')).not.toHaveAttribute("aria-activedescendant");

        fireEvent.keyDown(grid, { key: "End", code: "End", ctrlKey: true });
        const active = document.getElementById(grid.getAttribute("aria-activedescendant")!);
        expect(active).toHaveAttribute("role", "gridcell");
        expect(active).toHaveTextContent("item-49");
        expect(active?.closest('[role="row"]')).toHaveAttribute("aria-rowindex", "51");
        expect(grid.contains(active)).toBe(true);
        expect(grid).toHaveFocus();
    });

    it("sorts from the header through the grid without introducing another tab stop", () => {
        const onSort = vi.fn();
        renderWithIntl(
            <UiAsyncTable items={[open]} totalItemsCount={1} columns={gridColumns} onSort={onSort} />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
        fireEvent.keyDown(grid, { key: "Enter", code: "Enter" });
        expect(onSort).toHaveBeenCalledWith("title");
        expect(document.getElementById(grid.getAttribute("aria-activedescendant")!)).toHaveAttribute(
            "role",
            "columnheader",
        );
        expect(grid).toHaveFocus();
    });

    it.each([{ items: [] }, { items: [open] }])(
        "keeps PageUp on the header with $items.length items",
        ({ items }) => {
            renderWithIntl(<UiAsyncTable items={items} columns={gridColumns} />);
            const grid = screen.getByRole("grid");
            act(() => grid.focus());
            fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
            fireEvent.keyDown(grid, { key: "ArrowRight", code: "ArrowRight" });
            const headerId = grid.getAttribute("aria-activedescendant");

            fireEvent.keyDown(grid, { key: "PageUp", code: "PageUp" });

            expect(grid).toHaveAttribute("aria-activedescendant", headerId);
            expect(document.getElementById(headerId!)).toBe(
                within(grid).getByRole("columnheader", { name: "ID" }),
            );
            expect(grid).toHaveFocus();
        },
    );

    it("reaches the header when PageUp goes beyond the first data row", () => {
        renderWithIntl(<UiAsyncTable items={manyItems} columns={gridColumns} maxHeight={100} />);
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        fireEvent.keyDown(grid, { key: "Home", code: "Home", ctrlKey: true });
        fireEvent.keyDown(grid, { key: "ArrowDown", code: "ArrowDown" });

        fireEvent.keyDown(grid, { key: "PageUp", code: "PageUp" });

        const active = document.getElementById(grid.getAttribute("aria-activedescendant")!);
        expect(active).toBe(within(grid).getByRole("columnheader", { name: "Title" }));
    });

    it("moves right immediately after PageUp reaches the header from a whole row", async () => {
        const user = userEvent.setup();
        renderWithIntl(<UiAsyncTable items={[open]} columns={gridColumns} />);
        await user.tab();
        const grid = screen.getByRole("grid");
        expect(grid).toHaveFocus();

        await user.keyboard("{PageUp}");
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "Title" }).id,
        );
        await user.keyboard("{ArrowRight}");

        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "ID" }).id,
        );
        expect(grid).toHaveFocus();
    });

    it("moves right immediately when Tab lands on the header of an empty table", async () => {
        const user = userEvent.setup();
        renderWithIntl(<UiAsyncTable items={[]} columns={gridColumns} />);
        await user.tab();
        const grid = screen.getByRole("grid");
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "Title" }).id,
        );

        await user.keyboard("{ArrowRight}");

        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "ID" }).id,
        );
    });

    it("steps back from the first cell to the whole row, which Enter opens", async () => {
        const user = userEvent.setup();
        const onItemClick = vi.fn();
        renderWithIntl(<UiAsyncTable items={[open]} columns={gridColumns} onItemClick={onItemClick} />);
        await user.tab();
        const grid = screen.getByRole("grid");

        await user.keyboard("{ArrowRight}{ArrowRight}{ArrowLeft}{ArrowLeft}");
        expect(grid).toHaveAttribute("aria-activedescendant", getRow("Open").id);
        await user.keyboard("{Enter}");
        expect(onItemClick).toHaveBeenCalledWith(open);

        // the header has no whole-row state, so it stops at its first column
        await user.keyboard("{ArrowUp}{ArrowLeft}");
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "Title" }).id,
        );
    });

    it("keeps the header active when sorting resets the scroll target", async () => {
        // like the automations list: sorting reloads from the top, then clears the target once loaded
        function SortResettingTable() {
            const [scrollToIndex, setScrollToIndex] = useState<number>();
            useEffect(() => {
                if (scrollToIndex !== undefined) {
                    setScrollToIndex(undefined);
                }
            }, [scrollToIndex]);
            return (
                <UiAsyncTable
                    items={[open]}
                    columns={gridColumns}
                    scrollToIndex={scrollToIndex}
                    onSort={() => setScrollToIndex(0)}
                />
            );
        }
        const user = userEvent.setup();
        renderWithIntl(<SortResettingTable />);
        await user.tab();
        const grid = screen.getByRole("grid");

        await user.keyboard("{PageUp}{Enter}");
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "Title" }).id,
        );
        await user.keyboard("{ArrowRight}");
        expect(grid).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("columnheader", { name: "ID" }).id,
        );
    });

    it("keeps navigation on data rows when a custom header has no generated IDs", () => {
        renderWithIntl(
            <UiAsyncTable
                items={[open]}
                totalItemsCount={1}
                columns={gridColumns}
                renderHeader={() => (
                    <div role="rowgroup">
                        <div role="row" aria-rowindex={1}>
                            <div role="columnheader" aria-colindex={1}>
                                Custom title
                            </div>
                        </div>
                    </div>
                )}
            />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        expect(grid).toHaveAttribute("aria-rowcount", "2");

        for (const key of ["ArrowUp", "Home", "PageUp"]) {
            fireEvent.keyDown(grid, { key, code: key, ctrlKey: key === "Home" });
            const active = document.getElementById(grid.getAttribute("aria-activedescendant")!);
            expect(active).toBeInTheDocument();
            expect(active?.closest('[role="row"]')).toHaveAttribute("aria-rowindex", "2");
            expect(grid.contains(active)).toBe(true);
        }
        const activeId = grid.getAttribute("aria-activedescendant");
        fireEvent.click(screen.getByRole("columnheader", { name: "Custom title" }));
        expect(grid).toHaveAttribute("aria-activedescendant", activeId);
    });

    it("does not add an empty grid tab stop for a custom header", () => {
        renderWithIntl(
            <UiAsyncTable items={[]} columns={gridColumns} renderHeader={() => <div>Custom header</div>} />,
        );
        expect(screen.getByRole("grid")).toHaveAttribute("tabindex", "-1");
        expect(screen.getByRole("grid")).not.toHaveAttribute("aria-activedescendant");
    });

    it("loads another page when keyboard navigation reaches the last loaded row", () => {
        const loadNextPage = vi.fn();
        renderWithIntl(
            <UiAsyncTable
                items={manyItems}
                totalItemsCount={100}
                columns={gridColumns}
                maxHeight={100}
                hasNextPage
                loadNextPage={loadNextPage}
                skeletonItemsCount={5}
            />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        expect(loadNextPage).not.toHaveBeenCalled();
        fireEvent.keyDown(grid, { key: "End", code: "End", ctrlKey: true });
        expect(loadNextPage).toHaveBeenCalledTimes(1);
        expect(document.getElementById(grid.getAttribute("aria-activedescendant")!)).toBeInTheDocument();
    });

    it("uses Home/End for columns and PageDown/PageUp for rows", () => {
        renderWithIntl(
            <UiAsyncTable items={manyItems} totalItemsCount={50} columns={gridColumns} maxHeight={100} />,
        );
        const grid = screen.getByRole("grid");
        act(() => grid.focus());
        const active = () => document.getElementById(grid.getAttribute("aria-activedescendant")!);
        fireEvent.keyDown(grid, { key: "End", code: "End" });
        expect(active()).toHaveTextContent("item-0");
        fireEvent.keyDown(grid, { key: "Home", code: "Home" });
        expect(active()).toHaveTextContent("Item 0");
        fireEvent.keyDown(grid, { key: "PageDown", code: "PageDown" });
        expect(active()).not.toHaveTextContent("Item 0");
        fireEvent.keyDown(grid, { key: "PageUp", code: "PageUp" });
        expect(active()).toHaveTextContent("Item 0");
    });
});
