// (C) 2019 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import * as React from "react";
import { IChartConfig, IDrillableItem, IHeaderPredicate, IPushData } from "../..";
import {
    OnError,
    OnExportReady,
    OnFiredDrillEvent,
    OnLoadingChanged,
    OnLoadingFinish,
} from "../../interfaces/Events";
import { IErrorProps } from "../simple/ErrorComponent";
import { ILoadingProps } from "../simple/LoadingComponent";

//
// Prop types extended by the bucket components
//

export interface ICommonChartProps extends ICommonVisualizationProps {
    workspace: string;
    height?: number;
    environment?: string;
}

export interface ICommonVisualizationProps extends IEvents {
    // TODO: SDK8: document change from sdk => backend
    backend?: IAnalyticalBackend;
    // TODO: SDK8: document change from project => workspace
    workspace?: string;
    locale?: string;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    // TODO: SDK8: rename & move: possibly include in IEvents
    afterRender?: () => void;
    // TODO: SDK8: rename+move or remove; probably remove, address the need differently
    pushData?: (data: IPushData) => void;
    // TODO: SDK8: possibly encapsulate in a separate object?
    ErrorComponent?: React.ComponentType<IErrorProps>;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    config?: IChartConfig;
}

export interface IEvents {
    onError?: OnError;
    onExportReady?: OnExportReady;
    onLoadingChanged?: OnLoadingChanged;
    onLoadingFinish?: OnLoadingFinish;
    onFiredDrillEvent?: OnFiredDrillEvent;
}

//
//
//
