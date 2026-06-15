// (C) 2026 GoodData Corporation

import { bem } from "../@utils/bem.js";
import { type IUiFloatingElementProps } from "../UiFloatingElement/types.js";
import { UiFloatingElement } from "../UiFloatingElement/UiFloatingElement.js";

const { b } = bem("gd-ui-kit-floating-panel");

/**
 * - `"none"` — content owns its own padding.
 * - `"listbox"` — `4px 0` so listbox-style popups breathe at top/bottom.
 *
 * @internal
 */
export type UiFloatingPanelPadding = "none" | "listbox";

/**
 * Props passed through to `UiFloatingElement`. The `Omit` narrows the surface
 * away from props the canonical panel chrome owns or doesn't want callers to
 * tune (`className` / `contentClassName` — chrome is bundled; positioning
 * knobs reserved for low-level use).
 *
 * @internal
 */
export interface IUiFloatingPanelProps extends Omit<
    IUiFloatingElementProps,
    | "className"
    | "contentClassName"
    | "strategy"
    | "autoFlip"
    | "maxWidth"
    | "maxHeight"
    | "onPlacementChange"
> {
    /** Vertical padding bundled with the panel chrome. Defaults to `"none"`. */
    padding?: UiFloatingPanelPadding;
}

/**
 * `UiFloatingElement` plus the kit's canonical popup chrome (background,
 * border-radius, shadow). Shared surface for dropdowns, comboboxes, pickers.
 *
 * @internal
 */
export function UiFloatingPanel({ children, padding = "none", ...rest }: IUiFloatingPanelProps) {
    return (
        <UiFloatingElement {...rest}>
            <div className={b({ padding })}>{children}</div>
        </UiFloatingElement>
    );
}
