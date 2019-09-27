// (C) 2019 GoodData Corporation
import * as React from "react";

import { IAnalyticalBackend, IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IInsight, IFilter, AttributeOrMeasure, IBucket } from "@gooddata/sdk-model";

import { IVisualization } from "../internal/interfaces/Visualization";
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

const getVisualizationFromVisualizationClassIdentifier = (visClassIdentifier: string) => {
    const split = visClassIdentifier.split(".");
    const key = split[split.length - 1] as keyof typeof VisualizationsCatalog;
    return VisualizationsCatalog[key];
};

interface IVisualizationProps {
    backend: IAnalyticalBackend;
    filters?: IFilter[];
    id: string;
    workspace: string;
}

const mergeFilters = (filtersA: IFilter[], filtersB: IFilter[] | undefined): IFilter[] => {
    return [...filtersA, ...(filtersB || [])]; // TODO actually implement the merging logic -> executionDefinition.ts r137
};

class ExecutionFactoryWithPresetFilters implements IExecutionFactory {
    constructor(
        private readonly factory: IExecutionFactory,
        private readonly presetFilters: IFilter[] = [],
    ) {}
    public forItems = (items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution => {
        const mergedFilters = mergeFilters(this.presetFilters, filters);
        return this.factory.forItems(items, mergedFilters);
    };
    public forBuckets = (buckets: IBucket[], filters?: IFilter[]): IPreparedExecution => {
        const mergedFilters = mergeFilters(this.presetFilters, filters);
        return this.factory.forBuckets(buckets, mergedFilters);
    };
    public forInsight = (insight: IInsight, filters?: IFilter[]): IPreparedExecution => {
        const mergedFilters = mergeFilters(this.presetFilters, filters);
        return this.factory.forInsight(insight, mergedFilters);
    };
    public forInsightByRef = (uri: string, filters?: IFilter[]): Promise<IPreparedExecution> => {
        const mergedFilters = mergeFilters(this.presetFilters, filters);
        return this.factory.forInsightByRef(uri, mergedFilters);
    };
}

export class Visualization extends React.Component<IVisualizationProps> {
    private elementId = "really-random-string"; // TODO
    private visualization!: IVisualization; // TODO exclamation mark
    private insight!: IInsight; // TODO exclamation mark

    public static defaultProps: Partial<IVisualizationProps> = {
        filters: [],
    };

    public setup = async () => {
        this.insight = await this.getInsight();

        const Visualization = getVisualizationFromVisualizationClassIdentifier(
            this.insight.insight.visualizationClassIdentifier,
        );

        this.visualization = new Visualization({
            backend: this.props.backend,
            callbacks: {
                pushData: () => {},
            },
            configPanelElement: "nonexistent",
            element: `#${this.elementId}`,
            projectId: this.props.workspace,
            visualizationProperties: {},
        });

        this.visualization.update(
            {
                locale: "en-US", // this.props.locale,
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

    public getInsight = async () => {
        // should we allow for getting insights by URI?
        return this.props.backend
            .workspace(this.props.workspace)
            .metadata()
            .getInsight(this.props.id);
    };

    public getExecutionFactory = () => {
        return new ExecutionFactoryWithPresetFilters(
            this.props.backend.workspace(this.props.workspace).execution(),
            this.props.filters,
        );
    };

    public componentDidMount(): void {
        this.setup();
    }

    public render(): React.ReactNode {
        return (
            <>
                HERE
                <style>
                    {`/* hack to see the contents */
.visualization-uri-root div div {
    height: 400px;
}`}
                </style>
                <div className="visualization-uri-root" id={this.elementId} />
            </>
        );
    }
}
