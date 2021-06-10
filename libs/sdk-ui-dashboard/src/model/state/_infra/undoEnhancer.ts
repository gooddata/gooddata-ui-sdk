// (C) 2021 GoodData Corporation
import produce, { enablePatches, original, Patch, produceWithPatches } from "immer";
import { CaseReducer, Draft, PayloadAction } from "@reduxjs/toolkit";
import { IDashboardCommand } from "../../commands";

/*
 * Undo relies on immer's patching functionality. It has to be turned on explicitly.
 */
enablePatches();

/**
 * An entry on undo stack contains patches required
 *
 * @internal
 */
export type UndoEntry = {
    /**
     * Dashboard command that has initiated the state changes.
     */
    cmd: IDashboardCommand;

    /**
     * Patches to apply in order to undo the changes.
     */
    undoPatches: Patch[];

    /**
     * Patches to apply in order to redo the undone changes.
     */
    redoPatches: Patch[];
};

/**
 * Slice that can be undo-enabled needs to include the undo section which will contain the essential undo metadata.
 *
 * @internal
 */
export type UndoEnhancedState = {
    _undo: {
        undoPointer: number;
        undoStack: UndoEntry[];
    };
};

/**
 * Initial value of the undo state.
 */
export const InitialUndoState: UndoEnhancedState = {
    _undo: {
        undoPointer: -1,
        undoStack: [],
    },
};

/**
 * Actions that can be undone need to contain extra information in order to perform the undo correctly.
 */
export type UndoPayload = {
    /**
     * Undo-related information. If not specified, then no undo will be possible for the action
     */
    undo: {
        /**
         * Command that has initiated the undoable reductions. Command processing establishes the boundary for undo
         * processing: undo needs to roll back everything that a command has done to the state. Single command may do
         * multiple modifications in succession and may create several entries in the undo stack. All of those need
         * to be undone.
         */
        cmd: IDashboardCommand;
    };
};

/**
 * Signature of reducer that is eligible for undo-decoration. The requirement is that the reducer is for state shape
 * that can hold the information necessary for undo.
 *
 * See {@link UndoEnhancedState} - this is the type that defines the enhancement of the state where the decorator
 * will keep the undo information.
 *
 * @internal
 */
export type UndoableReducer<TState extends UndoEnhancedState, TPayload> = CaseReducer<
    TState,
    PayloadAction<TPayload>
>;

/**
 * Signature of the reducer enhanced to with undo - the payload action requires additional `undo` part in the payload.
 *
 * @internal
 */
export type UndoEnabledReducer<TState extends UndoEnhancedState, TPayload> = CaseReducer<
    TState,
    PayloadAction<UndoPayload & TPayload>
>;

/**
 * Decorates a reducer with capability to construct undo and redo patches for the state modification done by the underlying reducer.
 *
 * The essential undo metadata will be stored next to the modified state in the `undo` section.
 *
 * @param originalReducer - reducer to decorate
 */
export const withUndo = <TState extends UndoEnhancedState, TPayload>(
    originalReducer: UndoableReducer<TState, TPayload>,
): UndoEnabledReducer<TState, UndoPayload & TPayload> => {
    const undoable = (state: Draft<TState>, action: PayloadAction<UndoPayload & TPayload>) => {
        const { undo } = action.payload;

        const originalState = original(state) as TState;

        const [nextState, redoPatches, undoPatches] = produceWithPatches(originalState, (draft) => {
            originalReducer(draft, action);
        });

        return produce(nextState, (draft) => {
            draft._undo.undoPointer++;
            draft._undo.undoStack.push({
                cmd: undo.cmd,
                redoPatches,
                undoPatches,
            });
        });
    };

    /*
     * TODO: Getting this error, struggling to type things correctly so the shortcut.
     *
     * 'WritableDraft<UndoEnhancedState>' is assignable to the constraint of type 'TState', but 'TState' could be
     * instantiated with a different subtype of constraint 'UndoEnhancedState'.
     */
    return undoable as any;
};
