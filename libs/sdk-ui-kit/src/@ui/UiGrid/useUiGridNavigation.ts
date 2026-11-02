// (C) 2026 GoodData Corporation

import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";

const makeUiGridKeyboardNavigation = makeKeyboardNavigation({
    onFocusUp: [{ code: "ArrowUp" }],
    onFocusDown: [{ code: "ArrowDown" }],
    onFocusLeft: [{ code: "ArrowLeft" }],
    onFocusRight: [{ code: "ArrowRight" }],
    onFocusRowStart: [{ code: "Home", modifiers: ["!Control", "!Meta"] }],
    onFocusRowEnd: [{ code: "End", modifiers: ["!Control", "!Meta"] }],
    onFocusFirst: [
        { code: "Home", modifiers: ["Control"] },
        { code: "Home", modifiers: ["Meta"] },
    ],
    onFocusLast: [
        { code: "End", modifiers: ["Control"] },
        { code: "End", modifiers: ["Meta"] },
    ],
    onSelect: [{ code: ["Enter", "Space"] }],
});

type CellRef = (element: HTMLElement | null) => void;

interface IUiGridNavigationOptions<T> {
    rows: ReadonlyArray<ReadonlyArray<T>>;
    getItemId: (item: T) => string;
    selectedItemId: string | undefined;
    onPick: (item: T) => void;
    onEscape: ((event: KeyboardEvent) => void) | undefined;
}

interface IUiGridNavigation {
    tabStopId: string | undefined;
    keyboardFocusedId: string | undefined;
    cellRef: (id: string) => CellRef;
    onCellFocus: (id: string) => void;
    onCellBlur: (id: string) => void;
    gridHandlers: {
        onKeyDown: (event: KeyboardEvent) => void;
        onPointerDownCapture: () => void;
        onMouseMoveCapture: () => void;
    };
}

interface IGridPosition {
    row: number;
    column: number;
}

const FIRST_CELL: IGridPosition = { row: 0, column: 0 };

function positionOf<T>(
    rows: ReadonlyArray<ReadonlyArray<T>>,
    getItemId: (item: T) => string,
    id: string | undefined,
): IGridPosition {
    for (const [row, items] of rows.entries()) {
        const column = items.findIndex((item) => getItemId(item) === id);
        if (column !== -1) {
            return { row, column };
        }
    }
    return FIRST_CELL;
}

export function useUiGridNavigation<T>({
    rows,
    getItemId,
    selectedItemId,
    onPick,
    onEscape,
}: IUiGridNavigationOptions<T>): IUiGridNavigation {
    const [preferredTabStopId, setPreferredTabStopId] = useState(selectedItemId);
    const [keyboardFocusedId, setKeyboardFocusedId] = useState<string>();
    const cells = useRef(new Map<string, HTMLElement>());
    // A mouse press never counts as keyboard focus, whatever :focus-visible reports.
    const isPointerDown = useRef(false);

    useEffect(() => {
        const endPress = () => {
            isPointerDown.current = false;
        };
        document.addEventListener("pointerup", endPress, true);
        document.addEventListener("pointercancel", endPress, true);
        return () => {
            document.removeEventListener("pointerup", endPress, true);
            document.removeEventListener("pointercancel", endPress, true);
        };
    }, []);

    const position = positionOf(rows, getItemId, preferredTabStopId);
    const tabStop = rows[position.row]?.[position.column];
    const tabStopId = tabStop === undefined ? undefined : getItemId(tabStop);

    const moveTo = (row: number, column: number) => {
        const item = rows[row]?.[column];
        if (item === undefined) {
            return;
        }
        cells.current.get(getItemId(item))?.focus();
    };
    const lastColumn = (row: number) => (rows[row]?.length ?? 0) - 1;
    const columnIn = (row: number) => Math.min(position.column, lastColumn(row));

    const onKeyDown = (event: KeyboardEvent) =>
        makeUiGridKeyboardNavigation<KeyboardEvent>({
            onFocusLeft: () => moveTo(position.row, position.column - 1),
            onFocusRight: () => moveTo(position.row, position.column + 1),
            onFocusUp: () => moveTo(position.row - 1, columnIn(position.row - 1)),
            onFocusDown: () => moveTo(position.row + 1, columnIn(position.row + 1)),
            onFocusRowStart: () => moveTo(position.row, 0),
            onFocusRowEnd: () => moveTo(position.row, lastColumn(position.row)),
            onFocusFirst: () => moveTo(0, 0),
            onFocusLast: () => moveTo(rows.length - 1, lastColumn(rows.length - 1)),
            onSelect: () => {
                if (tabStop !== undefined) {
                    onPick(tabStop);
                }
            },
        })(event);

    const cellRef =
        (id: string): CellRef =>
        (element) => {
            if (element === null) {
                cells.current.delete(id);
            } else {
                cells.current.set(id, element);
            }
        };
    const onCellFocus = (id: string) => {
        const isKeyboard =
            !isPointerDown.current && cells.current.get(id)?.matches(":focus-visible") === true;
        setPreferredTabStopId(id);
        setKeyboardFocusedId(isKeyboard ? id : undefined);
    };
    const onCellBlur = (id: string) =>
        setKeyboardFocusedId((current) => (current === id ? undefined : current));

    return {
        tabStopId,
        keyboardFocusedId,
        cellRef,
        onCellFocus,
        onCellBlur,
        gridHandlers: {
            onKeyDown: (event) => {
                if (event.code === "Escape" && onEscape !== undefined) {
                    event.stopPropagation();
                    onEscape(event);
                    return;
                }
                // Keys typed into a cell's content, such as an input, belong to that content; only Escape
                // still reaches `onEscape`.
                if (tabStopId !== undefined && event.target === cells.current.get(tabStopId)) {
                    onKeyDown(event);
                }
            },
            onPointerDownCapture: () => {
                isPointerDown.current = true;
            },
            onMouseMoveCapture: () => setKeyboardFocusedId(undefined),
        },
    };
}
