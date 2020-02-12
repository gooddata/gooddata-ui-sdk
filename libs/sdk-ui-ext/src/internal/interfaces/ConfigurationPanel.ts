// (C) 2019-2020 GoodData Corporation
import { AxisType } from "./AxisType";
import { IVisualizationProperties } from "./Visualization";
import { IPushData } from "@gooddata/sdk-ui";

export interface IConfigItemSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData(data: IPushData): void;
}
