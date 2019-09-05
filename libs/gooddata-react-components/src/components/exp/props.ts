// (C) 2019 GoodData Corporation
import { IAnalyticalBackend, IDataView, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import * as React from "react";
import { IChartConfig, IDrillableItem, IPushData } from "../..";
import {
    OnError,
    OnExportReady,
    OnFiredDrillEvent,
    OnLoadingChanged,
    OnLoadingFinish,
} from "../../interfaces/Events";
import { IHeaderPredicate2 } from "../../interfaces/HeaderPredicate";
import { IErrorProps } from "../simple/ErrorComponent";
import { ILoadingProps } from "../simple/LoadingComponent";
import InjectedIntl = ReactIntl.InjectedIntl;

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
    drillableItems?: Array<IDrillableItem | IHeaderPredicate2>;
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

export interface IExecutableVisualizationProps {
    execution: IPreparedExecution;
}

export interface ILoadingInjectedProps {
    dataView: IDataView;
    error?: string;
    isLoading: boolean;
    intl: InjectedIntl;
    onDataTooLarge(): void;
    onNegativeValues(): void;
}

//
//
//
