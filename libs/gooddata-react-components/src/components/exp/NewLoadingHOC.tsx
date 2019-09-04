// (C) 2019 GoodData Corporation
/*
import * as React from "react";
import { IChartConfig } from "../..";
import { convertErrors } from "../../helpers/errorHandlers";
import { ILoadingState } from "../../interfaces/Events";
import { IntlWrapper } from "../core/base/IntlWrapper";
import noop = require("lodash/noop");
import isEqual = require("lodash/isEqual");
import omit = require("lodash/omit");
import { ErrorStates } from "../../constants/errorStates";
import { RuntimeError } from "../../errors/RuntimeError";
import { injectIntl } from "react-intl";
import { IErrorProps } from "../simple/ErrorComponent";
import { ILoadingProps } from "../simple/LoadingComponent";
import { IEvents } from "./BarChart";
import { IHeaderPredicate } from "../../interfaces/HeaderPredicate";
import { IDrillableItem } from "../../interfaces/DrillEvents";
import { IPushData } from "../../interfaces/PushData";
import InjectedIntl = ReactIntl.InjectedIntl;

export type IExecutionDataPromise = Promise<Execution.IExecutionResponses>;

export interface ICommonVisualizationProps extends IEvents {
    sdk?: SDK;
    projectId?: string;
    locale?: string;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    afterRender?: () => void;
    pushData?: (data: IPushData) => void;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    config?: IChartConfig;
}

export interface ILoadingInjectedProps {
    execution: Execution.IExecutionResponses;
    error?: string;
    isLoading: boolean;
    intl: InjectedIntl;
    // if autoExecuteDataSource is false, this callback is passed to the inner component and handles loading
    getPage?: IGetPage;
    onDataTooLarge(): void;
    onNegativeValues(): void;
}

export interface IVisualizationLoadingState {
    error?: string;
    result?: Execution.IExecutionResponses;
    isLoading: boolean;
}

const defaultErrorHandler = (error: any) => {
    // if error was not placed in object, we couldnt see its properties in console (ie cause, responseText etc.)
    console.error("Error in execution:", { error }); // tslint:disable-line no-console
};

export function newLoadingHOC<
    T extends ICommonVisualizationProps & IDataSourceProviderInjectedProps
    >(
    InnerComponent: React.ComponentClass<T & ILoadingInjectedProps>
): React.ComponentClass<T> {
    class LoadingHOCWrapped extends React.Component<T & ILoadingInjectedProps, IVisualizationLoadingState> {
        protected subject: ISubject<IExecutionDataPromise>;
        protected pagePromises: IExecutionDataPromise[];
        protected hasUnmounted: boolean;

        private sdk: SDK;

        constructor(props: T & ILoadingInjectedProps) {
            super(props);

            this.state = {
                isLoading: false,
                result: null,
                error: null,
            };

            this.sdk = props.sdk ? props.sdk.clone() : createSdk();
            setTelemetryHeaders(this.sdk, "LoadingHOCWrapped", props);

            this.pagePromises = [];
            this.hasUnmounted = false;

            this.onLoadingChanged = this.onLoadingChanged.bind(this);
            this.onDataTooLarge = this.onDataTooLarge.bind(this);
            this.onNegativeValues = this.onNegativeValues.bind(this);
            this.getPage = this.getPage.bind(this);
            this.cancelPagePromises = this.cancelPagePromises.bind(this);

            this.initSubject();
        }

        public componentDidMount() {
            const { dataSource, resultSpec } = this.props;

            this.initDataLoading(dataSource, resultSpec);
        }

        public render() {
            const { result, isLoading, error } = this.state;
            const { intl } = this.props;

            // lower-level components do not need projectId
            const props = omit(this.props, ["projectId"]);

            return (
                <InnerComponent
                    key={"InnerComponent"}
                    {...props}
                    execution={result}
                    onDataTooLarge={this.onDataTooLarge}
                    onNegativeValues={this.onNegativeValues}
                    error={error}
                    isLoading={isLoading}
                    intl={intl}
                />
            );
        }

        public isDataReloadRequired(nextProps: Readonly<T & ILoadingInjectedProps>) {
            return (
                !DataLayer.DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource) ||
                !isEqual(this.props.resultSpec, nextProps.resultSpec)
            );
        }

        public componentWillReceiveProps(nextProps: Readonly<T & ILoadingInjectedProps>) {
            if (nextProps.sdk && this.props.sdk !== nextProps.sdk) {
                this.sdk = nextProps.sdk.clone();
                setTelemetryHeaders(this.sdk, "LoadingHOCWrapped", nextProps);
            }

            if (this.isDataReloadRequired(nextProps)) {
                if (autoExecuteDataSource) {
                    const { dataSource, resultSpec } = nextProps;
                    this.initDataLoading(dataSource, resultSpec);
                } else {
                    this.onLoadingChanged({ isLoading: true });
                }
            }
        }

        public componentWillUnmount() {
            this.hasUnmounted = true;
            this.subject.unsubscribe();
            this.onLoadingChanged = noop;
            this.onError = noop;
        }

        private initSubject() {
            this.subject = DataLayer.createSubject<Execution.IExecutionResponses>(
                result => {
                    this.setState({ result });
                    this.props.pushData({ result });
                    this.onLoadingChanged({ isLoading: false });
                    // TODO: SDK8: fire export function
                },
                error => this.onError(error),
            );
        }

        private onLoadingChanged(loadingState: ILoadingState) {
            this.props.onLoadingChanged(loadingState);

            const { isLoading } = loadingState;

            const state: IVisualizationLoadingState = { isLoading };

            if (isLoading) {
                state.error = null;
            }

            this.setState(state);
        }

        private onError(error: RuntimeError, dataSource = this.props.dataSource) {
            if (DataLayer.DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
                this.setState({ error: error.getMessage() });
                this.onLoadingChanged({ isLoading: false });
                // TODO: SDK8: integrate exports. call onExportReady with error function
                this.props.onError(error);
            }
        }

        private onDataTooLarge() {
            this.onError(new RuntimeError(ErrorStates.DATA_TOO_LARGE_TO_DISPLAY));
        }

        private onNegativeValues() {
            this.onError(new RuntimeError(ErrorStates.NEGATIVE_VALUES));
        }

        private initDataLoading(
            dataSource: DataLayer.DataSource.IDataSource<Execution.IExecutionResponses>,
            resultSpec: AFM.IResultSpec,
        ) {
            this.onLoadingChanged({ isLoading: true });
            this.setState({ result: null });

            const promise = dataSource
                .getData(resultSpec)
                .then(checkEmptyResult)
                .catch((error: ApiResponseError) => {
                    throw convertErrors(error);
                });

            this.subject.next(promise);
        }
    }

    const IntlLoadingHOC = injectIntl(LoadingHOCWrapped);

    return class LoadingHOC extends React.Component<T & ILoadingInjectedProps, null> {
        public render() {
            return (
                <IntlWrapper locale={this.props.locale}>
                    <IntlLoadingHOC {...this.props} />
                </IntlWrapper>
            );
        }
    };
}
*/
