// (C) 2022 GoodData Corporation
import { CallbackRegistration } from "./common.js";

/**
 * Handles simple selection of at most one item.
 *
 * @public
 */
export interface ISingleSelectionHandler<T> {
    /**
     * Change the selection.
     *
     * @param selection - new selection
     */
    changeSelection(selection: T): void;

    /**
     * Returns the current selection.
     */
    getSelection(): T;

    /**
     * Registers a callback that will be fired when the selection changes.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onSelectionChanged: CallbackRegistration<OnSelectionChangedCallbackPayload<T>>;
}

/**
 * Handles selection of keys with stages: working and committed.
 * @public
 */
export interface IStagedSingleSelectionHandler<T> extends Omit<ISingleSelectionHandler<T>, "getSelection"> {
    /**
     * Commit the current working selection making it the new committed selection.
     */
    commitSelection(): void;

    /**
     * Revert the current working selection by resetting it to the committed selection.
     */
    revertSelection(): void;

    /**
     * Returns the current working selection.
     */
    getWorkingSelection(): T;

    /**
     * Returns the current committed selection.
     */
    getCommittedSelection(): T;

    /**
     * Returns whether the current working selection is empty.
     */
    isWorkingSelectionEmpty(): boolean;

    /**
     * Returns whether the current working selection is changed..
     */
    isWorkingSelectionChanged(): boolean;

    /**
     * Registers a callback that will be fired when the selection is committed.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onSelectionCommitted: CallbackRegistration<OnSelectionCommittedCallbackPayload<T>>;
}

//
// Invertable selection
//

/**
 * @public
 */
export interface InvertableSelection<T> {
    keys: T[];
    isInverted: boolean;
}

/**
 * Handles the selection that can be inverted.
 *
 * @public
 */
export interface IInvertableSelectionHandler<T extends InvertableSelection<any>> {
    /**
     * Change the selection.
     *
     * @param selection - new selection
     */
    changeSelection(selection: T): void;

    /**
     * Invert the current selection.
     */
    invertSelection(): void;

    /**
     * Clear the current selection.
     */
    clearSelection(): void;

    /**
     * Returns the current selection.
     */
    getSelection(): T;

    /**
     * Registers a callback that will be fired when the selection changes.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onSelectionChanged: CallbackRegistration<OnSelectionChangedCallbackPayload<T>>;
}

/**
 * Handles selection of keys with stages: working and committed.
 * @public
 */
export interface IStagedInvertableSelectionHandler<T extends InvertableSelection<any>>
    extends Omit<IInvertableSelectionHandler<T>, "getSelection"> {
    /**
     * Commit the current working selection making it the new committed selection.
     */
    commitSelection(): void;

    /**
     * Revert the current working selection by resetting it to the committed selection.
     */
    revertSelection(): void;

    /**
     * Returns the current working selection.
     */
    getWorkingSelection(): T;

    /**
     * Returns whether the current working selection is empty.
     */
    isWorkingSelectionEmpty(): boolean;

    /**
     * Returns whether the current working selection is changed..
     */
    isWorkingSelectionChanged(): boolean;

    /**
     * Returns the current committed selection.
     */
    getCommittedSelection(): T;

    /**
     * Registers a callback that will be fired when the selection is committed.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onSelectionCommitted: CallbackRegistration<OnSelectionCommittedCallbackPayload<T>>;
}

/**
 * Payload of the onSelectionChanged callback.
 *
 * @public
 */
export type OnSelectionChangedCallbackPayload<T> = { selection: T };

/**
 * Payload of the onSelectionCommitted callback.
 *
 * @public
 */
export type OnSelectionCommittedCallbackPayload<T> = { selection: T };
