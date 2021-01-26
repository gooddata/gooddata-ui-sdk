// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IDashboardLayoutContent,
} from "@gooddata/sdk-backend-spi";

/**
 * Dashboard layout content can be customized from the outside
 *
 * @alpha
 */
export type IDashboardViewLayoutContent<TCustomContent = IDashboardLayoutContent> =
    | IDashboardLayoutContent
    | TCustomContent;

/**
 * Dashboard layout column definition.
 *
 * @alpha
 */
export type IDashboardViewLayoutColumn<
    TCustomContent = IDashboardViewLayoutContent<any>
> = IFluidLayoutColumn<TCustomContent>;

/**
 * Dashboard layout row definition.
 *
 * @alpha
 */
export type IDashboardViewLayoutRow<
    TCustomContent = IDashboardViewLayoutContent<IDashboardLayoutContent>
> = IFluidLayoutRow<TCustomContent>;

/**
 * Dashboard layout definition.
 *
 * @alpha
 */
export type IDashboardViewLayout<
    TCustomContent = IDashboardViewLayoutContent<IDashboardLayoutContent>
> = IFluidLayout<TCustomContent>;
