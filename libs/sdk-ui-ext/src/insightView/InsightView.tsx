// (C) 2019 GoodData Corporation
import React from "react";
import uuid from "uuid";
import { render } from "react-dom";
import noop from "lodash/noop";
import isEqual from "lodash/isEqual";

import { IAnalyticalBackend, IExportResult, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IFilter,
    insightProperties,
    IColorPalette,
    ObjRef,
    idRef,
    insightTitle,
} from "@gooddata/sdk-model";

import { IVisualization, IVisCallbacks, FullVisualizationCatalog, IVisProps } from "../internal";
import { ExecutionFactoryWithPresetFilters } from "./ExecutionFactoryWithPresetFilters";
import {
    GoodDataSdkError,
    fillMissingTitles,
    ignoreTitlesForSimpleMeasures,
    ILocale,
    withContexts,
    DefaultLocale,
    LoadingComponent,
    ILoadingProps,
    ErrorComponent,
    IErrorProps,
    IDrillableItem,
    IExportFunction,
    IExtendedExportConfig,
} from "@gooddata/sdk-ui";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { IGeoConfig } from "@gooddata/sdk-ui-geo";
import { IPivotTableConfig } from "@gooddata/sdk-ui-pivot";
import { IInsightViewDataLoader, getInsightViewDataLoader } from "./dataLoaders";

/**
 * @public
 */
export interface IInsightViewProps extends Partial<IVisCallbacks> {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Reference to the insight to render. This can be specified by either object reference using URI or using identifier.
     *
     * For convenience it is also possible to specify just the identifier of the insight.
     */
    insight: ObjRef | string;

    /**
     * Additional filters to apply on top of the insight.
     */
    filters?: IFilter[];

    /**
     * Configure chart drillability; e.g. which parts of the charts can be clicked.
     */
    drillableItems?: IDrillableItem[];

    /**
     * Configure color palette to use for the chart. If you do not specify this, then the palette will be
     * obtained from style settings stored on the backend.
     */
    colorPalette?: IColorPalette;

    /**
     * When embedding insight rendered by a chart, you can specify extra options to merge with existing
     * options saved for the insight.
     */
    config?: IChartConfig | IGeoConfig | IPivotTableConfig | any;

    /**
     * Locale to use for localization of texts appearing in the chart.
     *
     * Note: text values coming from the data itself are not localized.
     */
    locale?: ILocale;

