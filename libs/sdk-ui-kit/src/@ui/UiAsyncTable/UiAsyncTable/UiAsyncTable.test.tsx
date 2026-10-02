// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const getRowsContainer = () => {
    const rows = screen.getByRole("grid").querySelector<HTMLElement>('[tabindex="0"]');
    if (!rows) {
        throw new Error("The focusable rows container was not rendered.");
    }
    return rows;
};

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
