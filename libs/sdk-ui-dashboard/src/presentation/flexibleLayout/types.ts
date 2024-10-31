// (C) 2020-2024 GoodData Corporation
import { ComponentType } from "react";
import { IErrorProps, OnError } from "@gooddata/sdk-ui";
import {
    FilterContextItem,
    IDashboardLayout,
    ScreenSize,
    IDashboardLayoutSizeByScreenSize,
} from "@gooddata/sdk-model";

import { IDashboardFilter, OnFiredDashboardDrillEvent } from "../../types.js";
import { ExtendedDashboardWidget } from "../../model/index.js";

/**
 * @alpha
 */
export interface IDashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: is this necessary? (there are events for it)
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;
    onDrill?: OnFiredDashboardDrillEvent;
    onError?: OnError;
    // if not provided, root layout from appState will be used
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
    // if not provided, the layout size will be detected
    screen?: ScreenSize;
    // if not provided, the layout size will be considered to be default (12 columns)
    parentLayoutItemSize?: IDashboardLayoutSizeByScreenSize;
}

/**
 * @alpha
 */
export type CustomDashboardLayoutComponent = ComponentType<IDashboardLayoutProps>;

/**
 * @internal
 */
export type CustomEmptyLayoutDropZoneBodyComponent = ComponentType;
