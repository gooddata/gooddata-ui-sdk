import * as React from 'react';
import { noop, bindAll, get } from 'lodash';
import { ResponsiveTable, TableTransformation } from '@gooddata/indigo-visualizations';
import {
    DataSource,
    DataSourceUtils,
    ExecutorResult,
    MetadataSource,
    VisualizationObject,
    Transformation
} from '@gooddata/data-layer';

import { updateSorting } from '../helpers/metadata';
import { IntlWrapper } from './base/IntlWrapper';
import { IEvents } from '../interfaces/Events';
import { IDrillableItem } from '../interfaces/DrillableItem';
import { tablePropTypes } from '../proptypes/Table';
import { getSorting, ISortingChange } from '../helpers/sorting';
import { getCancellable } from '../helpers/promise';
import { ErrorStates } from '../constants/errorStates';
import { initTableDataLoading as initDataLoading } from '../helpers/load';

export interface ITableProps extends IEvents {
    dataSource: DataSource.IDataSource;
    metadataSource: MetadataSource.IMetadataSource;
    locale?: string;
    height?: number;
    environment?: string;
    stickyHeader?: number;
    drillableItems?: IDrillableItem[];
    afterRender?;
    pushData?;
}

export interface ITableState {
    error: string;
    result: ExecutorResult.ISimpleExecutorResult;
    metadata: VisualizationObject.IVisualizationObjectMetadata;
    isLoading: boolean;
    sorting: Transformation.ISort;
    page: number;
}

const defaultErrorHandler = (error) => {
    if (error.status !== ErrorStates.OK) {
        console.error(error);
    }
};

export class Table extends React.Component<ITableProps, ITableState> {
    public static defaultProps: Partial<ITableProps> = {
        onError: defaultErrorHandler,
        onLoadingChanged: noop,
        afterRender: noop,
        pushData: noop,
        stickyHeader: 0,
        height: 300,
        locale: 'en-US',
        environment: 'none',
        drillableItems: []
    };

    static propTypes = tablePropTypes;

    private dataCancellable;

    constructor(props) {
        super(props);

        this.state = {
            error: ErrorStates.OK,
            result: null,
            isLoading: false,
            sorting: null,
            metadata: null,
            page: 1
        };

        bindAll(this, ['onSortChange', 'onLoadingChanged', 'onDataTooLarge', 'onError', 'onMore', 'onLess']);

        this.dataCancellable = null;
    }

    public componentDidMount() {
        const { metadataSource, dataSource } = this.props;
        this.initDataLoading(metadataSource, dataSource);
    }

    public componentWillReceiveProps(nextProps) {
        if (!DataSourceUtils.dataSourcesMatch(this.props.dataSource, nextProps.dataSource)) {
            const { sorting, metadata } = this.state;
            const config = (sorting && metadata) ? { sorting, metadata } : null;
            if (this.dataCancellable) {
                this.dataCancellable.cancel();
            }
            this.initDataLoading(nextProps.metadataSource, nextProps.dataSource, config);
        }
    }

    public componentWillUnmount() {
        if (this.dataCancellable) {
            this.dataCancellable.cancel();
        }
        this.onLoadingChanged = noop;
        this.onError = noop;
    }

    public onSortChange(change: ISortingChange, index: Number) {
        const sorting = getSorting(change, this.state.sorting);
        const metadata = updateSorting(this.state.metadata, { sorting, change, index });
        this.setState({ sorting, metadata });
        this.initDataLoading(this.props.metadataSource, this.props.dataSource, { sorting, metadata });
    }

    public onMore({ page }) {
        this.setState({
            page
        });
    }

    public onLess() {
        this.setState({
            page: 1
        });
    }

    public render() {
        const { result, metadata, page } = this.state;
        const { afterRender, height, locale } = this.props;
        if (this.canRender()) {
            if (this.props.environment === 'dashboards') {
                const TABLE_PAGE_SIZE = 9;
                const tableRenderer = props =>
                    (<ResponsiveTable
                        {...props}
                        afm={this.props.dataSource.getAfm()}
                        rowsPerPage={TABLE_PAGE_SIZE}
                        onSortChange={this.onSortChange}
                        page={page}
                        onMore={this.onMore}
                        onLess={this.onLess}
                    />);
                return (
                    <IntlWrapper locale={locale}>
                        <TableTransformation
                            drillableItems={this.props.drillableItems}
                            tableRenderer={tableRenderer}
                            afterRender={afterRender}
                            height={height}
                            data={result}
                            onDataTooLarge={this.onDataTooLarge}
                            config={{
                                stickyHeader: this.props.stickyHeader,
                                ...metadata.content
                            }}
                        />
                    </IntlWrapper>
                );
            }

            return (
                <IntlWrapper locale={locale}>
                    <TableTransformation
                        drillableItems={this.props.drillableItems}
                        afterRender={afterRender}
                        height={height}
                        data={result}
                        config={{
                            stickyHeader: this.props.stickyHeader,
                            ...metadata.content
                        }}
                    />
                </IntlWrapper>
            );
        }

        return null;
    }

    private canRender() {
        const { result, metadata, isLoading, error } = this.state;
        return result && metadata && !isLoading && error === ErrorStates.OK;
    }

    private onError(errorCode, dataSource = this.props.dataSource) {
        if (DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
            this.setState({
                error: errorCode
            });
            this.onLoadingChanged(false);
            this.props.onError({ status: errorCode });
        }
    }

    private onDataTooLarge() {
        this.onError(ErrorStates.DATA_TOO_LARGE_DISPLAY);
    }

    private onLoadingChanged(isLoading) {
        this.props.onLoadingChanged(isLoading);
        if (isLoading) {
            this.props.onError({ status: ErrorStates.OK }); // reset all errors in parent on loading start
            this.setState({
                isLoading,
                error: ErrorStates.OK // reset local errors
            });
        } else {
            this.setState({
                isLoading
            });
        }
    }

    private initDataLoading(metadataSource, dataSource, currentConfig = null) {
        this.onLoadingChanged(true);

        if (this.dataCancellable) {
            this.dataCancellable.cancel();
        }
        this.dataCancellable = getCancellable(initDataLoading(metadataSource, dataSource, currentConfig));
        this.dataCancellable.promise.then((result) => {
            if (DataSourceUtils.dataSourcesMatch(this.props.dataSource, dataSource)) {
                const executionResult = get(result, 'result') as ExecutorResult.ISimpleExecutorResult;
                const sorting = get(result, 'sorting') as Transformation.ISort;
                const metadata = get(result, 'metadata') as VisualizationObject.IVisualizationObjectMetadata;
                const warnings = get(result, 'result.warnings');
                this.setState({
                    result: executionResult,
                    sorting,
                    metadata
                });
                this.props.pushData({ warnings });
                this.onLoadingChanged(false);
            }
        }, (error) => {
            if (error !== ErrorStates.PROMISE_CANCELLED) {
                this.onError(error, dataSource);
            }
        });
    }
}
