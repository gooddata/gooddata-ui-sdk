// (C) 2025 GoodData Corporation

import { ComponentPropsWithRef, forwardRef } from "react";

import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-button-segmented-control");

/**
 * @internal
 */
export type UiButtonSegmentedControlProps = Omit<
    ComponentPropsWithRef<"div">,
    "className" // Intentionally omitted
>;

/**
 * A presentational container that visually groups multiple {@link UiButton} or {@link UiIconButton} components as a segmented control.
 * This component does not manage selection state or logic, it is intended solely for layout and styling purposes.
 *
 * @example
 * ```
 * <UiButtonSegmentedControl>
 *     <UiButton label="Option 1" />
 *     <UiButton label="Option 2" />
 *     <UiButton label="Option 3" />
 * </UiButtonSegmentedControl>
 * ```
 *
 * @internal
 */
export const UiButtonSegmentedControl = forwardRef<HTMLDivElement, UiButtonSegmentedControlProps>(
    function UiButtonSegmentedControl({ children, ...htmlProps }, ref) {
        return (
            <div ref={ref} className={b()} {...htmlProps}>
                {children}
            </div>
        );
    },
);
