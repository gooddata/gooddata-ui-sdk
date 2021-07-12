// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { FilterContextItem, IAnalyticalBackend, IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import { IDrillableItem, IErrorProps, IHeaderPredicate, ILoadingProps, OnError } from "@gooddata/sdk-ui";
import {
    OnDashboardDrill,
    OnDrillDown,
    OnDrillToAttributeUrl,
    OnDrillToCustomUrl,
    OnDrillToDashboard,
    OnDrillToInsight,
} from "../../drill/types";

///
/// Core props
///

/**
 * The necessary props a component must be able to handle for it to be usable as a DashboardInsight.
 * @internal
 */
export interface IDashboardInsightCoreProps {
    widget: IInsightWidget;
    insight: IInsight;
    clientHeight?: number;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnDashboardDrill;
    onError?: OnError;
}

///
/// Custom component types
///

/**
 * @internal
 */
export type CustomDashboardInsightComponent = ComponentType<IDashboardInsightCoreProps>;

///
/// Default component props
///

/**
 * Props of the default DashboardInsight implementation: {@link DefaultDashboardInsight}.
 * @internal
 */
export interface IDefaultDashboardInsightProps extends IDashboardInsightCoreProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    onDrillDown?: OnDrillDown;
    onDrillToInsight?: OnDrillToInsight;
    onDrillToDashboard?: OnDrillToDashboard;
    onDrillToAttributeUrl?: OnDrillToAttributeUrl;
    onDrillToCustomUrl?: OnDrillToCustomUrl;
    disableWidgetImplicitDrills?: boolean;
    ErrorComponent?: ComponentType<IErrorProps>;
    LoadingComponent?: ComponentType<ILoadingProps>;
}
