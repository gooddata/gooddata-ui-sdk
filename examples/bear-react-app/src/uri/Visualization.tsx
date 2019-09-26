// (C) 2019 GoodData Corporation
import React from "react";

import { PluggableBarChart, IVisualization } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";

import "./Visualization.css";

interface IVisualizationProps {
    backend: IAnalyticalBackend;
    id: string;
    workspace: string;
}

export class Visualization extends React.Component<IVisualizationProps> {
    private elementId = "really-random-string"; // TODO
    private visualization!: IVisualization; // TODO exclamation mark
    private insight!: IInsight; // TODO exclamation mark

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
            this.props.backend.workspace(this.props.workspace).execution(),
        );
    };

    getInsight = async () => {
        // should we allow for getting insights by URI?
        return await this.props.backend
            .workspace(this.props.workspace)
            .metadata()
            .getInsight(this.props.id);
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
