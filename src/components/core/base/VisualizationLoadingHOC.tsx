// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import { DataLayer, ApiResponseError } from '@gooddata/gooddata-js';
import { AFM, Execution } from '@gooddata/typings';
import { ErrorStates } from '../../../constants/errorStates';
import { IEvents, ILoadingState } from '../../../interfaces/Events';
import { IDrillableItem } from '../../../interfaces/DrillEvents';
import { ISubject } from '../../../helpers/async';
import { convertErrors, checkEmptyResult } from '../../../helpers/errorHandlers';
import { IVisualizationProperties } from '../../../interfaces/VisualizationProperties';
import { IDataSourceProviderInjectedProps } from '../../afm/DataSourceProvider';
import { injectIntl, InjectedIntl } from 'react-intl';
import { IntlWrapper } from '../../core/base/IntlWrapper';

import { LoadingComponent, ILoadingProps } from '../../simple/LoadingComponent';
import { ErrorComponent, IErrorProps } from '../../simple/ErrorComponent';
import { RuntimeError } from '../../../errors/RuntimeError';
import { IPushData } from '../../../interfaces/PushData';

export type IExecutionDataPromise = Promise<Execution.IExecutionResponses>;

export interface ICommonVisualizationProps extends IEvents {
    locale?: string;
    drillableItems?: IDrillableItem[];
    afterRender?: () => void;
    pushData?: (data: IPushData) => void;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    visualizationProperties?: IVisualizationProperties;
}

export interface ILoadingInjectedProps {
    execution: Execution.IExecutionResponses;
    onDataTooLarge: any;
    onNegativeValues: any;
    error?: string;
    isLoading: boolean;
    intl: InjectedIntl;
}

export interface IVisualizationLoadingState {
    error?: string;
    result?: Execution.IExecutionResponses;
    isLoading: boolean;
}

const defaultErrorHandler = (error: any) => {
    console.error(error); // tslint:disable-line:no-console
};

export const commonDefaultProps: Partial<ICommonVisualizationProps & IDataSourceProviderInjectedProps> = {
    resultSpec: {},
    onError: defaultErrorHandler,
    onLoadingChanged: noop,
    ErrorComponent,
    LoadingComponent,
    afterRender: noop,
    pushData: noop,
    locale: 'en-US',
    drillableItems: [],
    onFiredDrillEvent: () => true
};

export function visualizationLoadingHOC<T extends ICommonVisualizationProps & IDataSourceProviderInjectedProps>(
    InnerComponent: React.ComponentClass<T & ILoadingInjectedProps>
): React.ComponentClass<T> {
    class LoadingHOCWrapped
        extends React.Component<T & ILoadingInjectedProps, IVisualizationLoadingState> {

        public static defaultProps: Partial<T & ILoadingInjectedProps> = InnerComponent.defaultProps;

        protected subject: ISubject<IExecutionDataPromise>;

        constructor(props: T & ILoadingInjectedProps) {
            super(props);

            this.state = {
                isLoading: false
            };

            this.onLoadingChanged = this.onLoadingChanged.bind(this);
            this.onDataTooLarge = this.onDataTooLarge.bind(this);
            this.onNegativeValues = this.onNegativeValues.bind(this);

            this.initSubject();
        }

        public componentDidMount() {
            const { dataSource, resultSpec } = this.props;
            this.initDataLoading(dataSource, resultSpec);
        }

        public render() {
            const { result, isLoading, error } = this.state;
            const { intl } = this.props;

            return (
                <InnerComponent
                    {...this.props}
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
            return !DataLayer.DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource)
                || !isEqual(this.props.resultSpec, nextProps.resultSpec);
        }

        public componentWillReceiveProps(nextProps: Readonly<T & ILoadingInjectedProps>) {
            if (this.isDataReloadRequired(nextProps)) {
                const { dataSource, resultSpec } = nextProps;
                this.initDataLoading(dataSource, resultSpec);
            }
        }

        public componentWillUnmount() {
            this.subject.unsubscribe();
            this.onLoadingChanged = noop;
            this.onError = noop;
        }

        private initSubject() {
            this.subject = DataLayer.createSubject<Execution.IExecutionResponses>((result) => {
                this.setState({ result });
                this.props.pushData({ result });
                this.onLoadingChanged({ isLoading: false });
            }, error => this.onError(error));
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
            resultSpec: AFM.IResultSpec
        ) {
            this.onLoadingChanged({ isLoading: true });
            this.setState({ result: null });

            const promise = dataSource.getData(resultSpec)
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
                    <IntlLoadingHOC {...this.props}/>
                </IntlWrapper>
            );
        }
    };
}
