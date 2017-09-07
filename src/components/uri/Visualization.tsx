import * as React from 'react';
import * as sdk from 'gooddata';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import identity = require('lodash/identity');
import { Afm, DataSource, MetadataSource, UriMetadataSource, UriAdapter } from '@gooddata/data-layer';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';

import { ErrorStates } from '../../constants/errorStates';
import { BaseChart, ChartTypes, IChartConfig } from '../core/base/BaseChart';
import { Table } from '../core/Table';
import { IEvents } from '../../interfaces/Events';
import { visualizationPropTypes } from '../../proptypes/Visualization';

function isDateFilter(filter: Afm.IFilter): filter is Afm.IDateFilter {
    return filter.type === 'date';
}

function isAttributeFilter(filter: Afm.IFilter): filter is Afm.IAttributeFilter {
    return filter.type === 'attribute';
}

function getDateFilter(filters: Afm.IFilter[]): Afm.IDateFilter {
    return filters.filter(isDateFilter).shift();
}

function getAttributeFilters(filters: Afm.IFilter[]): Afm.IAttributeFilter[] {
    return filters.filter(isAttributeFilter);
}

export interface IVisualizationProps extends IEvents {
    projectId: string;
    uri?: string;
    identifier?: string;
    locale?: string;
    config?: IChartConfig;
    filters?: Afm.IFilter[];
    uriResolver?: (projectId: string, uri?: string, identifier?: string) => Promise<string>;
}

export interface IVisualizationExecInfo {
    type: string;
    dataSource: DataSource.IDataSource;
    metadataSource: MetadataSource.IMetadataSource;
}

export interface IVisualizationState extends IVisualizationExecInfo {
    uriAdapter: UriAdapter;
}

function uriResolver(projectId: string, uri?: string, identifier?: string): Promise<string> {
    if (uri) {
        return Promise.resolve(uri);
    }

    if (!identifier) {
        return Promise.reject('Neither uri or identifier specified');
    }

    return sdk.md.getObjectUri(projectId, identifier);
}

export class Visualization extends React.Component<IVisualizationProps, IVisualizationState> {
    static propTypes = visualizationPropTypes;

    static defaultProps = {
        onError: noop,
        filters: [],
        uriResolver
    };

    private subscription: Subscription;
    private subject: Subject<Promise<IVisualizationExecInfo>>;

    constructor(props) {
        super(props);

        this.state = {
            dataSource: null,
            metadataSource: null,
            uriAdapter: null,
            type: null
        };

        const errorHandler = props.onError;

        this.subject = new Subject();
        this.subscription = this.subject
            // Unwraps values from promise and ensures that the latest result is returned
            // Used to be called `flatMapLatest`
            .switchMap<Promise<IVisualizationExecInfo>, IVisualizationExecInfo>(identity)

            .subscribe(
                props => this.setState(props),
                () => errorHandler(ErrorStates.NOT_FOUND)
            );
    }

    componentDidMount() {
        const { projectId, uri, identifier, filters } = this.props;

        this.prepareDatasources(projectId, uri, identifier, filters);
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
        this.subject.unsubscribe();
    }

    public hasChangedProps(nextProps): boolean {
        const { projectId, uri, identifier, filters } = this.props;

        return projectId !== nextProps.identifier ||
            identifier !== nextProps.identifier ||
            uri !== nextProps.uri ||
            !isEqual(filters, nextProps.filters);
    }

    public componentWillReceiveProps(nextProps) {
        if (this.hasChangedProps(nextProps)) {
            this.prepareDatasources(nextProps.projectId, nextProps.uri, nextProps.identifier, nextProps.filters);
        }
    }

    private prepareDatasources(projectId, uri, identifier, filters = []) {
        const promise = this.props.uriResolver(projectId, uri, identifier)
            .then((visualizationUri) => {
                const uriAdapter = new UriAdapter(sdk, projectId);

                const dateFilter = getDateFilter(filters);
                const attributeFilters = getAttributeFilters(filters);

                return uriAdapter.createDataSource({ uri: visualizationUri, attributeFilters, dateFilter })
                    .then((dataSource) => {
                        const metadataSource = new UriMetadataSource(sdk, visualizationUri);

                        return metadataSource.getVisualizationMetadata()
                            .then(({ metadata }) => {
                                return {
                                    type: metadata.content.type,
                                    dataSource,
                                    metadataSource
                                };
                            });
                    });
            });

        this.subject.next(promise);
    }

    public render() {
        const { dataSource, metadataSource, type } = this.state;
        if (!dataSource || !metadataSource || !type) {
            return null;
        }

        const { onError, onLoadingChanged, locale, config } = this.props;

        switch (type) {
            case 'table':
                return (
                    <Table
                        dataSource={dataSource}
                        metadataSource={metadataSource}
                        onError={onError}
                        onLoadingChanged={onLoadingChanged}
                        locale={locale}
                    />
                );
            default:
                return (
                    <BaseChart
                        dataSource={dataSource}
                        metadataSource={metadataSource}
                        onError={onError}
                        onLoadingChanged={onLoadingChanged}
                        type={type as ChartTypes}
                        locale={locale}
                        config={config}
                    />
                );
        }
    }
}
