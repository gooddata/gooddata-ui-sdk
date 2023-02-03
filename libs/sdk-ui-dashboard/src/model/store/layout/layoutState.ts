// (C) 2021-2023 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-model";
import { InitialUndoState, UndoEnhancedState } from "../_infra/undoEnhancer";
import { ExtendedDashboardItem, ExtendedDashboardWidget } from "../../types/layoutTypes";
import { DashboardLayoutCommands } from "../../commands";

/**
 * @beta
 */
export type LayoutStash = Record<string, ExtendedDashboardItem[]>;

/**
 * @alpha
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
