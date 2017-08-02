import * as React from 'react';
import * as sdk from 'gooddata';
import get = require('lodash/get');
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import { Afm, DataSource, MetadataSource, UriMetadataSource, UriAdapter } from '@gooddata/data-layer';

import { ErrorStates } from '../../constants/errorStates';
import { BaseChart, ChartTypes, IChartConfig } from '../core/base/BaseChart';
import { Table } from '../core/Table';
import { IEvents } from '../../interfaces/Events';
import { getProjectIdByUri } from '../../helpers/project';
import { visualizationPropTypes } from '../../proptypes/Visualization';

function isDateFilter(filter: Afm.IFilter): filter is Afm.IDateFilter {
    return filter.type === 'date';
}

function isAttributeFilter(filter: Afm.IFilter): filter is Afm.IAttributeFilter {
    return filter.type === 'attribute';
}

export interface IVisualizationProps extends IEvents {
    uri: string;
    locale?: string;
    config?: IChartConfig;
    filters?: Afm.IFilter[];
}

export interface IVisualizationState {
    dataSource: DataSource.IDataSource;
    metadataSource: MetadataSource.IMetadataSource;
    type: string;
}

export class Visualization extends React.Component<IVisualizationProps, IVisualizationState> {
    uri: string;
    uriAdapter: UriAdapter;
    static propTypes = visualizationPropTypes;
    static defaultProps = {
        filters: []
    };

    constructor(props) {
        super(props);

        this.state = {
            dataSource: null,
            metadataSource: null,
            type: null
        };
    }

    componentDidMount() {
        const { uri, filters } = this.props;

        this.prepareDatasources(uri, filters);
    }

    public componentWillReceiveProps(nextProps) {
        const { uri, filters } = this.props;

        if (uri !== nextProps.uri || !isEqual(filters, nextProps.filters)) {
            this.prepareDatasources(nextProps.uri, nextProps.filters);
        }
    }

    private getDateFilter(filters: Afm.IFilter[]): Afm.IDateFilter {
        return filters
            .filter(isDateFilter)
            .shift();
    }

    private getAttributeFilters(filters: Afm.IFilter[]): Afm.IAttributeFilter[] {
        return filters.filter(isAttributeFilter);
    }

    public refreshUriAdapter(uri) {
        this.uri = uri;
        const projectId = getProjectIdByUri(uri);
        this.uriAdapter = new UriAdapter(sdk, projectId);
    }

    private prepareDatasources(uri, filters = []) {
        const errorHandler = get(this.props, 'onError', noop);
        const shouldRefreshUriAdapter = this.uri !== uri || !this.uriAdapter;

        if (shouldRefreshUriAdapter) {
            this.refreshUriAdapter(uri);
        }

        const attributeFilters = this.getAttributeFilters(filters);
        const dateFilter = this.getDateFilter(filters);

        this.uriAdapter.createDataSource({ uri, attributeFilters, dateFilter }).then((dataSource) => {
            const metadataSource = new UriMetadataSource(sdk, uri);
            metadataSource.getVisualizationMetadata().then(({ metadata }) => {
                this.setState({
                    type: metadata.content.type,
                    dataSource,
                    metadataSource
                });
            });
        }, () => {
            errorHandler(ErrorStates.NOT_FOUND);
        });
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
