// (C) 2019-2025 GoodData Corporation
import React from "react";

import { messages } from "../../../../locales.js";
import { DEFAULT_CLUSTERING_THRESHOLD } from "../../../constants/scatter.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import InputControl from "../InputControl.js";

export interface IClusteringThresholdControlProps {
    valuePath: string;
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

export function ClusteringThresholdControl({
    disabled,
    valuePath,
    properties,
    pushData,
}: IClusteringThresholdControlProps) {
    return (
        <InputControl
            valuePath={valuePath}
            labelText={messages.clusteringThreshold.id}
            placeholder={messages.clusteringThresholdPlaceholder.id}
            type="number"
            value={properties?.controls?.clustering?.threshold ?? `${DEFAULT_CLUSTERING_THRESHOLD}`}
            disabled={disabled}
            properties={properties}
            pushData={pushData}
            description={messages.clusteringThresholdTooltip.id}
            descriptionValues={{
                link: (chunks) => (
                    <a
                        href="https://www.gooddata.com/docs/cloud/create-visualizations/smart-functions/#UseSmartFunctions-Clustering"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {chunks}
                    </a>
                ),
            }}
            transformFn={(value) => {
                const parsedValue = parseFloat(value);
                const isValid = parsedValue > 0 && parsedValue < 1;

                // For invalid or empty input, transform to default value.
                if (value === "" || !isValid) {
                    return `${DEFAULT_CLUSTERING_THRESHOLD}`;
                }

                return value;
            }}
        />
    );
}
