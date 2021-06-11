// (C) 2021 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import { InitialUndoState, UndoEnhancedState } from "../_infra/undoEnhancer";
import { ExtendedDashboardItem, ExtendedDashboardWidget } from "../../types/layoutTypes";
import { DashboardLayoutCommands } from "../../commands";

/**
 * @internal
 */
export type LayoutStash = Record<string, ExtendedDashboardItem[]>;

/**
 * @internal
 */
export interface LayoutState extends UndoEnhancedState<DashboardLayoutCommands> {
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
    stash: LayoutStash;
}

export const layoutInitialState: LayoutState = {
    layout: undefined,
    stash: {},
    ...InitialUndoState,
};
