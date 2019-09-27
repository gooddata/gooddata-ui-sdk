// (C) 2019 GoodData Corporation
import * as React from "react";
import * as uuid from "uuid";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IFilter,
    insightProperties,
    insightVisualizationClassIdentifier,
} from "@gooddata/sdk-model";

import { IVisualization, ILocale } from "../internal/interfaces/Visualization";
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
import { LoadingComponent } from "../base/simple/LoadingComponent";
import { RuntimeError } from "../base/errors/RuntimeError";
import { ErrorComponent } from "../base/simple/ErrorComponent";

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
    const split = visClassIdentifier.split(".");
    const key = split[split.length - 1] as keyof typeof VisualizationsCatalog;
    return VisualizationsCatalog[key];
};

interface IVisualizationProps {
    backend: IAnalyticalBackend;
    filters?: IFilter[];
    id: string;
    locale?: string;
    workspace: string;
}

interface IVisualizationState {
    isLoading: boolean;
    error: RuntimeError | undefined;
}

const getElementId = () => `gd-vis-${uuid.v4()}`;

export class Visualization extends React.Component<IVisualizationProps, IVisualizationState> {
    private elementId = getElementId();
    private visualization: IVisualization | undefined;
    private insight: IInsight | undefined;

    public static defaultProps: Partial<IVisualizationProps> = {
        filters: [],
    };

    public state: IVisualizationState = {
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

    private setError = (error: RuntimeError | undefined) => {
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
                locale: this.props.locale as ILocale,
                dimensions: {
                    height: 300, // this.props.height,
                },
                custom: {},
                // custom: {
                //     stickyHeaderOffset: this.props.stickyHeaderOffset,
                //     drillableItems: this.props.drillableItems,
                //     totalsEditAllowed: this.props.totalsEditAllowed,
                // },
                // config: this.props.config,
            },
            this.insight,
            this.getExecutionFactory(),
        );
    };

    public setupVisualization = async () => {
        this.startLoading();

        this.insight = await this.getInsight();

        if (!this.insight) {
            // the visualization we may have from earlier is no longer valid -> get rid of it
            this.unmountVisualization();
            return;
        }

        const Visualization = getVisualizationForInsight(this.insight);

        this.visualization = new Visualization({
            backend: this.props.backend,
            callbacks: {
                onError: this.setError,
                onLoadingChanged: ({ isLoading }) => {
                    return isLoading ? this.startLoading() : this.stopLoading();
                },
                pushData: () => {},
            },
            configPanelElement: "nonexistent",
            element: `#${this.elementId}`,
            locale: this.props.locale as ILocale,
            projectId: this.props.workspace,
            visualizationProperties: insightProperties(this.insight),
        });
    };

    public getInsight = async () => {
        // should we allow for getting insights by URI?
        try {
            return await this.props.backend
                .workspace(this.props.workspace)
                .metadata()
                .getInsight(this.props.id);
        } catch (e) {
            this.setError(new RuntimeError(e.message, e));
            this.stopLoading();
            return undefined;
        }
    };

    public getExecutionFactory = () => {
        return new ExecutionFactoryWithPresetFilters(
            this.props.backend.workspace(this.props.workspace).execution(),
            this.props.filters,
        );
    };

    private componentDidMountInner = async () => {
        await this.setupVisualization();
        return this.updateVisualization();
    };

    public componentDidMount(): void {
        this.componentDidMountInner();
    }

    private componentDidUpdateInner = async (prevProps: IVisualizationProps) => {
        const needsNewSetup = this.props.id !== prevProps.id || this.props.workspace !== prevProps.workspace;
        if (needsNewSetup) {
            await this.setupVisualization();
        }

        return this.updateVisualization();
    };

    public componentDidUpdate(prevProps: IVisualizationProps): void {
        this.componentDidUpdateInner(prevProps);
    }

    public componentWillUnmount() {
        this.unmountVisualization();
    }

    public render(): React.ReactNode {
        return (
            <div>
                HERE
                <style>
                    {`/* hack to see the contents */
.visualization-uri-root div div {
    height: 400px;
}`}
                </style>
                {this.state.isLoading && <LoadingComponent />}
                {this.state.error && <ErrorComponent message={this.state.error.message} />}
                <div className="visualization-uri-root" id={this.elementId} />
            </div>
        );
    }
}
