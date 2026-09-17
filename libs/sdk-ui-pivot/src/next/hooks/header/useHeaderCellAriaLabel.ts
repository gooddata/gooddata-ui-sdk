// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef } from "react";

/**
 * Sets an ARIA label on AG Grid's header element for screen reader accessibility.
 *
 * AG Grid's header wrapper (eGridHeader) is the element that receives keyboard focus,
 * so ARIA attributes must be set there rather than on the custom header component's div.
 *
 * A falsy ariaLabel is a no-op UNLESS this hook has previously set an explicit label on this same
 * element (e.g. a pivot group header whose renamed total was then reset) - only then does it fall
 * back to defaultAriaLabel (or remove the attribute if none is given). This hook must never touch
 * an element it has not itself labelled: this component's own visible header text is aria-hidden,
 * so removing a label we didn't set (on a header that was never renamed) could leave the element
 * with no accessible name at all instead of whatever accessible name it already had.
 *
 * @param eGridHeader - AG Grid's header element that receives focus
 * @param ariaLabel - The ARIA label to set, or a falsy value to fall back to defaultAriaLabel
 * @param defaultAriaLabel - Label to fall back to once this hook has taken over labelling this
 * element and ariaLabel later becomes falsy again; the attribute is removed if this is also falsy
 *
 * @internal
 */
export function useHeaderCellAriaLabel(
    eGridHeader: HTMLElement | undefined,
    ariaLabel: string | undefined,
    defaultAriaLabel?: string,
): void {
    const hasManagedLabel = useRef(false);

    useEffect(() => {
        if (!eGridHeader) {
            return;
        }

        if (ariaLabel) {
            eGridHeader.setAttribute("aria-label", ariaLabel);
            hasManagedLabel.current = true;
            return;
        }

        if (!hasManagedLabel.current) {
            return;
        }

        if (defaultAriaLabel) {
            eGridHeader.setAttribute("aria-label", defaultAriaLabel);
        } else {
            eGridHeader.removeAttribute("aria-label");
        }
    }, [eGridHeader, ariaLabel, defaultAriaLabel]);
}
