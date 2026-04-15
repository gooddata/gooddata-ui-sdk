// (C) 2025-2026 GoodData Corporation

import type { ICatalogItem } from "../catalogItem/types.js";

/**
 * @internal
 */
export type OpenHandlerEvent = {
    /**
     * Catalog item to open.
     */
    item: ICatalogItem;
    /**
     * Workspace ID.
     */
    workspaceId: string;
    /**
     * Whether to open the catalog item in a new tab.
     */
    newTab: boolean;
    /**
     * Prevents the default action.
     */
    preventDefault: () => void;
};

/**
 * @internal
 */
export type EditHandlerEvent = OpenHandlerEvent;

/**
 * Generic detail drawer action definition.
 * @internal
 */
export interface ICatalogDetailAction {
    id: string;
    label: string;
    isDestructive?: boolean;
    dataTestId?: string;
}
