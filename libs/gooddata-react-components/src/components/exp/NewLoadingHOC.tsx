// (C) 2019 GoodData Corporation

import {
    DataViewError,
    ExecutionError,
    IDataView,
    IExecutionResult,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import * as React from "react";
import { convertErrors } from "../../helpers/errorHandlers";
import { ILoadingState } from "../../interfaces/Events";
import { IntlWrapper } from "../core/base/IntlWrapper";
import noop = require("lodash/noop");
import omit = require("lodash/omit");
import { ErrorStates } from "../../constants/errorStates";
import { RuntimeError } from "../../errors/RuntimeError";
import { injectIntl } from "react-intl";
import { ICommonVisualizationProps, IExecutableVisualizationProps, ILoadingInjectedProps } from "./props";

interface IDataViewLoadState {
    isLoading: boolean;
    error?: string;
    executionResult?: IExecutionResult;
    dataView?: IDataView;
}

export function withEntireDataView<T extends ICommonVisualizationProps & IExecutableVisualizationProps>(
    InnerComponent: React.ComponentClass<T & ILoadingInjectedProps>,
): React.ComponentClass<T> {
    class LoadingHOCWrapped extends React.Component<T & ILoadingInjectedProps, IDataViewLoadState> {
        private hasUnmounted: boolean = false;

        constructor(props: T & ILoadingInjectedProps) {
            super(props);

            this.state = {
                isLoading: false,
                error: null,
                executionResult: null,
                dataView: null,
            };

            this.onLoadingChanged = this.onLoadingChanged.bind(this);
            this.onDataTooLarge = this.onDataTooLarge.bind(this);
            this.onNegativeValues = this.onNegativeValues.bind(this);
        }

        public componentDidMount() {
            this.initDataLoading(this.props.execution);
        }

        public render() {
            const { isLoading, error, dataView } = this.state;
            const { intl } = this.props;

            // lower-level components do not need projectId
            const props = omit(this.props, ["workspace"]);

            return (
                <InnerComponent
                    key={"InnerComponent"}
                    {...props}
                    dataView={dataView}
                    onDataTooLarge={this.onDataTooLarge}
                    onNegativeValues={this.onNegativeValues}
                    error={error}
                    isLoading={isLoading}
                    intl={intl}
                />
            );
        }

        public componentWillReceiveProps(nextProps: Readonly<T & ILoadingInjectedProps>) {
            if (this.isDataReloadRequired(nextProps)) {
                this.initDataLoading(nextProps.execution);
            }
        }

        public componentWillUnmount() {
            this.hasUnmounted = true;
            this.onLoadingChanged = noop;
            this.onError = noop;
        }

        private onLoadingChanged(loadingState: ILoadingState) {
            this.props.onLoadingChanged(loadingState);

            const { isLoading } = loadingState;

            const state: IDataViewLoadState = { isLoading };

            if (isLoading) {
                state.error = null;
            }

            this.setState(state);
        }

        private isDataReloadRequired(nextProps: Readonly<T & ILoadingInjectedProps>) {
            return !this.props.execution.equals(nextProps.execution);
        }

        private onError(error: RuntimeError, execution = this.props.execution) {
            if (this.props.execution.equals(execution)) {
                this.setState({ error: error.getMessage(), dataView: null });
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

        private initDataLoading(execution: IPreparedExecution) {
            this.onLoadingChanged({ isLoading: true });
            this.setState({ dataView: null });

            execution
                .execute()
                .then((res: IExecutionResult) => {
                    if (this.hasUnmounted) {
                        return;
                    }

                    this.setState({ executionResult: res });

                    res.readAll()
                        .then((dv: IDataView) => {
                            if (this.hasUnmounted) {
                                return;
                            }

                            this.setState({ dataView: dv });
                            this.onLoadingChanged({ isLoading: false });
                            // TODO: SDK8: push data
                            // TODO: SDK8: push export function
                        })
                        .catch((error: DataViewError) => {
                            this.onError(convertErrors(error));
                        });
                })
                .catch((error: ExecutionError) => {
                    this.onError(convertErrors(error));
                });
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
