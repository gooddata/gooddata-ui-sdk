// (C) 2026 GoodData Corporation

import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { b } = bem("gd-ui-kit-toolbar-chevron");

/**
 * Popup affordance of the toolbar selects. It rotates instead of swapping the icon, so the flip
 * animates. Decorative: the owning control carries the accessible name and `aria-expanded`.
 */
export function UiToolbarChevron({ isOpen }: { isOpen: boolean }) {
    return (
        <span className={b({ isOpen })}>
            <UiIcon type="navigateDown" size={14} layout="block" accessibilityConfig={{ ariaHidden: true }} />
        </span>
    );
}
