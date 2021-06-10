// (C) 2021 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import { InitialUndoState, UndoEnhancedState } from "../_infra/undoEnhancer";

/**
 * @internal
 */
export interface LayoutState extends UndoEnhancedState {
    // TODO: modify definition to use ExtendedDashboardWidget.. this will open editing use-cases
    layout?: IDashboardLayout;
}

export const layoutInitialState: LayoutState = {
    layout: undefined,
    ...InitialUndoState,
};
