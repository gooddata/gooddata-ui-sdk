import * as React from 'react';
import { ISdk, factory as createSdk } from 'gooddata';
import * as PropTypes from 'prop-types';

import isEqual = require('lodash/isEqual');
import omit = require('lodash/omit');
import { AFM, Execution } from '@gooddata/typings';
import { ExecuteAfmAdapter, createSubject, IAdapter } from '@gooddata/data-layer';
import { AfmPropTypesShape, ResultSpecPropTypesShape } from '@gooddata/indigo-visualizations';

import { IDataSource } from '../../interfaces/DataSource';
import { ISubject } from '../../helpers/async';

export type IAdapterFactory = (sdk: ISdk, projectId: string) => IAdapter<Execution.IExecutionResponses>;

export interface IDataSourceProviderProps {
    afm: AFM.IAfm;
    projectId: string;
    resultSpec?: AFM.IResultSpec;
    adapterFactory?: IAdapterFactory;
    sdk?: ISdk;

    [p: string]: any; // other params of inner componnent, just for pass through
}

export interface IDataSourceProviderInjectedProps {
    dataSource: IDataSource;
    resultSpec?: AFM.IResultSpec;
}

export type IDataSourceInfoPromise = Promise<IDataSource>;
export type IGenerateDefaultDimensionsFunction = (afm: AFM.IAfm) => AFM.IDimension[];

function defaultAdapterFactory(sdk: ISdk, projectId: string): IAdapter<Execution.IExecutionResponses> {
    return new ExecuteAfmAdapter(sdk, projectId);
}

function addDefaultDimensions(
    afm: AFM.IAfm,
    resultSpec: AFM.IResultSpec,
    generateDefaultDimensions: IGenerateDefaultDimensionsFunction
): AFM.IResultSpec {
    const dimensions = generateDefaultDimensions(afm);
    return {
        dimensions,
        ...resultSpec
    };
}

export function dataSourceProvider<T>(
    InnerComponent: React.ComponentClass<T & IDataSourceProviderInjectedProps>,
    generateDefaultDimensions: IGenerateDefaultDimensionsFunction
): React.ComponentClass<IDataSourceProviderProps> {

    return class WrappedComponent
        extends React.Component<IDataSourceProviderProps, IDataSourceProviderInjectedProps> {

        public static propTypes = {
            projectId: PropTypes.string,
            afm: AfmPropTypesShape.isRequired,
            resultSpec: ResultSpecPropTypesShape
        };

        private adapter: IAdapter<Execution.IExecutionResponses>;
        private subject: ISubject<IDataSourceInfoPromise>;
        private sdk: ISdk;

        constructor(props: IDataSourceProviderProps) {
            super(props);

            this.state = {
                dataSource: null,
                resultSpec: null
            };

            this.sdk = props.sdk || createSdk();

            this.subject = createSubject<IDataSource>((dataSource) => {
                this.setState({
                    dataSource
                });
            }, error => this.handleError(error));
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
                this.sdk = sdk;
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
