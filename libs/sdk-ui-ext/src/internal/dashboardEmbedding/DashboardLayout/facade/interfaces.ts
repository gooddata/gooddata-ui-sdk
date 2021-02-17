// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayoutFacade,
    IFluidLayoutRowsFacade,
    IFluidLayoutColumnsFacade,
    IFluidLayoutColumnFacade,
    IWidget,
    IWidgetDefinition,
    IInsightWidget,
    IInsightWidgetDefinition,
    IKpiWidget,
    IKpiWidgetDefinition,
    IDashboardLayoutContent,
    IFluidLayoutRowFacade,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    IDashboardViewLayout,
    IDashboardViewLayoutRow,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutContent,
} from "../interfaces/dashboardLayout";

/**
 * @alpha
 */
export interface IDashboardViewLayoutColumnFacade<TContent>
    extends IFluidLayoutColumnFacade<TContent, IDashboardViewLayoutColumn<TContent>> {
    hasWidgetContent(): this is IDashboardViewLayoutColumnFacade<IWidget>;
    hasWidgetDefinitionContent(): this is IDashboardViewLayoutColumnFacade<IWidgetDefinition>;
    hasKpiWidgetContent(): this is IDashboardViewLayoutColumnFacade<IKpiWidget>;
    hasKpiWidgetDefinitionContent(): this is IDashboardViewLayoutColumnFacade<IKpiWidgetDefinition>;
    hasInsightWidgetContent(): this is IDashboardViewLayoutColumnFacade<IInsightWidget>;
    hasInsightWidgetDefinitionContent(): this is IDashboardViewLayoutColumnFacade<IInsightWidgetDefinition>;
    hasLayoutContent(): this is IDashboardViewLayoutColumnFacade<IDashboardViewLayout<TContent>>;
    hasCustomContent(): this is IDashboardViewLayoutColumnFacade<
        Exclude<IDashboardViewLayoutContent<TContent>, IDashboardLayoutContent>
    >;
    hasWidgetWithRef(ref: ObjRef): boolean;
    hasWidgetWithInsightRef(ref: ObjRef): boolean;
    hasWidgetWithKpiRef(ref: ObjRef): boolean;

    // Overrides
    row(): IDashboardViewLayoutRowFacade<TContent>;
}

/**
 * @alpha
 */
export type IDashboardViewLayoutColumnsFacade<TContent> = IFluidLayoutColumnsFacade<
    TContent,
    IDashboardViewLayoutColumn<TContent>,
    IDashboardViewLayoutColumnFacade<TContent>
>;

/**
 * @alpha
 */
export interface IDashboardViewLayoutRowFacade<TContent>
    extends IFluidLayoutRowFacade<TContent, IDashboardViewLayoutRow<TContent>> {
    // overrides
    columns(): IDashboardViewLayoutColumnsFacade<TContent>;
    layout(): IDashboardViewLayoutFacade<TContent>;
}

/**
 * @alpha
 */
export type IDashboardViewLayoutRowsFacade<TContent> = IFluidLayoutRowsFacade<
    TContent,
    IDashboardViewLayoutRow<TContent>,
    IDashboardViewLayoutRowFacade<TContent>
>;

/**
 * @alpha
 */
export interface IDashboardViewLayoutFacade<TContent>
    extends IFluidLayoutFacade<TContent, IDashboardViewLayout<TContent>> {
    // overrides
    rows(): IDashboardViewLayoutRowsFacade<TContent>;
}
