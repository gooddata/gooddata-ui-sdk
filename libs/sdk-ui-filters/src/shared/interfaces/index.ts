// (C) 2023 GoodData Corporation
import { IAlignPoint } from "@gooddata/sdk-ui-kit";

/**
 * Represents the visibility mode of a filter.
 *
 * @remarks
 * The visibility mode can have one of the following values:
 * - "active": The filter is in its default visible state.
 * - "hidden": The filter is intentionally hidden and not displayed.
 * - "readonly": The filter is locked in its current state and cannot be modified.
 *
 * @public
 */
export type VisibilityMode = "readonly" | "hidden" | "active";

/**
 * Represents a custom icon with associated tooltip information.
 *
 * @alpha
 */
export interface IFilterButtonCustomIcon {
    /**
     * The icon to be displayed.
     */
    icon: string;

    /**
     * The tooltip text to be shown when the icon is hovered over.
     */
    tooltip: string;

    /**
     * Optional class names to style a bubble associated with the icon.
     */
    bubbleClassNames?: string;

    /**
     * Optional alignment points for positioning the bubble associated with the icon.
     */
    bubbleAlignPoints?: IAlignPoint[];
}
