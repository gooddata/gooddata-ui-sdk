// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import {
    SDK,
    factory as createSdk,
    DataLayer,
    ApiResponse,
    IPropertiesControls,
    IFeatureFlags,
} from "@gooddata/gooddata-js";
import get = require("lodash/get");
import noop = require("lodash/noop");
import isEqual = require("lodash/isEqual");
import { AFM, VisualizationObject, VisualizationClass, Localization } from "@gooddata/typings";
import { injectIntl, intlShape, InjectedIntlProps } from "react-intl";
import { IHeaderPredicate } from "../../interfaces/HeaderPredicate";
import { IntlWrapper } from "../core/base/IntlWrapper";
import { BaseChart } from "../core/base/BaseChart";
import { IChartConfig, IColorPaletteItem } from "../../interfaces/Config";
import { SortableTable } from "../core/SortableTable";
import { PivotTable } from "../PivotTable";
import { Headline } from "../core/Headline";
import { IEvents, OnLegendReady } from "../../interfaces/Events";
import { VisualizationPropType, Requireable } from "../../proptypes/Visualization";
import { VisualizationTypes, VisType } from "../../constants/visualizationTypes";
import { IDataSource } from "../../interfaces/DataSource";
import { ISubject } from "../../helpers/async";
import { getVisualizationTypeFromVisualizationClass } from "../../helpers/visualizationType";
import MdObjectHelper, { mdObjectToPivotBucketProps } from "../../helpers/MdObjectHelper";
import { fillMissingTitles } from "../../helpers/measureTitleHelper";
import { LoadingComponent, ILoadingProps } from "../simple/LoadingComponent";
import { ErrorComponent, IErrorProps } from "../simple/ErrorComponent";
import { IDrillableItem, generateDimensions, RuntimeError } from "../../";
import { setTelemetryHeaders } from "../../helpers/utils";
import { getDefaultTreemapSort } from "../../helpers/sorts";
import { convertErrors, generateErrorMap, IErrorMap } from "../../helpers/errorHandlers";
import { isTreemap } from "../visualizations/utils/common";
import { getColorMappingPredicate, getColorPaletteFromColors } from "../visualizations/utils/color";
import { getCachedOrLoad } from "../../helpers/sdkCache";
import { getFeatureFlags } from "../../helpers/featureFlags";
import { mergeFiltersToAfm } from "../../helpers/afmHelper";
export { Requireable };

const { ExecuteAfmAdapter, toAfmResultSpec, createSubject } = DataLayer;

export type VisualizationEnvironment = "none" | "dashboards";

export interface IVisualizationProps extends IEvents {
    projectId: string;
    sdk?: SDK;
    uri?: string;
    identifier?: string;
    locale?: Localization.ILocale;
    config?: IChartConfig;
    filters?: AFM.FilterItem[];
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    uriResolver?: (sdk: SDK, projectId: string, uri?: string, identifier?: string) => Promise<string>;
    fetchVisObject?: (
        sdk: SDK,
        visualizationUri: string,
    ) => Promise<VisualizationObject.IVisualizationObject>;
    fetchVisualizationClass?: (
        sdk: SDK,
        visualizationUri: string,
    ) => Promise<VisualizationClass.IVisualizationClass>;
    getFeatureFlags?: (sdk: SDK, projectId: string) => Promise<IFeatureFlags>;
    BaseChartComponent?: any;
    TableComponent?: any;
    PivotTableComponent?: any;
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
    colorPalette: IColorPaletteItem[];
    colorPaletteEnabled: boolean;
    featureFlags: IFeatureFlags;
}

export interface IVisualizationExecInfo {
    dataSource: IDataSource;
    resultSpec: AFM.IResultSpec;
    featureFlags: IFeatureFlags;
    type: VisType;
    totals: VisualizationObject.IVisualizationTotal[];
    mdObject: VisualizationObject.IVisualizationObject;
}

function uriResolver(sdk: SDK, projectId: string, uri?: string, identifier?: string): Promise<string> {
    if (uri) {
        return Promise.resolve(uri);
    }

    if (!identifier) {
        return Promise.reject("Neither uri or identifier specified");
    }

    return sdk.md.getObjectUri(projectId, identifier);
}

function fetchVisObject(
    sdk: SDK,
    visualizationUri: string,
): Promise<VisualizationObject.IVisualizationObject> {
    return sdk.md.getVisualization(visualizationUri).then(res => res.visualizationObject);
}

function fetchVisualizationClass(
    sdk: SDK,
    visualizationClassUri: string,
): Promise<VisualizationClass.IVisualizationClass> {
    const apiCallIdentifier = `get.${visualizationClassUri}`;
    const loader = () => sdk.xhr.get(visualizationClassUri);
    return getCachedOrLoad(apiCallIdentifier, loader).then(
        (response: ApiResponse) => response.data.visualizationClass,
    );
}

export class VisualizationWrapped extends React.Component<
    IVisualizationProps & InjectedIntlProps,
    IVisualizationState
