// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend, IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import {
    IErrorProps,
    ILoadingProps,
    IPushData,
    OnError,
    OnExportReady,
    OnLoadingChanged,
} from "@gooddata/sdk-ui";
import {
    OnDrillDownSuccess,
    OnDrillToAttributeUrlSuccess,
    OnDrillToCustomUrlSuccess,
    OnDrillToDashboardSuccess,
    OnDrillToInsightSuccess,
    OnWidgetDrill,
} from "../../drill/types";

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomDashboardInsightComponent = ComponentType;

///
/// Component props
///

/**
 * @internal
 */
export interface IDashboardInsightProps {
    widget: IInsightWidget;
    insight: IInsight;

    clientHeight?: number;
    clientWidth?: number;

    backend?: IAnalyticalBackend;
    workspace?: string;

    onDrill?: OnWidgetDrill;
    onDrillDown?: OnDrillDownSuccess;
    onDrillToInsight?: OnDrillToInsightSuccess;
    onDrillToDashboard?: OnDrillToDashboardSuccess;
    onDrillToAttributeUrl?: OnDrillToAttributeUrlSuccess;
    onDrillToCustomUrl?: OnDrillToCustomUrlSuccess;

    onError?: OnError;
    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    pushData?: (data: IPushData) => void;

    ErrorComponent?: ComponentType<IErrorProps>;
    LoadingComponent?: ComponentType<ILoadingProps>;
}
