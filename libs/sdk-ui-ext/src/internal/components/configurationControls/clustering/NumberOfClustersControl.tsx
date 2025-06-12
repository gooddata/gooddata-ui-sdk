// (C) 2019-2024 GoodData Corporation
import React from "react";
import InputControl from "../InputControl.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";
import { DEFAULT_NUMBER_OF_CLUSTERS } from "../../../constants/scatter.js";

export interface INumberOfClustersControlProps {
    valuePath: string;
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

const validPositiveNumberHigherThanZero = /^[1-9][0-9]*$/;

export const NumberOfClustersControl = ({
    disabled,
    valuePath,
    properties,
    pushData,
}: INumberOfClustersControlProps) => {
    return (
        <InputControl
            valuePath={valuePath}
            labelText={messages.clusteringAmount.id}
            placeholder={messages.clusteringAmountPlaceholder.id}
            type="number"
            value={properties?.controls?.clustering?.numberOfClusters ?? `${DEFAULT_NUMBER_OF_CLUSTERS}`}
            disabled={disabled}
            properties={properties}
            pushData={pushData}
            validateFn={(value) => {
                // Only numbers or empty value is valid input
                return value === "" || validPositiveNumberHigherThanZero.test(value);
            }}
            transformFn={(value) => {
                const isValid = validPositiveNumberHigherThanZero.test(value);
                // For invalid or empty input, transform to default value.
                if (value === "" || !isValid) {
                    return `${DEFAULT_NUMBER_OF_CLUSTERS}`;
                }

                return value;
            }}
        />
    );
};
