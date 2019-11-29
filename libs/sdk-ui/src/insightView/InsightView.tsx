// (C) 2019 GoodData Corporation
import * as React from "react";
import * as uuid from "uuid";
import last = require("lodash/last");
import noop = require("lodash/noop");

import { IAnalyticalBackend, IAnalyticalWorkspace } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IFilter,
    insightProperties,
    insightVisualizationClassIdentifier,
    IColorPalette,
} from "@gooddata/sdk-model";

import { IVisualization, IVisProps, IVisCallbacks } from "../internal/interfaces/Visualization";
import { PluggableBarChart } from "../internal/components/pluggableVisualizations/barChart/PluggableBarChart";
import { PluggableColumnChart } from "../internal/components/pluggableVisualizations/columnChart/PluggableColumnChart";
import { PluggableLineChart } from "../internal/components/pluggableVisualizations/lineChart/PluggableLineChart";
import { PluggableAreaChart } from "../internal/components/pluggableVisualizations/areaChart/PluggableAreaChart";
import { PluggablePieChart } from "../internal/components/pluggableVisualizations/pieChart/PluggablePieChart";
import { PluggableDonutChart } from "../internal/components/pluggableVisualizations/donutChart/PluggableDonutChart";
import { PluggableHeadline } from "../internal/components/pluggableVisualizations/headline/PluggableHeadline";
import { PluggableScatterPlot } from "../internal/components/pluggableVisualizations/scatterPlot/PluggableScatterPlot";
import { PluggableBubbleChart } from "../internal/components/pluggableVisualizations/bubbleChart/PluggableBubbleChart";
import { PluggableHeatmap } from "../internal/components/pluggableVisualizations/heatMap/PluggableHeatmap";
import { PluggableComboChartDeprecated } from "../internal/components/pluggableVisualizations/comboChart/PluggableComboChartDeprecated";
import { PluggableComboChart } from "../internal/components/pluggableVisualizations/comboChart/PluggableComboChart";
import { PluggableTreemap } from "../internal/components/pluggableVisualizations/treeMap/PluggableTreemap";
import { PluggableFunnelChart } from "../internal/components/pluggableVisualizations/funnelChart/PluggableFunnelChart";
import { ExecutionFactoryWithPresetFilters } from "./ExecutionFactoryWithPresetFilters";
import { ErrorComponent, IErrorProps } from "../base/simple/ErrorComponent";
import { LoadingComponent, ILoadingProps } from "../base/simple/LoadingComponent";
import { GoodDataSdkError } from "../base/errors/GoodDataSdkError";
import { fillMissingTitles } from "../base/helpers/measureTitleHelper";
import { DEFAULT_LOCALE } from "../base/constants/localization";
import { ILocale } from "../base/interfaces/Locale";

const VisualizationsCatalog = {
    bar: PluggableBarChart,
    column: PluggableColumnChart,
    line: PluggableLineChart,
    area: PluggableAreaChart,
    pie: PluggablePieChart,
    donut: PluggableDonutChart,
    // table: PluggablePivotTable,
    headline: PluggableHeadline,
    scatter: PluggableScatterPlot,
    bubble: PluggableBubbleChart,
    heatmap: PluggableHeatmap,
    combo: PluggableComboChartDeprecated, // old combo chart
    combo2: PluggableComboChart, // new combo chart
    treemap: PluggableTreemap,
    funnel: PluggableFunnelChart,
};

const getVisualizationForInsight = (insight: IInsight) => {
    const visClassIdentifier = insightVisualizationClassIdentifier(insight);
    // the identifiers follow the "local.visualizationType" format
    const split = visClassIdentifier.split(".");
    const key = last(split) as keyof typeof VisualizationsCatalog;
    return VisualizationsCatalog[key];
};

interface IInsightViewProps extends Partial<IVisCallbacks> {
    backend: IAnalyticalBackend;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    filters?: IFilter[];
    id: string;
    locale?: ILocale;
    LoadingComponent?: React.ComponentType<ILoadingProps>;
    visualizationProps?: IVisProps;
    workspace: string;
}

interface IInsightViewState {
    isLoading: boolean;
    error: GoodDataSdkError | undefined;
}

const getElementId = () => `gd-vis-${uuid.v4()}`;

export class InsightView extends React.Component<IInsightViewProps, IInsightViewState> {
    private elementId = getElementId();
    private visualization: IVisualization | undefined;
    private insight: IInsight | undefined;
    private colorPalette: IColorPalette | undefined;

    public static defaultProps: Partial<IInsightViewProps> = {
        ErrorComponent,
        filters: [],
        locale: DEFAULT_LOCALE,
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
        if (!this.visualization) {
            return;
        }

        this.visualization.update(
            {
                ...this.props.visualizationProps,
                config: {
                    ...(this.props.visualizationProps && this.props.visualizationProps.config),
                    colorPalette: this.colorPalette,
                },
            },
            fillMissingTitles(this.insight, this.props.locale),
            this.getExecutionFactory(),
        );
    };

    private setupVisualization = async () => {
        this.startLoading();

        // the visualization we may have from earlier is no longer valid -> get rid of it
        this.unmountVisualization();

        this.insight = await this.getInsight();

        if (!this.insight) {
            return;
        }

        const Visualization = getVisualizationForInsight(this.insight);

        this.visualization = new Visualization({
            backend: this.props.backend,
            callbacks: {
                onError: error => {
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
                onExportReady: this.props.onExportReady,
                onLoadingFinish: this.props.onLoadingFinish,
            },
            configPanelElement: ".gd-configuration-panel-content", // this is apparently a well-know constant (see BaseVisualization)
            element: `#${this.elementId}`,
            environment: "dashboards", // TODO get rid of this
            locale: this.props.visualizationProps ? this.props.visualizationProps.locale : undefined,
            projectId: this.props.workspace,
            visualizationProperties: insightProperties(this.insight),
        });
    };

    private getRemoteResource = async <T extends {}>(
        resourceObtainer: (workspace: IAnalyticalWorkspace) => Promise<T>,
    ) => {
        try {
            return await resourceObtainer(this.props.backend.workspace(this.props.workspace));
        } catch (e) {
            this.setError(new GoodDataSdkError(e.message, e));
            this.stopLoading();
            return undefined;
        }
    };

    private getInsight = () => {
        return this.getRemoteResource<IInsight>(workspace => workspace.metadata().getInsight(this.props.id));
    };

    private getColorPaletteFromProject = () => {
        return this.getRemoteResource<IColorPalette>(workspace => workspace.styling().colorPalette());
    };

    private updateColorPalette = async () => {
        if (
            this.props.visualizationProps &&
            this.props.visualizationProps.config &&
            this.props.visualizationProps.config.colorPalette
        ) {
            this.colorPalette = this.props.visualizationProps.config.colorPalette;
            return;
        }

        this.colorPalette = await this.getColorPaletteFromProject();
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
        return this.updateVisualization();
    };

    public componentDidMount(): void {
        this.componentDidMountInner();
    }

    private componentDidUpdateInner = async (prevProps: IInsightViewProps) => {
        const needsNewSetup = this.props.id !== prevProps.id || this.props.workspace !== prevProps.workspace;
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
                <div className="visualization-uri-root" id={this.elementId} />
            </>
        );
    }
}
