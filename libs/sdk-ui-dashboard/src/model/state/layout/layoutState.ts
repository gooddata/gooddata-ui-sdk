// (C) 2021 GoodData Corporation

import { IDashboardLayout, IDashboardLayoutItem } from "@gooddata/sdk-backend-spi";
import { InitialUndoState, UndoEnhancedState } from "../_infra/undoEnhancer";
import { ExtendedDashboardWidget } from "../../types/layoutTypes";

/**
 * @internal
 */
export type LayoutStash = Record<string, IDashboardLayoutItem<ExtendedDashboardWidget>[]>;

/**
 * @internal
 */
export interface LayoutState extends UndoEnhancedState {
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
    stash: LayoutStash;
}

export const layoutInitialState: LayoutState = {
    layout: undefined,
    stash: {},
    ...InitialUndoState,
};
