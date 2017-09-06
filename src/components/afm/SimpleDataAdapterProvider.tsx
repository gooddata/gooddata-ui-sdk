import * as React from 'react';
import * as sdk from 'gooddata';

import isEqual = require('lodash/isEqual');
import omit = require('lodash/omit');

import {
    Afm,
    DataSource,
    MetadataSource,
    SimpleExecutorAdapter,
    SimpleMetadataSource,
    Transformation,
    Converters
} from '@gooddata/data-layer';

import { ErrorStates } from '../../constants/errorStates';
import { getCancellable } from '../../helpers/promise';
import { ChartTypes } from '../core/base/BaseChart';

export type VisTypes = ChartTypes | 'table';

export interface ISimpleDataAdapterProviderProps {
    afm: Afm.IAfm;
    projectId: string;
    transformation?: Transformation.ITransformation;
    [p: string]: any; // other params of inner componnent, just for pass through
}

export interface ISimpleDataAdapterProviderInjectedProps {
    dataSource: DataSource.IDataSource;
    metadataSource: MetadataSource.IMetadataSource;
}

export interface ISimpleDataAdapterProviderState {
    type: VisTypes;
    adapter: SimpleExecutorAdapter;
    dataSource: DataSource.IDataSource;
    metadataSource: MetadataSource.IMetadataSource;
}

export function simpleDataAdapterProvider <T>(
    InnerComponent: React.ComponentClass<T & ISimpleDataAdapterProviderInjectedProps>,
    type: VisTypes): React.ComponentClass<ISimpleDataAdapterProviderProps> {

    return class WrappedComponent extends
        React.Component<ISimpleDataAdapterProviderProps, ISimpleDataAdapterProviderState> {
        public static defaultProps: Partial<ISimpleDataAdapterProviderProps> = {
            transformation: {}
        };

        private prepareDataSourceCancellable;
        private prepareMetadataSourceCancellable;

        constructor(props) {
            super(props);

            this.state = {
                type,
                adapter: null,
                dataSource: null,
                metadataSource: null
            };
        }

        componentDidMount() {
            const { projectId, afm, transformation } = this.props;
            this.prepareDataSource(this.prepareAdapter(projectId), afm).then((dataSource) => {
                this.prepareMDSource(dataSource, this.state.type, afm, transformation);
            });
        }

        componentWillReceiveProps(nextProps) {
            const { projectId, afm, transformation } = nextProps;
            if (projectId !== this.props.projectId || !isEqual(afm, this.props.afm)) {
                this.prepareDataSource(this.prepareAdapter(projectId), afm).then((dataSource) => {
                    this.prepareMDSource(dataSource, this.state.type, afm, transformation);
                });

                return;
            }

            if (!isEqual(transformation, this.props.transformation)) {
                this.prepareMDSource(this.state.dataSource, this.state.type, afm, transformation);
            }
        }

        componentWillUnmount() {
            if (this.prepareDataSourceCancellable) {
                this.prepareDataSourceCancellable.cancel();
            }

            if (this.prepareMetadataSourceCancellable) {
                this.prepareMetadataSourceCancellable.cancel();
            }
        }

        prepareAdapter(projectId: string) {
            const adapter = new SimpleExecutorAdapter(sdk, projectId);
            this.setState({
                adapter
            });
            return adapter;
        }

        handleError(error) {
            if (error !== ErrorStates.PROMISE_CANCELLED) {
                throw error;
            }
        }

        prepareDataSource(adapter: SimpleExecutorAdapter, afm: Afm.IAfm) {
            if (this.prepareDataSourceCancellable) {
                this.prepareDataSourceCancellable.cancel();
            }

            this.prepareDataSourceCancellable = getCancellable(
                adapter.createDataSource(afm));

            return this.prepareDataSourceCancellable.promise.catch(this.handleError);
        }

        prepareMDSource(dataSource: DataSource.IDataSource,
                        type: VisTypes, afm: Afm.IAfm,
                        transformation: Transformation.ITransformation) {

            if (this.prepareMetadataSourceCancellable) {
                this.prepareMetadataSourceCancellable.cancel();
            }

            this.prepareMetadataSourceCancellable = getCancellable(
                dataSource.getData(transformation)
            );

            this.prepareMetadataSourceCancellable.promise.then((result) => {
                const md = Converters.toVisObj(type, afm, transformation, result.headers);
                const metadataSource = new SimpleMetadataSource(md, {});

                this.setState({
                    dataSource,
                    metadataSource
                });
            }, this.handleError);

            return this.prepareMetadataSourceCancellable.promise;
        }

        render() {
            if (!this.state.dataSource || !this.state.metadataSource) {
                return null;
            }

            const { dataSource, metadataSource } = this.state;

            return (
                <InnerComponent
                    {...omit(this.props, ['afm', 'projectId'])}
                    dataSource={dataSource}
                    metadataSource={metadataSource}
                />
            );
        }
    };
}
