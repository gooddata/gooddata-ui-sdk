// (C) 2026 GoodData Corporation

import { useEffect, useRef } from "react";

/**
 * Warns once per violation kind per mount when a dialog context decorator breaks the decorator
 * contract in a way that otherwise fails silently and far from its cause: forcing `isLoading`
 * false while the connector still reports true (the state model seeds from the decorated value,
 * corrupting the draft for the dialog's life), or dropping keys the connector provided (a fresh
 * object instead of spreading the read value). Diagnostic only — nothing is prevented.
 *
 * The passthrough default re-renders the connector's own provider value, so `pristine` and
 * `decorated` are identical and the checks short-circuit.
 *
 * @internal
 */
export function useDecoratorContractCheck<T extends { isLoading: boolean }>(
    pristine: T,
    decorated: T,
    seamName: string,
): void {
    const warnedForcedFalse = useRef(false);
    const warnedDroppedKeys = useRef(false);

    useEffect(() => {
        if (pristine === decorated) {
            return;
        }
        if (!warnedForcedFalse.current && pristine.isLoading && !decorated.isLoading) {
            warnedForcedFalse.current = true;
            console.warn(
                `${seamName}: the decorated context reports isLoading: false while the connector reports true. ` +
                    "The dialog's state model seeds from the decorated value, so this can corrupt the draft for " +
                    "the dialog's life. Pass isLoading through untouched (see the decorator type's TSDoc).",
            );
        }
        if (!warnedDroppedKeys.current) {
            const droppedKeys = Object.keys(pristine).filter((key) => !(key in decorated));
            if (droppedKeys.length > 0) {
                warnedDroppedKeys.current = true;
                console.warn(
                    `${seamName}: the decorated context is missing keys the connector provided: ` +
                        `${droppedKeys.join(", ")}. Spread the value you read ({ ...ctx, member }) so the ` +
                        "other members pass through (see the decorator type's TSDoc).",
                );
            }
        }
    });
}
