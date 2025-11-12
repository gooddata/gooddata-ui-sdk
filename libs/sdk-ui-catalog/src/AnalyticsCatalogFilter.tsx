// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { StaticFilter } from "./filter/StaticFilter.js";

/**
 * Props for {@link AnalyticsCatalogFilter}.
 * @internal
 */
export interface IAnalyticsCatalogFilterProps<T> {
    /**
     * Test id applied to the root element for automation.
     */
    dataTestId: string;
    /**
     * Label shown on the trigger button and header.
     */
    label: string;
    /**
     * All selectable options.
     */
    options: T[];
    /**
     * Currently selected options (empty means none when not inverted).
     */
    selection: T[];
    /**
     * Whether the selection is inverted.
     */
    isSelectionInverted: boolean;
    /**
     * Called when selection changes and user confirms.
     */
    onSelectionChange: (selection: T[], isInverted: boolean) => void;
    /**
     * Derives unique key for option items. Defaults to string coercion.
     */
    getItemKey?: (item: T) => string;
    /**
     * Derives display title for option items. Defaults to string coercion.
     */
    getItemTitle?: (item: T) => string;
    /**
     * Message rendered when there are no items to display.
     */
    noDataMessage?: ReactNode;
    /**
     * Optional status bar content rendered under the list.
     */
    statusBar?: ReactNode;
    /**
     * Optional custom action buttons replacing default Apply/Cancel.
     */
    actions?: ReactNode;
}

/**
 * Public wrapper of the internal static filter used in Analytics Catalog.
 * This component provides a stable, documented API surface for reuse.
 *
 * @internal
 */
export function AnalyticsCatalogFilter<T>(props: IAnalyticsCatalogFilterProps<T>) {
    return <StaticFilter<T> {...props} />;
}
