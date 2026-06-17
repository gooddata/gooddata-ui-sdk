// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import {
    type IUiGranteeAsyncOption,
    type IUiPickedGrantee,
} from "../UiGranteeAsyncPicker/UiGranteeAsyncPicker.js";
import { type PermissionMenuLevel } from "../UiPermissionMenu/UiPermissionMenu.js";

/**
 * @internal
 */
export interface IUseGranteeSelectionOptions {
    /** Current picked list — caller owns the state. */
    selectedGrantees: ReadonlyArray<IUiPickedGrantee>;
    /** Fires with the next list whenever the hook produces a change. */
    onSelectedGranteesChange: (next: IUiPickedGrantee[]) => void;
    /**
     * Permission level used when a grantee is added from the picker.
     * Defaults to `"VIEW"`.
     */
    initialPermissionLevel?: PermissionMenuLevel;
}

/**
 * @internal
 */
export interface IUseGranteeSelectionResult {
    /** Pick a grantee from the picker — no-op if already in the list. */
    select: (option: IUiGranteeAsyncOption) => void;
    /** Change a row's permission level. */
    changePermission: (grantee: IUiPickedGrantee, next: PermissionMenuLevel) => void;
    /** Remove a row. */
    remove: (grantee: IUiPickedGrantee) => void;
}

/**
 * Selection callbacks for the add-grantee dialog. Caller owns the list and
 * receives the next list via `onSelectedGranteesChange`.
 *
 * @internal
 */
export function useGranteeSelection({
    selectedGrantees,
    onSelectedGranteesChange,
    initialPermissionLevel = "VIEW",
}: IUseGranteeSelectionOptions): IUseGranteeSelectionResult {
    const select = useCallback(
        (option: IUiGranteeAsyncOption) => {
            // The picker already filters out picked ids, but a quick double-click
            // can land a second select call before the parent re-renders — guard
            // against the duplicate row here.
            if (selectedGrantees.some((g) => g.id === option.id)) {
                return;
            }
            onSelectedGranteesChange([
                ...selectedGrantees,
                { ...option, permissionLevel: initialPermissionLevel },
            ]);
        },
        [selectedGrantees, onSelectedGranteesChange, initialPermissionLevel],
    );

    const changePermission = useCallback(
        (grantee: IUiPickedGrantee, next: PermissionMenuLevel) => {
            onSelectedGranteesChange(
                selectedGrantees.map((g) => (g.id === grantee.id ? { ...g, permissionLevel: next } : g)),
            );
        },
        [selectedGrantees, onSelectedGranteesChange],
    );

    const remove = useCallback(
        (grantee: IUiPickedGrantee) => {
            onSelectedGranteesChange(selectedGrantees.filter((g) => g.id !== grantee.id));
        },
        [selectedGrantees, onSelectedGranteesChange],
    );

    return { select, changePermission, remove };
}
