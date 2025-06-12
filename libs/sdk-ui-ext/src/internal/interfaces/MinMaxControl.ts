// (C) 2019 GoodData Corporation
import { IVisualizationProperties } from "./Visualization.js";

export interface IMinMaxControlProps {
    isDisabled: boolean;
    basePath: string;
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    propertiesMeta: any;
}

export interface IMinMaxScaleState {
    hasWarning: boolean;
    warningMessage: string;
    incorrectValue: string;
}

export interface IMinMaxControlState {
    minScale: IMinMaxScaleState;
    maxScale: IMinMaxScaleState;
}
