// (C) 2021 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import { InitialUndoState, UndoEnhancedState } from "../_infra/undoEnhancer";
import { ExtendedDashboardWidget } from "../../types/layoutTypes";

/**
 * @internal
 */
export interface LayoutState extends UndoEnhancedState {
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
}

export const layoutInitialState: LayoutState = {
    layout: undefined,
    ...InitialUndoState,
};
