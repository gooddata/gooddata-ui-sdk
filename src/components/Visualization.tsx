import * as React from 'react';
import * as sdk from 'gooddata';
import { noop, get, isEqual } from 'lodash';
import { DataSource, MetadataSource, UriMetadataSource, UriAdapter } from '@gooddata/data-layer';
import { IFilter, IAttributeFilter, IDateFilter } from '@gooddata/data-layer/src/interfaces/Afm';

import { ErrorStates } from '../constants/errorStates';
import { BaseChart, ChartTypes, IChartConfig } from './base/BaseChart';
import { Table } from './Table';
import { IEvents } from '../interfaces/Events';
import { getProjectIdByUri } from '../helpers/project';
import { visualizationPropTypes } from '../proptypes/Visualization';

function isDateFilter(filter: IFilter): filter is IDateFilter {
    return filter.type === 'date';
}

function isAttributeFilter(filter: IFilter): filter is IAttributeFilter {
    return filter.type === 'attribute';
}

export interface IVisualizationProps extends IEvents {
    uri: string;
    locale?: string;
    config?: IChartConfig;
    filters?: IFilter[];
}
export interface IVisualizationState {
    dataSource: DataSource.IDataSource;
    metadataSource: MetadataSource.IMetadataSource;
    type: string;
}

export class Visualization extends React.Component<IVisualizationProps, IVisualizationState> {
    static propTypes = visualizationPropTypes;

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

    private getDateFilter(filters: IFilter[]): IDateFilter {
        return filters
            .filter(isDateFilter)
            .shift();
    }

    private getAttributeFilters(filters: IFilter[]): IAttributeFilter[] {
        return filters.filter(isAttributeFilter);
    }

    private prepareDatasources(uri, filters = []) {
        const errorHandler = get(this.props, 'onError', noop);

        const projectId = getProjectIdByUri(uri);
        const dateFilter = this.getDateFilter(filters);
        const attributeFilters = this.getAttributeFilters(filters);

        new UriAdapter(sdk, projectId).createDataSource({ uri, attributeFilters, dateFilter }).then((dataSource) => {
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
