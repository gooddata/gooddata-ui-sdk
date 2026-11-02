// (C) 2026 GoodData Corporation

import { type ComponentType, type KeyboardEvent } from "react";

import { type UiToolbarNamingConfig } from "../UiToolbar/context.js";

/**
 * @internal
 */
export type UiGridNamingConfig = UiToolbarNamingConfig;

/**
 * @internal
 */
export interface IUiGridCellProps<T> {
    item: T;
    isSelected: boolean;

    /**
     * The cell got the focus from the keyboard (by the browser's :focus-visible), not from a click, and the
     * pointer has not moved over the grid since. `isOpen={isKeyboardFocused || undefined}` on a hover
     * tooltip then shows it to keyboard users too.
     */
    isKeyboardFocused: boolean;
}

/**
 * @internal
 */
export interface IUiGridCellWrapperProps<T> extends IUiGridCellProps<T> {
    isTabStop: boolean;

    /**
     * Registers the element the grid moves the focus to; it has to be the gridcell.
     */
    cellRef: (element: HTMLElement | null) => void;

    onPick: () => void;
    onFocus: () => void;
    onBlur: () => void;
    Cell: ComponentType<IUiGridCellProps<T>>;
}

/**
 * @internal
 */
export interface IUiGridPluggableComponents<T> {
    Cell: ComponentType<IUiGridCellProps<T>>;

    /**
     * The gridcell itself: its role, roving tabindex, aria-selected, focus ref and handlers.
     */
    CellWrapper: ComponentType<IUiGridCellWrapperProps<T>>;
}

/**
 * @internal
 */
export interface IUiGridProps<T>
    extends
        Pick<IUiGridPluggableComponents<T>, "Cell">,
        Partial<Pick<IUiGridPluggableComponents<T>, "CellWrapper">> {
    /**
     * Groups of cells. Each group starts on a new row and wraps onto further rows after `columns` cells,
     * so a group's last row may be shorter; Up and Down then land on the last cell of a shorter row.
     */
    groups: ReadonlyArray<ReadonlyArray<T>>;

    /**
     * Unique across the whole grid.
     */
    getItemId: (item: T) => string;

    /**
     * Marks the selected cell and sets the starting tab stop (the first cell when no cell has this id).
     * A later change does not move the tab stop.
     */
    selectedItemId?: string;

    onPick: (item: T) => void;

    /**
     * Must be a positive integer.
     */
    columns: number;

    /**
     * In pixels. Without it, cells share the width of the grid.
     */
    cellWidth?: number;

    /**
     * In pixels, between cells and between rows.
     */
    gap?: number;

    accessibilityConfig: UiGridNamingConfig;

    /**
     * When set, the grid handles Escape and stops it; otherwise Escape reaches the ancestors.
     */
    onEscape?: (event: KeyboardEvent) => void;

    id?: string;
    dataTestId?: string;
}
