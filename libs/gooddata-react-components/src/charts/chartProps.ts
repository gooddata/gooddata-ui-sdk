// (C) 2019 GoodData Corporation
import { IAnalyticalBackend, IDataView, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import noop from "lodash/noop";
import * as React from "react";
import { IErrorProps } from "../base/simple/ErrorComponent";
import { ILoadingProps } from "../base/simple/LoadingComponent";
import { ChartType, ErrorComponent, IDrillableItem, IPushData, LoadingComponent } from "../index";
import { INewChartConfig } from "../interfaces/Config";
import {
    OnError,
    OnExportReady,
    OnFiredDrillEvent2,
    OnLegendReady,
    OnLoadingChanged,
    OnLoadingFinish,
} from "../interfaces/Events";
import { IHeaderPredicate2 } from "../interfaces/HeaderPredicate";
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
    // TODO: SDK8: document change from sdk => backend; make this optional auto-retrieve from some global location
    backend: IAnalyticalBackend;
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
    config?: INewChartConfig;
}

export interface IEvents {
    onError?: OnError;
    onExportReady?: OnExportReady;
    onLoadingChanged?: OnLoadingChanged;
    onLoadingFinish?: OnLoadingFinish;
    onFiredDrillEvent?: OnFiredDrillEvent2;
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
// Base chart props
//

export interface IChartProps extends ICommonVisualizationProps, IExecutableVisualizationProps {
    config?: INewChartConfig;
    height?: number;
    environment?: string;
}

export interface IBaseChartProps extends IChartProps {
    type: ChartType;
    visualizationComponent?: React.ComponentClass<any>; // for testing
    onLegendReady?: OnLegendReady;
}

//
//
//

const defaultErrorHandler = (error: any) => {
    // if error was not placed in object, we couldnt see its properties in console (ie cause, responseText etc.)
    console.error("Error in execution:", { error }); // tslint:disable-line no-console
};

export const defaultCommonVisProps: Partial<ICommonVisualizationProps & IExecutableVisualizationProps> = {
    execution: undefined,
    onError: defaultErrorHandler,
    onLoadingChanged: noop,
    ErrorComponent,
    LoadingComponent,
    afterRender: noop,
    pushData: noop,
    locale: "en-US",
    drillableItems: [],
    onExportReady: noop,
    onFiredDrillEvent: () => true,
};
