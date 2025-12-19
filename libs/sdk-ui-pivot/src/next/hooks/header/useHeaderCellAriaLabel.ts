// (C) 2025 GoodData Corporation

import { useEffect } from "react";

/**
 * Sets an ARIA label on AG Grid's header element for screen reader accessibility.
 *
 * AG Grid's header wrapper (eGridHeader) is the element that receives keyboard focus,
 * so ARIA attributes must be set there rather than on the custom header component's div.
 *
 * @param eGridHeader - AG Grid's header element that receives focus
 * @param ariaLabel - The ARIA label to set, or undefined to skip
 *
 * @internal
 */
export function useHeaderCellAriaLabel(
    eGridHeader: HTMLElement | undefined,
    ariaLabel: string | undefined,
): void {
    useEffect(() => {
        if (eGridHeader && ariaLabel) {
            eGridHeader.setAttribute("aria-label", ariaLabel);
        }
    }, [eGridHeader, ariaLabel]);
}
