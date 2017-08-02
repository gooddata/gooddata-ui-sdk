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
            this.prepareDataSource(this.prepareAdapter(projectId), afm).then(dataSource =>
                this.prepareMDSource(dataSource, this.state.type, afm, transformation)
            );
        }

        componentWillReceiveProps(nextProps) {
            const { projectId, afm, transformation } = nextProps;
            if (projectId !== this.props.projectId) {
                this.prepareDataSource(this.prepareAdapter(projectId), afm).then(dataSource =>
                    this.prepareMDSource(dataSource, this.state.type, afm, transformation)
                );
                return;
            }

            if (!isEqual(afm, this.props.afm)) {
                this.prepareDataSource(this.state.adapter, afm).then(dataSource =>
                    this.prepareMDSource(dataSource, this.state.type, afm, transformation)
                );
                return;
            }
            if (!isEqual(transformation, this.props.transformation)) {
                this.prepareMDSource(this.state.dataSource, this.state.type, afm, transformation);
            }
        }

        prepareAdapter(projectId: string) {
            const adapter = new SimpleExecutorAdapter(sdk, projectId);
            this.setState(
                {
                    adapter
                }
            );
            return adapter;
        }

        prepareDataSource(adapter: SimpleExecutorAdapter, afm: Afm.IAfm) {
            return adapter.createDataSource(afm);
        }

        prepareMDSource(dataSource: DataSource.IDataSource,
                        type: VisTypes, afm: Afm.IAfm,
                        transformation: Transformation.ITransformation) {
            return dataSource.getData(transformation).then((result) => {
                const md = Converters.toVisObj(type, afm, transformation, result.headers);
                const metadataSource = new SimpleMetadataSource(md, {});

                this.setState(
                    {
                        dataSource,
                        metadataSource
                    }
                );
            });
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
