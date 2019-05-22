// (C) 2019 GoodData Corporation
import { InjectedIntl } from "react-intl";
import { IVisualizationProperties } from "./Visualization";

export interface IMinMaxControlProps {
    isDisabled: boolean;
    basePath: string;
    pushData: (data: any) => any;
    intl: InjectedIntl;
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
