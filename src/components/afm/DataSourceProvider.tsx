// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { SDK, factory as createSdk, DataLayer } from '@gooddata/gooddata-js';
import * as PropTypes from 'prop-types';

import isEqual = require('lodash/isEqual');
import omit = require('lodash/omit');
import { AFM, Execution } from '@gooddata/typings';
import { AfmPropTypesShape, ResultSpecPropTypesShape } from '../visualizations/proptypes/execution';

import { IDataSource } from '../../interfaces/DataSource';
import { ISubject } from '../../helpers/async';
import { setTelemetryHeaders } from '../../helpers/utils';

export type IAdapterFactory = (sdk: SDK, projectId: string) => DataLayer.IAdapter<Execution.IExecutionResponses>;

export interface IDataSourceProviderProps {
    afm: AFM.IAfm;
    projectId: string;
    resultSpec?: AFM.IResultSpec;
    adapterFactory?: IAdapterFactory;
    sdk?: SDK;

    [p: string]: any; // other params of inner componnent, just for pass through
}

export interface IDataSourceProviderInjectedProps {
    dataSource: IDataSource;
    resultSpec?: AFM.IResultSpec;
}

export type IDataSourceInfoPromise = Promise<IDataSource>;
export type IGenerateDefaultDimensionsFunction = (afm: AFM.IAfm) => AFM.IDimension[];

function defaultAdapterFactory(sdk: SDK, projectId: string): DataLayer.IAdapter<Execution.IExecutionResponses> {
    return new DataLayer.ExecuteAfmAdapter(sdk, projectId);
}

function addDefaultDimensions(
    afm: AFM.IAfm,
    resultSpec: AFM.IResultSpec,
    generateDefaultDimensions: IGenerateDefaultDimensionsFunction
): AFM.IResultSpec {
    return resultSpec && resultSpec.dimensions
        ? resultSpec
        : {
            dimensions: generateDefaultDimensions(afm),
            ...resultSpec
        };
}

/**
 * dataSourceProvider
 * is a function that creates a dataSource and passes it to InnerComponent
 * @param InnerComponent: React.ComponentClass<T & IDataSourceProviderInjectedProps>
 *   a component that will be pased dataSource prop
 * @param generateDefaultDimensions - a function that returns default dimensions
 * @param componentName: string - InnerComponent actual name
 * @internal
 */
export function dataSourceProvider<T>(
    InnerComponent: React.ComponentType<T & IDataSourceProviderInjectedProps>,
    generateDefaultDimensions: IGenerateDefaultDimensionsFunction,
    componentName: string
): React.ComponentClass<IDataSourceProviderProps> {

    return class WrappedComponent
        extends React.Component<IDataSourceProviderProps, IDataSourceProviderInjectedProps> {

        public static displayName = componentName ? `${componentName}WithDataSource` : 'WrappedComponent';

        public static propTypes = {
            projectId: PropTypes.string,
            afm: AfmPropTypesShape.isRequired,
            resultSpec: ResultSpecPropTypesShape
        };

        private adapter: DataLayer.IAdapter<Execution.IExecutionResponses>;
        private subject: ISubject<IDataSourceInfoPromise>;
        private sdk: SDK;

        constructor(props: IDataSourceProviderProps) {
            super(props);

            this.state = {
                dataSource: null,
                resultSpec: null
            };

            const sdk = props.sdk || createSdk();
            this.sdk = sdk.clone();
            setTelemetryHeaders(this.sdk, componentName, props);

            this.subject = DataLayer.createSubject<IDataSource>(
                dataSource => this.setState({ dataSource }),
                error => this.handleError(error)
            );
        }

        public componentDidMount() {
            const { projectId, afm } = this.props;
            this.createAdapter(projectId);
            this.prepareDataSource(afm);
        }

        public componentWillReceiveProps(nextProps: IDataSourceProviderProps) {
            const { projectId, afm, resultSpec, sdk } = nextProps;
            if (projectId !== this.props.projectId) {
                this.createAdapter(projectId);
            }

            if (sdk && sdk !== this.sdk) {
                this.sdk = nextProps.sdk.clone();
                setTelemetryHeaders(this.sdk, componentName, nextProps);
            }

            if (
                !isEqual(afm, this.props.afm)
                || !isEqual(resultSpec, this.props.resultSpec)
                || projectId !== this.props.projectId
            ) {
                this.prepareDataSource(afm);
            }
        }

        public componentWillUnmount() {
            this.subject.unsubscribe();
        }

        public render() {
            const { dataSource } = this.state;
            if (!dataSource) {
                return null;
            }

            const props = omit<any, IDataSourceProviderProps>(
                this.props,
                ['afm', 'projectId', 'resultSpec', 'adapterFactory']
            );
            const resultSpec = addDefaultDimensions(this.props.afm, this.props.resultSpec, generateDefaultDimensions);
            return (
                <InnerComponent
                    {...props}
                    dataSource={dataSource}
                    resultSpec={resultSpec}
                />
            );
        }

        private createAdapter(projectId: string) {
            const adapterFactory = this.props.adapterFactory || defaultAdapterFactory;
            this.adapter = adapterFactory(this.sdk, projectId);
        }

        private handleError(error: string) {
            throw error;
        }

        private prepareDataSource(afm: AFM.IAfm) {
            const promise = this.adapter.createDataSource(afm);
            this.subject.next(promise);
        }
    };
}
