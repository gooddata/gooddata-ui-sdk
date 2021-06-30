// (C) 2020-2021 GoodData Corporation
import React from "react";
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
} from "../drill/interfaces";

/**
 * @internal
 */
export interface DashboardInsightProps {
    widget: IInsightWidget;
    insight: IInsight;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: FilterContextItem[];
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnDashboardDrill;
    onDrillDown?: OnDrillDown;
    onDrillToInsight?: OnDrillToInsight;
    onDrillToDashboard?: OnDrillToDashboard;
    onDrillToAttributeUrl?: OnDrillToAttributeUrl;
    onDrillToCustomUrl?: OnDrillToCustomUrl;
    disableWidgetImplicitDrills?: boolean;
    onError?: OnError;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    clientHeight?: number;
}