    /**
     * Component to render if embedding fails.
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the insight is loading.
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}

interface IInsightViewState {
    isLoading: boolean;
    error: GoodDataSdkError | undefined;
}

const getElementId = () => `gd-vis-${uuid.v4()}`;

class RenderInsightView extends React.Component<IInsightViewProps, IInsightViewState> {
    private elementId = getElementId();
    private visualization: IVisualization | undefined;
    private insight: IInsight | undefined;
    private colorPalette: IColorPalette | undefined;
    private settings: IWorkspaceSettings | undefined;
    private containerRef = React.createRef<HTMLDivElement>();
    private locale: string | undefined;

    public static defaultProps: Partial<IInsightViewProps> = {
        ErrorComponent,
        filters: [],
        drillableItems: [],
        LoadingComponent,
        pushData: noop,
    };

    public state: IInsightViewState = {
        isLoading: false,
        error: undefined,
    };

    private startLoading = () => {
        this.setIsLoading(true);
        this.setError(undefined);
    };

    private stopLoading = () => {
        this.setIsLoading(false);
    };

    private setIsLoading = (isLoading: boolean) => {
        if (this.state.isLoading !== isLoading) {
            this.setState({ isLoading });
        }
    };

    private setError = (error: GoodDataSdkError | undefined) => {
        if (this.state.error !== error) {
            this.setState({ error });
        }
    };

    private unmountVisualization = () => {
        if (this.visualization) {
            this.visualization.unmount();
        }
        this.visualization = undefined;
    };

    private updateVisualization = () => {
        // if the container no longer exists, update was called after unmount -> do nothing
        if (!this.visualization || !this.containerRef.current) {
            return;
        }

        const { config = {} } = this.props;

        const visProps: IVisProps = {
            locale: this.getLocale(),
            custom: {
                drillableItems: this.props.drillableItems,
            },
            config: {
                separators: config.separators,
                colorPalette: this.colorPalette,
                mapboxToken: config.mapboxToken,
                isInEditMode: false,
            },
            customVisualizationConfig: config,
        };

        this.visualization.update(
            visProps,
            ignoreTitlesForSimpleMeasures(fillMissingTitles(this.insight, this.getLocale())),
            {},
            this.getExecutionFactory(),
        );
    };

    private setupVisualization = async () => {
        this.startLoading();

        // the visualization we may have from earlier is no longer valid -> get rid of it
        this.unmountVisualization();

        this.insight = await this.getInsight();
        this.locale = await this.getUserProfileLocale();

        [this.insight, this.locale] = await Promise.all([this.getInsight(), this.getUserProfileLocale()]);

        if (!this.insight) {
            return;
        }

        const visualizationFactory = FullVisualizationCatalog.forInsight(this.insight);

        this.visualization = visualizationFactory({
            backend: this.props.backend,
            callbacks: {
                onError: (error) => {
                    this.setError(error);
                    if (this.props.onError) {
                        this.props.onError(error);
                    }
                },
                onLoadingChanged: ({ isLoading }) => {
                    if (isLoading) {
                        this.startLoading();
                    } else {
                        this.stopLoading();
                    }

                    if (this.props.onLoadingChanged) {
                        this.props.onLoadingChanged({ isLoading });
                    }
                },
                pushData: this.props.pushData,
                onDrill: this.props.onDrill,
                onExportReady: this.onExportReadyDecorator,
            },
            configPanelElement: ".gd-configuration-panel-content", // this is apparently a well-know constant (see BaseVisualization)
            element: `#${this.elementId}`,
            environment: "dashboards", // TODO get rid of this
            locale: this.getLocale(),
            projectId: this.props.workspace,
            visualizationProperties: insightProperties(this.insight),
            featureFlags: this.settings,
            renderFun: render,
        });
    };

    private getLocale = () => {
        return (this.props.locale || this.locale || DefaultLocale) as ILocale;
    };

    private onExportReadyDecorator = (exportFunction: IExportFunction): void => {
        if (!this.props.onExportReady) {
            return;
        }

        const decorator = (exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
            if (exportConfig.title || !this.insight) {
                return exportFunction(exportConfig);
            }

            return exportFunction({
                ...exportConfig,
                title: insightTitle(this.insight),
            });
        };

        this.props.onExportReady(decorator);
    };

    private getRemoteResource = async <T extends {}>(
        resourceObtainer: (loader: IInsightViewDataLoader) => Promise<T>,
    ) => {
        try {
            return await resourceObtainer(getInsightViewDataLoader(this.props.workspace));
        } catch (e) {
            this.setError(new GoodDataSdkError(e.message, e));
            this.stopLoading();
            return undefined;
        }
    };

    private getInsight = (): Promise<IInsight> => {
        const ref =
            typeof this.props.insight === "string"
                ? idRef(this.props.insight, "insight")
                : this.props.insight;

        return this.getRemoteResource((loader) => loader.getInsight(this.props.backend, ref));
    };

    private getColorPalette = (): Promise<IColorPalette> => {
        return this.getRemoteResource((loader) => loader.getColorPalette(this.props.backend));
    };

    private getWorkspaceSettings = (): Promise<IWorkspaceSettings> => {
        return this.getRemoteResource((loader) => loader.getWorkspaceSettings(this.props.backend));
    };

    private getUserProfileLocale = (): Promise<string> => {
        return this.getRemoteResource((loader) => loader.getLocale(this.props.backend));
    };

    private updateWorkspaceSettings = async () => {
        this.settings = await this.getWorkspaceSettings();
    };

    private updateColorPalette = async () => {
        if (this.props.colorPalette) {
            this.colorPalette = this.props.colorPalette;

            return;
        }

        this.colorPalette = await this.getColorPalette();
    };

    private getExecutionFactory = () => {
        return new ExecutionFactoryWithPresetFilters(
            this.props.backend.workspace(this.props.workspace).execution(),
            this.props.filters,
        );
    };

    private componentDidMountInner = async () => {
        await this.setupVisualization();
        await this.updateColorPalette();
        await this.updateWorkspaceSettings();

        return this.updateVisualization();
    };

    public componentDidMount(): void {
        this.componentDidMountInner();
    }

    private componentDidUpdateInner = async (prevProps: IInsightViewProps) => {
        const needsNewSetup =
            !isEqual(this.props.insight, prevProps.insight) || this.props.workspace !== prevProps.workspace;
        if (needsNewSetup) {
            await this.setupVisualization();
        }

        const needsNewColorPalette = this.props.workspace !== prevProps.workspace;
        if (needsNewColorPalette) {
            await this.updateColorPalette();
        }

        return this.updateVisualization();
    };

    public componentDidUpdate(prevProps: IInsightViewProps): void {
        this.componentDidUpdateInner(prevProps);
    }

    public componentWillUnmount() {
        this.unmountVisualization();
    }

    public render(): React.ReactNode {
        const { ErrorComponent, LoadingComponent } = this.props;
        return (
            <>
                {this.state.isLoading && <LoadingComponent />}
                {this.state.error && <ErrorComponent message={this.state.error.message} />}
                <div className="visualization-uri-root" id={this.elementId} ref={this.containerRef} />
            </>
        );
    }
}

/**
 * Renders insight which was previously created and saved in the Analytical Designer.
 *
 * @public
 */
export const InsightView = withContexts(RenderInsightView);