> {
    public static propTypes = {
        ...VisualizationPropType,
        intl: intlShape.isRequired,
    };

    public static defaultProps: Partial<IVisualizationProps> = {
        onError: noop,
        onLegendReady: noop,
        filters: [],
        uriResolver,
        fetchVisObject,
        fetchVisualizationClass,
        getFeatureFlags,
        BaseChartComponent: BaseChart,
        TableComponent: SortableTable,
        PivotTableComponent: PivotTable,
        HeadlineComponent: Headline,
        ErrorComponent,
        LoadingComponent,
        onExportReady: noop,
    };

    private visualizationUri: string;
    private adapter: DataLayer.ExecuteAfmAdapter;
    private dataSource: IDataSource;

    private subject: ISubject<Promise<IVisualizationExecInfo>>;

    private errorMap: IErrorMap;

    private exportTitle: string;

    private sdk: SDK;

    private isUnmounted: boolean;

    constructor(props: IVisualizationProps & InjectedIntlProps) {
        super(props);

        this.state = {
            isLoading: true,
            type: null,
            resultSpec: null,
            totals: [],
            error: null,
            mdObject: null,
            colorPalette: null,
            colorPaletteEnabled: false,
            featureFlags: {},
        };

        this.sdk = props.sdk ? props.sdk.clone() : createSdk();
        setTelemetryHeaders(this.sdk, "Visualization", props);

        this.isUnmounted = false;
        this.visualizationUri = props.uri;

        this.errorMap = generateErrorMap(props.intl);

        this.subject = createSubject<IVisualizationExecInfo>(
            ({ type, resultSpec, dataSource, totals, mdObject, featureFlags }) => {
                this.dataSource = dataSource;
                this.setStateWithCheck({
                    type,
                    resultSpec,
                    isLoading: false,
                    totals,
                    mdObject,
                    featureFlags,
                });
            },
            error => {
                const runtimeError = convertErrors(error);
                this.setStateWithCheck({
                    isLoading: false,
                    error: runtimeError,
                });
                return props.onError(runtimeError);
            },
        );
    }

    public componentDidMount() {
        const { projectId, uri, identifier, filters } = this.props;

        this.adapter = new ExecuteAfmAdapter(this.sdk, projectId);
        this.visualizationUri = uri;

        this.subject.next(this.prepareDataSources(projectId, identifier, filters));

        this.getColorPalette();
    }

    public componentWillUnmount() {
        this.subject.unsubscribe();
        this.isUnmounted = true;
    }

    public shouldComponentUpdate(nextProps: IVisualizationProps, nextState: IVisualizationState) {
        return (
            this.hasChangedProps(nextProps) ||
            this.state.isLoading !== nextState.isLoading ||
            (!this.state.colorPalette && nextState.colorPalette !== null)
        );
    }

    public hasChangedProps(
        nextProps: IVisualizationProps,
        propKeys = Object.keys(VisualizationPropType),
    ): boolean {
        return propKeys.some(propKey => !isEqual(this.props[propKey], nextProps[propKey]));
    }

    public componentWillReceiveProps(nextProps: IVisualizationProps & InjectedIntlProps) {
        if (nextProps.sdk && this.props.sdk !== nextProps.sdk) {
            this.sdk = nextProps.sdk.clone();
            setTelemetryHeaders(this.sdk, "Visualization", nextProps);
            this.getColorPalette();
        }
        const hasInvalidResolvedUri = this.hasChangedProps(nextProps, ["uri", "projectId", "identifier"]);
        const hasInvalidDatasource = hasInvalidResolvedUri || this.hasChangedProps(nextProps, ["filters"]);
        if (hasInvalidDatasource) {
            this.setStateWithCheck({
                isLoading: true,
            });
            if (hasInvalidResolvedUri) {
                this.visualizationUri = nextProps.uri;
            }

            this.subject.next(
                this.prepareDataSources(nextProps.projectId, nextProps.identifier, nextProps.filters),
            );
        }
    }

    public render() {
        const { dataSource } = this;
        const {
            projectId,
            drillableItems,
            onFiredDrillEvent,
            onLegendReady,
            onError,
            onLoadingChanged,
            locale,
            config: baseConfig,
            intl,
            BaseChartComponent,
            TableComponent,
            PivotTableComponent,
            HeadlineComponent,
            LoadingComponent,
            ErrorComponent,
            onExportReady,
            filters: filtersFromProps,
        } = this.props;
        const { resultSpec, type, totals, error, isLoading, mdObject } = this.state;
        const mdObjectContent = mdObject && mdObject.content;
        const properties: IPropertiesControls | undefined =
            mdObjectContent && mdObjectContent.properties && JSON.parse(mdObjectContent.properties).controls;

        const colorPalette =
            baseConfig && baseConfig.colorPalette ? baseConfig.colorPalette : this.state.colorPalette;

        const colorMapping =
            properties && properties.colorMapping
                ? properties.colorMapping.map(mapping => {
                      const predicate = getColorMappingPredicate(mapping.id);
                      return {
                          predicate,
                          color: mapping.color,
                      };
                  })
                : undefined;

        const config = {
            ...properties,
            colorMapping,
            ...baseConfig,
            colorPalette,
            mdObject: mdObjectContent,
        };

        if (error) {
            const errorProps = this.errorMap[error.getMessage()];

            return ErrorComponent ? (
                <ErrorComponent
                    code={error.getMessage()}
                    message={intl.formatMessage({ id: "visualization.ErrorMessageGeneric" })}
                    description={intl.formatMessage({ id: "visualization.ErrorDescriptionGeneric" })}
                    {...errorProps}
                />
            ) : null;
        }
        if (isLoading || !dataSource) {
            return LoadingComponent ? <LoadingComponent /> : null;
        }

        const commonProps = {
            projectId,
            drillableItems,
            onFiredDrillEvent,
            onError,
            onLoadingChanged,
            LoadingComponent,
            ErrorComponent,
            locale,
            config,
            exportTitle: this.exportTitle,
            onExportReady,
        };

        const sourceProps = {
            resultSpec,
            dataSource,
        };

        switch (type) {
            case VisualizationTypes.TABLE:
                return <TableComponent {...commonProps} {...sourceProps} totals={totals} />;
            case VisualizationTypes.PIVOT_TABLE: {
                const pivotBucketProps = mdObjectToPivotBucketProps(mdObject, filtersFromProps);
                // we do not need to pass totals={totals} because BucketPivotTable deals with changes in totals itself
                return <PivotTableComponent {...commonProps} {...pivotBucketProps} />;
            }
            case VisualizationTypes.HEADLINE:
                return <HeadlineComponent {...commonProps} {...sourceProps} />;
            default:
                return (
                    <BaseChartComponent
                        {...commonProps}
                        {...sourceProps}
                        onLegendReady={onLegendReady}
                        type={type}
                    />
                );
        }
    }

    public async prepareDataSources(
        projectId: string,
        identifier: string,
        filters: AFM.FilterItem[] = [],
    ): Promise<IVisualizationExecInfo> {
        const { uriResolver, fetchVisObject, fetchVisualizationClass, locale, getFeatureFlags } = this.props;

        const visualizationUri = await uriResolver(this.sdk, projectId, this.visualizationUri, identifier);
        this.visualizationUri = visualizationUri;

        const mdObject = await fetchVisObject(this.sdk, visualizationUri);

        const visualizationClassUri: string = MdObjectHelper.getVisualizationClassUri(mdObject);

        this.exportTitle = get(mdObject, "meta.title", "");

        const visualizationClass = await fetchVisualizationClass(this.sdk, visualizationClassUri);
        const processedVisualizationObject = fillMissingTitles(mdObject.content, locale);

        const mdObjectTotals = MdObjectHelper.getTotals(mdObject);

        const { afm: afmWithoutMergedFilters, resultSpec: resultSpecSorting } = toAfmResultSpec(
            processedVisualizationObject,
        );

        const afm = mergeFiltersToAfm(afmWithoutMergedFilters, filters);

        const featureFlags = await getFeatureFlags(this.sdk, projectId);

        const visualizationType: VisType = await getVisualizationTypeFromVisualizationClass(
            visualizationClass,
            featureFlags,
        );
        // keep resultSpec creation in sync with AD
        const resultSpecWithDimensions = {
            ...resultSpecSorting,
            dimensions: generateDimensions(mdObject.content, visualizationType),
        };
        const treemapDefaultSorting = isTreemap(visualizationType)
            ? {
                  sorts: getDefaultTreemapSort(afm, resultSpecWithDimensions),
              }
            : {};
        const resultSpec = {
            ...resultSpecWithDimensions,
            ...treemapDefaultSorting,
        };

        const dataSource = await this.adapter.createDataSource(afm);

        return {
            type: visualizationType,
            dataSource,
            resultSpec,
            totals: mdObjectTotals,
            mdObject,
            featureFlags,
        };
    }

    private hasExternalColorPalette() {
        return this.props.config && this.props.config.colorPalette;
    }

    private hasColorsProp() {
        return this.props.config && this.props.config.colors;
    }

    private getColorPaletteFromProject() {
        const apiCallIdentifier = `getColorPaletteWithGuids.${this.props.projectId}`;
        const loader = () => this.sdk.project.getColorPaletteWithGuids(this.props.projectId);
        return getCachedOrLoad(apiCallIdentifier, loader);
    }

    private async getColorPalette() {
        if (!this.isUnmounted) {
            if (this.hasExternalColorPalette()) {
                return;
            } else if (this.hasColorsProp()) {
                this.setStateWithCheck({
                    colorPalette: getColorPaletteFromColors(this.props.config.colors),
                });
            } else {
                const colorPalette = await this.getColorPaletteFromProject();

                if (colorPalette) {
                    this.setStateWithCheck({ colorPalette });
                }
            }
        }
    }

    private setStateWithCheck(newState: any, callBack?: () => void) {
        if (!this.isUnmounted) {
            this.setState(newState, callBack);
        }
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
                <IntlVisualization {...this.props} />
            </IntlWrapper>
        );
    }
}
