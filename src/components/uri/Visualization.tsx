import * as React from 'react';
import { ISdk, factory as createSdk } from 'gooddata';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import {
    AfmUtils,
    ExecuteAfmAdapter,
    toAfmResultSpec,
    createSubject
} from '@gooddata/data-layer';
import { AFM, VisualizationObject, VisualizationClass } from '@gooddata/typings';
import { injectIntl, intlShape, InjectedIntlProps, InjectedIntl } from 'react-intl';

import { IntlWrapper } from '../core/base/IntlWrapper';
import { BaseChart, IChartConfig } from '../core/base/BaseChart';
import { SortableTable } from '../core/SortableTable';
import { Headline } from '../core/Headline';
import { IEvents } from '../../interfaces/Events';
import { VisualizationPropType, Requireable } from '../../proptypes/Visualization';
import { VisualizationTypes, VisType } from '../../constants/visualizationTypes';
import { IDataSource } from '../../interfaces/DataSource';
import { ISubject } from '../../helpers/async';
import { getVisualizationTypeFromVisualizationClass } from '../../helpers/visualizationType';
import * as MdObjectHelper from '../../helpers/MdObjectHelper';
import { fillPoPTitlesAndAliases } from '../../helpers/popHelper';
import {
    IDrillableItem,
    ErrorStates,
    generateDimensions
} from '../../';

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
    sdk?: ISdk;
    uri?: string;
    identifier?: string;
    locale?: string;
    config?: IChartConfig;
    filters?: AFM.FilterItem[];
    drillableItems?: IDrillableItem[];
    uriResolver?: (sdk: ISdk, projectId: string, uri?: string, identifier?: string) => Promise<string>;
    fetchVisObject?: (sdk: ISdk, visualizationUri: string) => Promise<VisualizationObject.IVisualizationObject>;
    fetchVisualizationClass?: (sdk: ISdk, visualizationUri: string) => Promise<VisualizationClass.IVisualizationClass>;
    BaseChartComponent?: any;
    TableComponent?: any;
    HeadlineComponent?: any;
    ErrorComponent?: React.ComponentClass<any>;
    LoadingComponent?: React.ComponentClass<any>;
}

export interface IVisualizationState {
    isLoading: boolean;
    resultSpec: AFM.IResultSpec;
    type: VisType;
    totals: VisualizationObject.IVisualizationTotal[];
    error: {
        status: string;
    };
}

export interface IVisualizationExecInfo {
    dataSource: IDataSource;
    resultSpec: AFM.IResultSpec;
    type: VisType;
    totals: VisualizationObject.IVisualizationTotal[];
}

function uriResolver(sdk: ISdk, projectId: string, uri?: string, identifier?: string): Promise<string> {
    if (uri) {
        return Promise.resolve(uri);
    }

    if (!identifier) {
        return Promise.reject('Neither uri or identifier specified');
    }

    return sdk.md.getObjectUri(projectId, identifier);
}

function fetchVisObject(sdk: ISdk, visualizationUri: string): Promise<VisualizationObject.IVisualizationObject> {
    return sdk.xhr.get<VisualizationObject.IVisualizationObjectResponse>(visualizationUri)
        .then(response => response.visualizationObject);
}

function fetchVisualizationClass(
    sdk: ISdk,
    visualizationClassUri: string
): Promise<VisualizationClass.IVisualizationClass> {
    return sdk.xhr.get<VisualizationClass.IVisualizationClassWrapped>(visualizationClassUri)
        .then(response => response.visualizationClass);
}

