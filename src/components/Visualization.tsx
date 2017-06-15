import * as React from 'react';
import * as sdk from 'gooddata';
import { noop, get } from 'lodash';
import { DataSource, MetadataSource, UriMetadataSource, UriAdapter } from '@gooddata/data-layer';

import { ErrorStates } from '../constants/errorStates';
import { BaseChart, ChartTypes, IChartConfig } from './base/BaseChart';
import { Table } from './Table';
import { IEvents } from '../interfaces/Events';
import { getProjectIdByUri } from '../helpers/project';
import { visualizationPropTypes } from '../proptypes/Visualization';

export interface IVisualizationProps extends IEvents {
    uri: string;
    locale?: string;
    config?: IChartConfig;
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
        this.prepareDatasources(this.props.uri);
    }

    public componentWillReceiveProps(nextProps) {
        if (this.props.uri !== nextProps.uri) {
            this.prepareDatasources(nextProps.uri);
        }
    }

    private prepareDatasources(uri) {
        const errorHandler = get(this.props, 'onError', noop);

        const projectId = getProjectIdByUri(uri);
        new UriAdapter(sdk, projectId).createDataSource({ uri }).then((dataSource) => {
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
