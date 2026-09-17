// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback, useEffect } from "react";

import { useTotalLabelContext } from "../../context/TotalLabelContext.js";
import { type ITotalLabelTarget } from "../../features/aggregations/totalLabelTarget.js";

export interface IUseTotalLabelHeaderResult {
    /** The custom alias for `totalLabelTarget`, or undefined if there's no target or no alias set. */
    label: string | undefined;
    /**
     * Opens the rename menu; undefined (not wired to the header at all) when there's no target, or
     * when renaming is disabled - otherwise a click would still preventDefault/stopPropagation and
     * then no-op (openTotalLabelMenu's own `enabled` check), silently swallowing the click instead
     * of letting it reach AG Grid's own ancestor listeners.
     * Handles both a direct click and a keyboard Enter/Space event forwarded by the caller's own
     * useHeaderSpaceKey call (`useHeaderSpaceKey(params, onClick ?? handleHeaderClick)`) - there is
     * no separate keydown listener here, since AG Grid only exposes one focusable wrapper element
     * per header and a second independent listener on it can't stop the first from also firing.
     */
    onClick: ((event: MouseEvent<HTMLDivElement> | KeyboardEvent) => void) | undefined;
}

/**
 * Wires up total/subtotal header rename behavior (click-to-open, keyboard Enter/Space via the
 * caller's existing useHeaderSpaceKey, custom alias display, aria-haspopup) shared by
 * PivotGroupHeader and MeasureHeader. Whether renaming can actually happen (`totalLabelsEditable`)
 * is decided solely by TotalLabelContext's own openTotalLabelMenu - callers don't duplicate that
 * business rule. `enabled` is read here only to decide whether to wire up the click/aria affordances
 * at all, so a disabled header doesn't swallow clicks meant for AG Grid's own ancestor listeners.
 *
 * @internal
 */
export function useTotalLabelHeader(
    eGridHeader: HTMLElement,
    totalLabelTarget: ITotalLabelTarget | undefined,
): IUseTotalLabelHeaderResult {
    const { enabled, openTotalLabelMenu, getCustomTotalLabel } = useTotalLabelContext();
    const hasTarget = totalLabelTarget !== undefined;

    useEffect(() => {
        if (!eGridHeader || !enabled || !hasTarget) {
            return;
        }

        // AG Grid owns this element and may already carry its own aria-haspopup for reasons unrelated
        // to total-label renaming - preserve and restore it instead of clobbering it on cleanup.
        const previousAriaHasPopup = eGridHeader.getAttribute("aria-haspopup");
        eGridHeader.setAttribute("aria-haspopup", "menu");
        return () => {
            if (previousAriaHasPopup === null) {
                eGridHeader.removeAttribute("aria-haspopup");
            } else {
                eGridHeader.setAttribute("aria-haspopup", previousAriaHasPopup);
            }
        };
    }, [eGridHeader, enabled, hasTarget]);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement> | KeyboardEvent) => {
            if (!totalLabelTarget) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            openTotalLabelMenu({ ...totalLabelTarget, anchor: eGridHeader });
        },
        [openTotalLabelMenu, eGridHeader, totalLabelTarget],
    );

    return {
        label: getCustomTotalLabel(totalLabelTarget),
        // Gated the same way the aria-haspopup effect above is - a header with nothing to open
        // should not be wired to swallow clicks at all.
        onClick: enabled && totalLabelTarget ? handleClick : undefined,
    };
}
