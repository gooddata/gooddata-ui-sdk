// (C) 2019 GoodData Corporation
import { AxisType } from "./AxisType";
import { IVisualizationProperties } from "./Visualization";
import { IPushData } from "../../base";

export interface IConfigItemSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData(data: IPushData): void;
}
