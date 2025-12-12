// (C) 2021-2025 GoodData Corporation

import { type IDashboardLayout, type ScreenSize } from "@gooddata/sdk-model";

import { type DashboardLayoutCommands } from "../../../commands/index.js";
import { type ExtendedDashboardItem, type ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { InitialUndoState, type UndoEnhancedState } from "../../_infra/undoEnhancer.js";

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
