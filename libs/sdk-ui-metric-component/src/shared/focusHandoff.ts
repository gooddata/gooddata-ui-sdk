// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

/**
 * Where the focus goes when the metric editor is minimized into the chip, or restored from it.
 *
 * @remarks
 * Minimizing unmounts the editor and mounts the chip, restoring the other way round; the focus is
 * dropped to the page either way. The side that unmounts records that it held the focus, and the
 * side that mounts takes the record and catches the focus. Without a record the mounting side leaves
 * the focus alone, so a chip or an editor that appears for any other reason never takes it.
 *
 * The record belongs to one editor instance (one `MultipleMetricsState`), so the chip of another
 * editor never takes it, and the side that made it cancels it when the transition did not happen.
 */
export type FocusHandoffTarget = "chip" | "editor";

export interface IFocusHandoff {
    handOff(target: FocusHandoffTarget): void;
    /**
     * True once after `handOff(target)`, false otherwise; the record is gone after it.
     */
    take(target: FocusHandoffTarget): boolean;
    cancel(target: FocusHandoffTarget): void;
}

export function createFocusHandoff(): IFocusHandoff {
    let pending: FocusHandoffTarget | null = null;

    return {
        handOff: (target) => {
            pending = target;
        },
        take: (target) => {
            if (pending !== target) {
                return false;
            }
            pending = null;
            return true;
        },
        cancel: (target) => {
            if (pending === target) {
                pending = null;
            }
        },
    };
}

/**
 * The handoff of the editor instance around; null outside one, where the focus is never moved.
 */
export const FocusHandoffContext = createContext<IFocusHandoff | null>(null);

export function useFocusHandoff(): IFocusHandoff | null {
    return useContext(FocusHandoffContext);
}

/**
 * Runs the transition and cancels the record if, a task later, the side that made it is still
 * mounted: the transition did not happen, and nothing is coming to take the record.
 */
export function handOffFocusDuring(
    handoff: IFocusHandoff | null,
    target: FocusHandoffTarget,
    isFocusHeld: boolean,
    transition: (() => void) | undefined,
    isStillMounted: () => boolean,
): void {
    if (handoff && isFocusHeld) {
        handoff.handOff(target);
        window.setTimeout(() => {
            if (isStillMounted()) {
                handoff.cancel(target);
            }
        }, 0);
    }
    transition?.();
}
