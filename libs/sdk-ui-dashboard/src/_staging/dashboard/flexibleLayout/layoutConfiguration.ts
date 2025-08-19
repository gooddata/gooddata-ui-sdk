// (C) 2024-2025 GoodData Corporation

import { IDashboardLayout, IDashboardLayoutContainerDirection, isDashboardLayout } from "@gooddata/sdk-model";

import { IDashboardLayoutItemFacade } from "./facade/interfaces.js";
import { ExtendedDashboardWidget } from "../../../model/types/layoutTypes.js";
import { ILayoutItemPath } from "../../../types.js";
import { findItem } from "../../layout/coordinates.js";

/**
 * Returns configuration of the provided layout. The function returns the default configuration when
 * the layout does not have it specified.
 *
 * @param layout - layout for which we want to get the configuration.
 */
export function getLayoutConfiguration(layout: IDashboardLayout<ExtendedDashboardWidget | unknown>) {
    // backward compatibility, assume the container direction is set to "row" when not set
    const direction = layout.configuration?.direction ?? "row";
    const sectionsConfiguration = layout.configuration?.sections;
    // backward compatibility, assume header is enabled when configuration is not set on the layout
    const enableHeader = sectionsConfiguration?.enableHeader ?? true;
    return {
        direction,
        sections: {
            areHeadersEnabled: enableHeader,
        },
    };
}

/**
 * Determines the direction of a container in a dashboard layout based on the provided layout configuration
 * and item path. The direction specifies whether child items within the container are laid out in a row
 * or column.
 *
 * @param layout - The dashboard layout containing the structure and configuration of widgets and containers.
 * @param itemPath - The path to a specific layout item within the dashboard layout structure.
 *  If undefined, the function assumes a default "row" direction.
 *
 * @returns The direction of the container ("row" or "column").
 */
export const getContainerDirectionAtPath = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    itemPath: ILayoutItemPath | undefined,
): IDashboardLayoutContainerDirection => {
    if (itemPath === undefined) {
        return "row"; // compatibility with the old layout or when there is no parent
    }
    const parent = findItem(layout, itemPath);
    if (!isDashboardLayout(parent.widget)) {
        return "row"; // return row in the case when we are not resizing a layout
    }
    return getLayoutConfiguration(parent.widget).direction;
};

/**
 * Determines the direction of a container in a dashboard layout based on the provided layout.
 * The direction specifies whether child items within the container are laid out in a row or column.
 *
 * @param layout - The dashboard layout containing the structure and configuration of widgets and containers.
 *
 * @returns The direction of the container ("row" or "column").
 */
export const getContainerDirection = (
    layout: IDashboardLayoutItemFacade<ExtendedDashboardWidget> | undefined,
): IDashboardLayoutContainerDirection => {
    if (layout === undefined) {
        return "row";
    }
    const widget = layout.raw().widget;
    if (widget === undefined || !isDashboardLayout(widget)) {
        return "row";
    }
    return getLayoutConfiguration(widget).direction;
};
