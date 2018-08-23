// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { SDK, factory as createSdk, DataLayer, ApiResponse } from '@gooddata/gooddata-js';
import noop = require('lodash/noop');
import isEqual = require('lodash/isEqual');
import { AFM, VisualizationObject, VisualizationClass, Localization } from '@gooddata/typings';
import { injectIntl, intlShape, InjectedIntlProps } from 'react-intl';

import { IntlWrapper } from '../core/base/IntlWrapper';
import { BaseChart } from '../core/base/BaseChart';
import { IChartConfig } from '../visualizations/chart/Chart';
import { SortableTable } from '../core/SortableTable';
import { Headline } from '../core/Headline';
import { IEvents, OnLegendReady } from '../../interfaces/Events';
import { VisualizationPropType, Requireable } from '../../proptypes/Visualization';
import { VisualizationTypes, VisType } from '../../constants/visualizationTypes';
import { IDataSource } from '../../interfaces/DataSource';
import { ISubject } from '../../helpers/async';
import { getVisualizationTypeFromVisualizationClass } from '../../helpers/visualizationType';
import * as MdObjectHelper from '../../helpers/MdObjectHelper';
import { fillDerivedMeasuresTitlesAndAliases } from '../../helpers/overTimeComparisonHelper';
import { LoadingComponent, ILoadingProps } from '../simple/LoadingComponent';
import { ErrorComponent, IErrorProps } from '../simple/ErrorComponent';
import {
    IDrillableItem,
    generateDimensions,
    RuntimeError
} from '../../';
import { setTelemetryHeaders } from '../../helpers/utils';
import { convertErrors, generateErrorMap, IErrorMap } from '../../helpers/errorHandlers';
import DerivedMeasureTitleSuffixFactory from '../../factory/DerivedMeasureTitleSuffixFactory';

export { Requireable };

const {
    AfmUtils,
    ExecuteAfmAdapter,
    toAfmResultSpec,
    createSubject
} = DataLayer;

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
    sdk?: SDK;
    uri?: string;
    identifier?: string;
    locale?: Localization.ILocale;
    config?: IChartConfig;
    filters?: AFM.FilterItem[];
    drillableItems?: IDrillableItem[];
    uriResolver?: (sdk: SDK, projectId: string, uri?: string, identifier?: string) => Promise<string>;
    fetchVisObject?: (sdk: SDK, visualizationUri: string) => Promise<VisualizationObject.IVisualizationObject>;
    fetchVisualizationClass?: (sdk: SDK, visualizationUri: string) => Promise<VisualizationClass.IVisualizationClass>;
    BaseChartComponent?: any;
    TableComponent?: any;
    HeadlineComponent?: any;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    onLegendReady?: OnLegendReady;
}

export interface IVisualizationState {
    isLoading: boolean;
    resultSpec: AFM.IResultSpec;
    type: VisType;
    totals: VisualizationObject.IVisualizationTotal[];
    error?: RuntimeError;
    mdObject?: VisualizationObject.IVisualizationObject;
}

export interface IVisualizationExecInfo {
    dataSource: IDataSource;
    resultSpec: AFM.IResultSpec;
    type: VisType;
    totals: VisualizationObject.IVisualizationTotal[];
    mdObject: VisualizationObject.IVisualizationObject;
}

function uriResolver(sdk: SDK, projectId: string, uri?: string, identifier?: string): Promise<string> {
    if (uri) {
        return Promise.resolve(uri);
    }

    if (!identifier) {
        return Promise.reject('Neither uri or identifier specified');
    }

    return sdk.md.getObjectUri(projectId, identifier);
}

function fetchVisObject(sdk: SDK, visualizationUri: string): Promise<VisualizationObject.IVisualizationObject> {
    return sdk.xhr.get(visualizationUri)
        .then((response: ApiResponse) => response.data.visualizationObject);
}

function fetchVisualizationClass(
    sdk: SDK,
    visualizationClassUri: string
): Promise<VisualizationClass.IVisualizationClass> {
    return sdk.xhr.get(visualizationClassUri)
        .then((response: ApiResponse) => response.data.visualizationClass);
}

