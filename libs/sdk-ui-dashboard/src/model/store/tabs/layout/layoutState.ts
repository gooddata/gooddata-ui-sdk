// (C) 2021-2026 GoodData Corporation

import { type IDashboardLayout, type ScreenSize } from "@gooddata/sdk-model";

import { type DashboardLayoutCommands } from "../../../commands/layout.js";
import { type ExtendedDashboardItem, type ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { type IUndoEnhancedState, InitialUndoState } from "../../_infra/undoEnhancer.js";

/**
 * @beta
 */
export type LayoutStash = Record<string, ExtendedDashboardItem[]>;

/**
 * @alpha
 */
export interface ILayoutState extends IUndoEnhancedState<DashboardLayoutCommands> {
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
    stash: LayoutStash;
    screen: ScreenSize | undefined;
}

export const layoutInitialState: ILayoutState = {
    layout: undefined,
    stash: {},
    screen: undefined,
    ...InitialUndoState,
};
