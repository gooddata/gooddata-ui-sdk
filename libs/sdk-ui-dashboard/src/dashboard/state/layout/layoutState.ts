// (C) 2021 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface LayoutState {
    layout?: IDashboardLayout;
}

export const layoutInitialState = { layout: undefined } as LayoutState;