export class VisualizationWrapped
    extends React.Component<IVisualizationProps & InjectedIntlProps, IVisualizationState> {
    public static propTypes = {
        ...VisualizationPropType,
        intl: intlShape.isRequired
    };

    public static defaultProps: Partial<IVisualizationProps> = {
        onError: noop,
        onLegendReady: noop,
        filters: [],
        uriResolver,
        fetchVisObject,
        fetchVisualizationClass,
        BaseChartComponent: BaseChart,
        TableComponent: SortableTable,
        HeadlineComponent: Headline,
        ErrorComponent,
        LoadingComponent
    };

    private visualizationUri: string;
    private adapter: DataLayer.ExecuteAfmAdapter;
    private dataSource: IDataSource;

    private subject: ISubject<Promise<IVisualizationExecInfo>>;

    private errorMap: IErrorMap;

    private sdk: SDK;

    constructor(props: IVisualizationProps & InjectedIntlProps) {
        super(props);

        this.state = {
            isLoading: true,
            type: null,
            resultSpec: null,
            totals: [],
            error: null,
            mdObject: null
        };

        const sdk = props.sdk || createSdk();
        this.sdk = sdk.clone();
        setTelemetryHeaders(this.sdk, 'Visualization', props);

        this.visualizationUri = props.uri;

        this.errorMap = generateErrorMap(props.intl);

        this.subject = createSubject<IVisualizationExecInfo>(
            ({ type, resultSpec, dataSource, totals, mdObject }) => {
                this.dataSource = dataSource;
                this.setState({
                    type,
                    resultSpec,
                    isLoading: false,
                    totals,
                    mdObject
                });
            }, (error) => {
                const runtimeError = convertErrors(error);
                this.setState({
                    isLoading: false,
                    error: runtimeError
                });
                return props.onError(runtimeError);
            });
    }

    public componentDidMount() {
        const { projectId, uri, identifier, filters } = this.props;

        this.adapter = new ExecuteAfmAdapter(this.sdk, projectId);
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

    public componentWillReceiveProps(nextProps: IVisualizationProps & InjectedIntlProps) {
        if (nextProps.sdk && this.sdk !== nextProps.sdk) {
            this.sdk = nextProps.sdk.clone();
            setTelemetryHeaders(this.sdk, 'Visualization', nextProps);
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
                nextProps.filters
            );
        }
    }

    public render() {
        const { dataSource } = this;
        const {
            drillableItems,
            onFiredDrillEvent,
            onLegendReady,
            onError,
            onLoadingChanged,
            locale,
            config,
            intl,
            BaseChartComponent,
            TableComponent,
            HeadlineComponent,
            LoadingComponent,
            ErrorComponent
        } = this.props;
        const { resultSpec, type, totals, error, isLoading, mdObject } = this.state;
        const finalConfig = {
            ...config,
            mdObject: mdObject && mdObject.content
        };

        if (error) {
            const errorProps = this.errorMap[error.getMessage()];

            return ErrorComponent
                ? (
                    <ErrorComponent
                        code={error.getMessage()}
                        message={intl.formatMessage({ id: 'visualization.ErrorMessageGeneric' })}
                        description={intl.formatMessage({ id: 'visualization.ErrorDescriptionGeneric' })}
                        {...errorProps}
                    />
                )
                : null;
        }
        if (isLoading || !dataSource) {
            return LoadingComponent
                ? <LoadingComponent/>
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
                        config={finalConfig}
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
                        config={finalConfig}
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
                        onLegendReady={onLegendReady}
                        LoadingComponent={LoadingComponent}
                        ErrorComponent={ErrorComponent}
                        locale={locale}
                        type={type}
                        config={finalConfig}
                    />
                );
        }
    }

    private prepareDataSources(
        projectId: string,
        identifier: string,
        filters: AFM.FilterItem[] = []
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

                    const suffixFactory = new DerivedMeasureTitleSuffixFactory(this.props.locale);
                    const processedVisualizationObject
                        = fillDerivedMeasuresTitlesAndAliases(mdObject.content, suffixFactory);
                    const { afm, resultSpec } = toAfmResultSpec(processedVisualizationObject);

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
                                totals: mdObjectTotals,
                                mdObject
                            };
                        });
                });
            });
        this.subject.next(promise);
    }
}

export const IntlVisualization = injectIntl(VisualizationWrapped);

/**
 * [Visualization](http://sdk.gooddata.com/gooddata-ui/docs/react_components.html#visualization)
 * is a component that renders saved visualization based on projectId and either identifier or uri
 */
export class Visualization extends React.PureComponent<IVisualizationProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlVisualization {...this.props}/>
            </IntlWrapper>
        );
    }
}