export class VisualizationWrapped
    extends React.Component<IVisualizationProps & InjectedIntlProps, IVisualizationState> {
    public static propTypes = {
        ...VisualizationPropType,
        intl: intlShape.isRequired
    };

    public static defaultProps: Partial<IVisualizationProps> = {
        onError: noop,
        filters: [],
        uriResolver,
        fetchVisObject,
        fetchVisualizationClass,
        BaseChartComponent: BaseChart,
        TableComponent: SortableTable,
        HeadlineComponent: Headline,
        LoadingComponent: null,
        ErrorComponent: null
    };

    private visualizationUri: string;
    private adapter: ExecuteAfmAdapter;
    private dataSource: IDataSource;

    private subject: ISubject<Promise<IVisualizationExecInfo>>;

    private sdk: ISdk;

    constructor(props: IVisualizationProps & InjectedIntlProps) {
        super(props);

        this.state = {
            isLoading: true,
            type: null,
            resultSpec: null,
            totals: [],
            error: null
        };

        this.sdk = props.sdk || createSdk();
        this.visualizationUri = props.uri;

        this.subject = createSubject<IVisualizationExecInfo>(
            ({ type, resultSpec, dataSource, totals }) => {
                this.dataSource = dataSource;
                this.setState({
                    type,
                    resultSpec,
                    isLoading: false,
                    totals
                });
            }, () => {
                this.setState({
                    isLoading: false,
                    error: { status: ErrorStates.NOT_FOUND }
                });
                return props.onError({ status: ErrorStates.NOT_FOUND });
            });
    }

    public componentDidMount() {
        const { projectId, uri, identifier, filters, intl } = this.props;

        this.adapter = new ExecuteAfmAdapter(this.sdk, projectId);
        this.visualizationUri = uri;

        this.prepareDataSources(
            projectId,
            identifier,
            filters,
            intl
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

    public componentWillReceiveProps(nextProps: IVisualizationProps & InjectedIntlProps) {
        if (nextProps.sdk && this.sdk !== nextProps.sdk) {
            this.sdk = nextProps.sdk;
        }
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
                nextProps.filters,
                nextProps.intl
            );
        }
    }

    public render() {
        const { dataSource } = this;
        const {
            drillableItems,
            onFiredDrillEvent,
            onError,
            onLoadingChanged,
            locale,
            config,
            BaseChartComponent,
            TableComponent,
            HeadlineComponent,
            LoadingComponent,
            ErrorComponent
        } = this.props;
        const { resultSpec, type, totals, error, isLoading } = this.state;

        if (error !== null && error.status !== ErrorStates.OK) {
            return ErrorComponent
                ? <ErrorComponent error={this.state.error} props={this.props} />
                : null;
        }
        if (isLoading || !dataSource) {
            return LoadingComponent
                ? <LoadingComponent props={this.props} />
                : null;
        }

        switch (type) {
            case VisualizationTypes.TABLE:
                return (
                    <TableComponent
                        dataSource={dataSource}
                        resultSpec={resultSpec}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={onFiredDrillEvent}
                        totals={totals}
                        onError={onError}
                        onLoadingChanged={onLoadingChanged}
                        LoadingComponent={LoadingComponent}
                        ErrorComponent={ErrorComponent}
                        locale={locale}
                    />
                );
            case VisualizationTypes.HEADLINE:
                return (
                    <HeadlineComponent
                        dataSource={dataSource}
                        resultSpec={resultSpec}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={onFiredDrillEvent}
                        onError={onError}
                        onLoadingChanged={onLoadingChanged}
                        LoadingComponent={LoadingComponent}
                        ErrorComponent={ErrorComponent}
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
                        LoadingComponent={LoadingComponent}
                        ErrorComponent={ErrorComponent}
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
        filters: AFM.FilterItem[] = [],
        intl: InjectedIntl
    ) {
        const promise = this.props.uriResolver(this.sdk, projectId, this.visualizationUri, identifier)
            .then((visualizationUri: string) => {
                // Cache uri for next execution
                return this.visualizationUri = visualizationUri;
            })
            .then((visualizationUri: string) => {
                return this.props.fetchVisObject(this.sdk, visualizationUri);
            })
            .then((mdObject: VisualizationObject.IVisualizationObject) => {
                const visualizationClassUri: string = MdObjectHelper.getVisualizationClassUri(mdObject);
                return this.props.fetchVisualizationClass(
                    this.sdk, visualizationClassUri
                ).then((visualizationClass) => {
                    const popSuffix = ` - ${intl.formatMessage({ id: 'previous_year' })}`;

                    const { afm, resultSpec } = toAfmResultSpec(fillPoPTitlesAndAliases(mdObject.content, popSuffix));

                    const mdObjectTotals = MdObjectHelper.getTotals(mdObject);

                    const dateFilter = getDateFilter(filters);
                    const attributeFilters = getAttributeFilters(filters);
                    const afmWithFilters = AfmUtils.appendFilters(afm, attributeFilters, dateFilter);

                    const visualizationType: VisType = getVisualizationTypeFromVisualizationClass(visualizationClass);
                    const resultSpecWithDimensions = {
                        ...resultSpec,
                        dimensions: generateDimensions(mdObject.content, visualizationType)
                    };

                    return this.adapter.createDataSource(afmWithFilters)
                        .then((dataSource: IDataSource) => {
                            return {
                                type: visualizationType,
                                dataSource,
                                resultSpec: resultSpecWithDimensions,
                                totals: mdObjectTotals
                            };
                        });
                    });
                });
        this.subject.next(promise);
    }
}

export const IntlVisualization = injectIntl(VisualizationWrapped);

export class Visualization extends React.Component<IVisualizationProps, null> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlVisualization {...this.props}/>
            </IntlWrapper>
        );
    }
}
