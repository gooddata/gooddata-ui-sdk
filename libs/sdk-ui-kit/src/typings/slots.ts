// (C) 2026 GoodData Corporation

import { type ComponentType } from "react";

/**
 * Contract of a section-level slot: the default implementation and the exact props the host
 * component would render it with.
 *
 * The component a customer assigns to a slot is rendered as an element type, so its reference
 * identity is load-bearing: define it at module scope (or memoize it), never inline in a render
 * function — an inline definition gets a fresh identity on every render of the declaring
 * component, which unmounts and remounts the region, losing focus and transient DOM state.
 *
 * Render `<Default {...defaultProps} />` inside your own markup to wrap the region rather than
 * replace it; a slot that does not spread `defaultProps` onto `Default` loses the default
 * behavior wired through them (including the host's initial-focus ref).
 *
 * @alpha
 */
export interface ISlotProps<TProps> {
    /**
     * The default implementation of the region.
     */
    Default: ComponentType<TProps>;

    /**
     * The exact props the host component would render {@link ISlotProps.Default} with.
     */
    defaultProps: TProps;
}
