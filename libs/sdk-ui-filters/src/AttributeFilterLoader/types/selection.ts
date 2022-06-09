// (C) 2022 GoodData Corporation
import { CallbackRegistration } from "./common";

//
// Single select
//

/**
 * Handles simple selection of at most one item
 * @alpha
 */
export interface ISingleSelectionHandler<T> {
    //
    // manipulators
    //
    changeSelection(selection: T): void;

    //
    // selectors
    //
    getSelection(): T;

    //
    // callbacks
    //
    onSelectionChanged: CallbackRegistration<{ selection: T }>;
}

/**
 * Handles selection of items with stages: working and committed.
 * @alpha
 */
export interface IStagedSingleSelectionHandler<T> extends Omit<ISingleSelectionHandler<T>, "getSelection"> {
    //
    // manipulators
    //

    /**
     * Commit the current working selection making it the new committed selection.
     */
    commitSelection(): void;

    /**
     * Revert the current working selection by resetting it to the committed selection.
     */
    revertSelection(): void;

    //
    // selectors
    //
    getWorkingSelection(): T;
    getCommittedSelection(): T;

    //
    // callbacks
    //
    onSelectionCommitted: CallbackRegistration<{ selection: T }>;
}

//
// Invertable selection
//

/**
 * @alpha
 */
export interface InvertableSelection<T> {
    items: T[];
    isInverted: boolean;
}

/**
 * Handles simple selection of items
 * @alpha
 */
export interface IInvertableSelectionHandler<T extends InvertableSelection<any>> {
    //
    // manipulators
    //
    changeSelection(selection: T): void;
    invertSelection(): void;
    clearSelection(): void;

    //
    // selectors
    //
    getSelection(): T;

    //
    // callbacks
    //
    onSelectionChanged: CallbackRegistration<{ selection: T }>;
}

/**
 * Handles selection of items with stages: working and committed.
 * @alpha
 */
export interface IStagedInvertableSelectionHandler<T extends InvertableSelection<any>>
    extends Omit<IInvertableSelectionHandler<T>, "getSelection"> {
    //
    // manipulators
    //

    /**
     * Commit the current working selection making it the new committed selection.
     */
    commitSelection(): void;

    /**
     * Revert the current working selection by resetting it to the committed selection.
     */
    revertSelection(): void;

    //
    // selectors
    //
    getWorkingSelection(): T;
    getCommittedSelection(): T;

    //
    // callbacks
    //
    onSelectionCommitted: CallbackRegistration<{ selection: T }>;
}
