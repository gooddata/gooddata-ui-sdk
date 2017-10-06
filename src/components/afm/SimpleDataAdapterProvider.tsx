import * as React from 'react';
import * as GoodData from 'gooddata';

import isEqual = require('lodash/isEqual');
import omit = require('lodash/omit');

import {
    Afm,
    Converters,
    DataSource,
    MetadataSource,
    SimpleExecutorAdapter,
    SimpleMetadataSource,
    Transformation
} from '@gooddata/data-layer';

import { ErrorStates } from '../../constants/errorStates';
import { getCancellable, ICancellablePromise } from '../../helpers/promise';
import { ChartType } from '../core/base/BaseChart';

export type VisType = ChartType | 'table';

export interface ISimpleDataAdapterProviderProps {
    afm: Afm.IAfm;
    projectId: string;
    transformation?: Transformation.ITransformation;

    [p: string]: any; // other params of inner componnent, just for pass through
}

export interface ISimpleDataAdapterProviderInjectedProps {
    dataSource: DataSource.IDataSource<GoodData.ISimpleExecutorResult>;
    metadataSource: MetadataSource.IMetadataSource;
}

export interface ISimpleDataAdapterProviderState {
    type: VisType;
    adapter: SimpleExecutorAdapter;
    dataSource: DataSource.IDataSource<GoodData.ISimpleExecutorResult>;
    metadataSource: MetadataSource.IMetadataSource;
}

export function simpleDataAdapterProvider<T>(
    InnerComponent: React.ComponentClass<T & ISimpleDataAdapterProviderInjectedProps>,
    type: VisType
): React.ComponentClass<ISimpleDataAdapterProviderProps> {

    return class WrappedComponent
        extends React.Component<ISimpleDataAdapterProviderProps, ISimpleDataAdapterProviderState> {

        public static defaultProps: Partial<ISimpleDataAdapterProviderProps> = {
            transformation: {}
        };

        private prepareDataSourceCancellable: ICancellablePromise;
        private prepareMetadataSourceCancellable: ICancellablePromise;

        constructor(props: ISimpleDataAdapterProviderProps) {
            super(props);

            this.state = {
                type,
                adapter: null,
                dataSource: null,
                metadataSource: null
            };
        }

        public componentDidMount() {
            const { projectId, afm, transformation } = this.props;
            this.prepareDataSource(this.prepareAdapter(projectId), afm)
                .then((dataSource: DataSource.IDataSource<GoodData.ISimpleExecutorResult>) => {
                    this.prepareMDSource(dataSource, this.state.type, afm, transformation);
                });
        }

        public componentWillReceiveProps(nextProps: ISimpleDataAdapterProviderProps) {
            const { projectId, afm, transformation } = nextProps;
            if (projectId !== this.props.projectId || !isEqual(afm, this.props.afm)) {
                this.prepareDataSource(this.prepareAdapter(projectId), afm)
                    .then((dataSource: DataSource.IDataSource<GoodData.ISimpleExecutorResult>) => {
                        this.prepareMDSource(dataSource, this.state.type, afm, transformation);
                    });

                return;
            }

            if (!isEqual(transformation, this.props.transformation)) {
                this.prepareMDSource(this.state.dataSource, this.state.type, afm, transformation);
            }
        }

        public componentWillUnmount() {
            if (this.prepareDataSourceCancellable) {
                this.prepareDataSourceCancellable.cancel();
            }

            if (this.prepareMetadataSourceCancellable) {
                this.prepareMetadataSourceCancellable.cancel();
            }
        }

        public render() {
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

        private prepareAdapter(projectId: string) {
            const adapter = new SimpleExecutorAdapter(GoodData, projectId);
            this.setState({
                adapter
            });
            return adapter;
        }

        private handleError(error: string) {
            if (error !== ErrorStates.PROMISE_CANCELLED) {
                throw error;
            }
        }

        private prepareDataSource(adapter: SimpleExecutorAdapter, afm: Afm.IAfm) {
            if (this.prepareDataSourceCancellable) {
                this.prepareDataSourceCancellable.cancel();
            }

            this.prepareDataSourceCancellable = getCancellable(
                adapter.createDataSource(afm));

            return this.prepareDataSourceCancellable.promise.catch(this.handleError);
        }

        private prepareMDSource(
            dataSource: DataSource.IDataSource<GoodData.ISimpleExecutorResult>,
            type: VisType,
            afm: Afm.IAfm,
            transformation: Transformation.ITransformation
        ) {

            if (this.prepareMetadataSourceCancellable) {
                this.prepareMetadataSourceCancellable.cancel();
            }

            this.prepareMetadataSourceCancellable = getCancellable(
                dataSource.getData(transformation)
            );

            this.prepareMetadataSourceCancellable.promise
                .then((result: GoodData.ISimpleExecutorResult) => {
                        const md = Converters.toVisObj(type, afm, transformation, result.headers);
                        const metadataSource = new SimpleMetadataSource(md, {});

                        this.setState({
                            dataSource,
                            metadataSource
                        });
                    }, this.handleError
                );

            return this.prepareMetadataSourceCancellable.promise;
        }
    };
}
