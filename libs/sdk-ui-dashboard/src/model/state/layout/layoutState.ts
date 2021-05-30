// (C) 2021 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface LayoutState {
    // TODO: modify definition to use ExtendedDashboardWidget.. this will open editing use-cases
    layout?: IDashboardLayout;
}

export const layoutInitialState = { layout: undefined } as LayoutState;
