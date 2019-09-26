// (C) 2019 GoodData Corporation
import React from "react";

import { PluggableBarChart, IVisualization } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";

import "./Visualization.css";

interface IVisualizationProps {
    backend: IAnalyticalBackend;
    workspace: string;
    uri: string;
}

export class Visualization extends React.Component<IVisualizationProps> {
    private elementId = "really-random-string"; // TODO
    private visualization: IVisualization;
    private insight: IInsight;

    constructor(props: IVisualizationProps) {
        super(props);

        this.visualization = new PluggableBarChart({
            backend: props.backend,
            callbacks: {
                pushData: () => {},
            },
            configPanelElement: "nonexistent",
            element: `#${this.elementId}`,
            projectId: props.workspace,
            visualizationProperties: {},
        });

        // TODO get this from backend using the uri from props
        this.insight = {
            insight: {
                buckets: [
                    {
                        items: [
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                uri: "/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/392",
                                            },
                                        },
                                    },
                                    format: "#,##0.00",
                                    localIdentifier: "8d132aa76b474f41beda17c0a0d05776",
                                    title: "Sum of Calls",
                                },
                            },
                        ],
                        localIdentifier: "measures",
                    },
                ],
                filters: [],
                identifier: "abgkddfHcFon",
                properties: {},
                sorts: [],
                title: "DHO-uri test",
                visualizationClassIdentifier: "gdc.visualization.bar",
            },
        };
    }

    getVisualizationClasses = async () => {
        const x = await this.props.backend
            .workspace(this.props.workspace)
            .metadata()
            .getVisualizationClasses();

        console.log("XXX", x);
    };

    componentDidMount(): void {
        this.getVisualizationClasses();

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
    }

    render(): React.ReactNode {
        const { props } = this;

        return (
            <>
                HERE
                <div className="visualization-uri-root" id={this.elementId} />
            </>
        );
    }
}
