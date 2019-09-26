// (C) 2019 GoodData Corporation
import React from "react";

import { PluggableBarChart, IVisualization } from "@gooddata/sdk-ui";
import { IAnalyticalBackend, IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IInsight, IFilter, AttributeOrMeasure, IBucket } from "@gooddata/sdk-model";

import "./Visualization.css";

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
    forItems = (items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution => {
        const mergedFilters = mergeFilters(this.presetFilters, filters);
        return this.factory.forItems(items, mergedFilters);
    };
    forBuckets = (buckets: IBucket[], filters?: IFilter[]): IPreparedExecution => {
        const mergedFilters = mergeFilters(this.presetFilters, filters);
        return this.factory.forBuckets(buckets, mergedFilters);
    };
    forInsight = (insight: IInsight, filters?: IFilter[]): IPreparedExecution => {
        const mergedFilters = mergeFilters(this.presetFilters, filters);
        return this.factory.forInsight(insight, mergedFilters);
    };
    forInsightByRef = (uri: string, filters?: IFilter[]): Promise<IPreparedExecution> => {
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

    setup = async () => {
        this.insight = await this.getInsight();
        this.visualization = new PluggableBarChart({
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

    getInsight = async () => {
        // should we allow for getting insights by URI?
        return await this.props.backend
            .workspace(this.props.workspace)
            .metadata()
            .getInsight(this.props.id);
    };

    getExecutionFactory = () => {
        return new ExecutionFactoryWithPresetFilters(
            this.props.backend.workspace(this.props.workspace).execution(),
            this.props.filters,
        );
    };

    componentDidMount(): void {
        this.setup();
    }

    render(): React.ReactNode {
        return (
            <>
                HERE
                <div className="visualization-uri-root" id={this.elementId} />
            </>
        );
    }
}
