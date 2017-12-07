import * as React from 'react';
import * as GoodData from 'gooddata';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import {
    AfmUtils,
    ExecuteAfmAdapter,
    VisualizationObject,
    toAfmResultSpec,
    createSubject
} from '@gooddata/data-layer';
import { AFM } from '@gooddata/typings';

import { ErrorStates } from '../../constants/errorStates';
import { BaseChart, IChartConfig } from '../core/base/BaseChart';
import { SortableTable } from '../core/SortableTable';
import { IEvents } from '../../interfaces/Events';
import { VisualizationPropType, Requireable } from '../../proptypes/Visualization';
import { VisualizationTypes, VisType } from '../../constants/visualizationTypes';
import { IDrillableItem } from '../../interfaces/DrillEvents';
import { IDataSource } from '../../interfaces/DataSource';
import { ISubject } from '../../helpers/async';

export { Requireable };

// BC with TS 2.3
function getDateFilter(filters: AFM.FilterItem[]): AFM.DateFilterItem {
    for (const filter of filters) {
        if (AfmUtils.isDateFilter(filter)) {
            return filter;
        }
    }

    return null;
}

// BC with TS 2.3
function getAttributeFilters(filters: AFM.FilterItem[]): AFM.AttributeFilterItem[] {
    const attributeFilters: AFM.AttributeFilterItem[] = [];

    for (const filter of filters) {
        if (AfmUtils.isAttributeFilter(filter)) {
            attributeFilters.push(filter);
        }
    }

    return attributeFilters;
}

export type VisualizationEnvironment = 'none' | 'dashboards';

export interface IVisualizationProps extends IEvents {
    projectId: string;
    uri?: string;
    identifier?: string;
    locale?: string;
    config?: IChartConfig;
    filters?: AFM.FilterItem[];
    drillableItems?: IDrillableItem[];
    uriResolver?: (projectId: string, uri?: string, identifier?: string) => Promise<string>;
    fetchVisObject?: (visualizationUri: string) => Promise<VisualizationObject.IVisualizationObject>;
    BaseChartComponent?: any;
    TableComponent?: any;
}

export interface IVisualizationState {
    isLoading: boolean;
    resultSpec: AFM.IResultSpec;
    type: VisType;
}

export interface IVisualizationExecInfo {
    dataSource: IDataSource;
    resultSpec: AFM.IResultSpec;
    type: VisType;
}

function uriResolver(projectId: string, uri?: string, identifier?: string): Promise<string> {
    if (uri) {
        return Promise.resolve(uri);
    }

    if (!identifier) {
        return Promise.reject('Neither uri or identifier specified');
    }

    return GoodData.md.getObjectUri(projectId, identifier);
}

function fetchVisObject(visualizationUri: string): Promise<VisualizationObject.IVisualizationObject> {
    return GoodData.xhr.get<VisualizationObject.IVisualizationObjectResponse>(visualizationUri)
        .then(response => response.visualization);
}

export class Visualization extends React.Component<IVisualizationProps, IVisualizationState> {
    public static propTypes = VisualizationPropType;

    public static defaultProps: Partial<IVisualizationProps> = {
        onError: noop,
        filters: [],
        uriResolver,
        fetchVisObject,
        BaseChartComponent: BaseChart,
        TableComponent: SortableTable
    };

    private visualizationUri: string;
    private adapter: ExecuteAfmAdapter;
    private dataSource: IDataSource;

    private subject: ISubject<Promise<IVisualizationExecInfo>>;

    constructor(props: IVisualizationProps) {
        super(props);

        this.state = {
            isLoading: true,
            type: null,
            resultSpec: null
        };

        this.visualizationUri = props.uri;

        this.subject = createSubject<IVisualizationExecInfo>(
            ({ type, resultSpec, dataSource }) => {
                this.dataSource = dataSource;
                this.setState({
                    type,
                    resultSpec,
                    isLoading: false
                });
            }, () => props.onError({ status: ErrorStates.NOT_FOUND }));
    }

    public componentDidMount() {
        const { projectId, uri, identifier, filters } = this.props;

        this.adapter = new ExecuteAfmAdapter(GoodData, projectId);
        this.visualizationUri = uri;

        this.prepareDataSources(
            projectId,
            identifier,
            filters
        );
    }

    public componentWillUnmount() {
        this.subject.unsubscribe();
    }

    public shouldComponentUpdate(nextProps: IVisualizationProps, nextState: IVisualizationState) {
        return this.hasChangedProps(nextProps) || (this.state.isLoading !== nextState.isLoading);
    }

    public hasChangedProps(nextProps: IVisualizationProps, propKeys = Object.keys(VisualizationPropType)): boolean {
        return propKeys.some(propKey => !isEqual(this.props[propKey], nextProps[propKey]));
    }

    public componentWillReceiveProps(nextProps: IVisualizationProps) {
        const hasInvalidResolvedUri = this.hasChangedProps(nextProps, ['uri', 'projectId', 'identifier']);
        const hasInvalidDatasource = hasInvalidResolvedUri || this.hasChangedProps(nextProps, ['filters']);
        if (hasInvalidDatasource) {
            this.setState({
                isLoading: true
            });
            if (hasInvalidResolvedUri) {
                this.visualizationUri = nextProps.uri;
            }
            this.prepareDataSources(
                nextProps.projectId,
                nextProps.identifier,
                nextProps.filters
            );
        }
    }

    public render() {
        const { dataSource } = this;
        if (!dataSource) {
            return null;
        }

        const {
            drillableItems,
            onFiredDrillEvent,
            onError,
            onLoadingChanged,
            locale,
            config,
            BaseChartComponent,
            TableComponent
        } = this.props;
        const { resultSpec, type } = this.state;

        switch (type) {
            case VisualizationTypes.TABLE:
                return (
                    <TableComponent
                        dataSource={dataSource}
                        resultSpec={resultSpec}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={onFiredDrillEvent}
                        onError={onError}
                        onLoadingChanged={onLoadingChanged}
                        locale={locale}
                    />
                );
            default:
                return (
                    <BaseChartComponent
                        dataSource={dataSource}
                        resultSpec={resultSpec}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={onFiredDrillEvent}
                        onError={onError}
                        onLoadingChanged={onLoadingChanged}
                        locale={locale}
                        type={type}
                        config={config}
                    />
                );
        }
    }

    private prepareDataSources(
        projectId: string,
        identifier: string,
        filters: AFM.FilterItem[] = []
    ) {
        const promise = this.props.uriResolver(projectId, this.visualizationUri, identifier)
            .then((visualizationUri: string) => {
                // Cache uri for next execution
                return this.visualizationUri = visualizationUri;
            })
            .then((visualizationUri: string) => {
                return this.props.fetchVisObject(visualizationUri);
            })
            .then((mdObject: VisualizationObject.IVisualizationObject) => {
                const translatedPopSuffix = '- previous year'; // TODO change hardcoded PoP suffix with new visObj
                const { afm, resultSpec } = toAfmResultSpec(mdObject.content, translatedPopSuffix);
                const dateFilter = getDateFilter(filters);
                const attributeFilters = getAttributeFilters(filters);
                const afmWithFilters = AfmUtils.appendFilters(afm, attributeFilters, dateFilter);
                return this.adapter.createDataSource(afmWithFilters)
                    .then((dataSource: IDataSource) => {
                        return {
                            type: mdObject.content.type,
                            dataSource,
                            resultSpec
                        };
                    });
                });
        this.subject.next(promise);
    }
}
