// (C) 2021-2025 GoodData Corporation

import { IDashboardLayout, ScreenSize } from "@gooddata/sdk-model";

import { DashboardLayoutCommands } from "../../../commands/index.js";
import { ExtendedDashboardItem, ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { InitialUndoState, UndoEnhancedState } from "../../_infra/undoEnhancer.js";

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
    screen: ScreenSize | undefined;
}

export const layoutInitialState: LayoutState = {
    layout: undefined,
    stash: {},
    screen: undefined,
    ...InitialUndoState,
};
