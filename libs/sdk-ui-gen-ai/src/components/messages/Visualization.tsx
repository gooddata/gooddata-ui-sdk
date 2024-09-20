// (C) 2024 GoodData Corporation

import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { GenAIChatCreatedVisualization } from "@gooddata/sdk-model";
import { BaseChart } from "@gooddata/sdk-ui-charts";
import { useExecution } from "./useExecution.js";
import { ChartType } from "@gooddata/sdk-ui";

type VisualizationProps = {
    definition: GenAIChatCreatedVisualization;
};

export const Visualization: React.FC<VisualizationProps> = ({ definition }) => {
    const execution = useExecution(definition);

    return (
        <div className="gd-gen-ai-chat__messages__visualization">
            <BaseChart
                height={300}
                width={400}
                type={definition.visualizationType.toLowerCase() as ChartType}
                execution={execution}
            />
            <Typography tagName="p">{definition.title}</Typography>
        </div>
    );
};
