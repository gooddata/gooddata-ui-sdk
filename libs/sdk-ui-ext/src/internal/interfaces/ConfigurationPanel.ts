// (C) 2019-2025 GoodData Corporation
import { type IColorPalette } from "@gooddata/sdk-model";
import { type IPushData, type ISeparators } from "@gooddata/sdk-ui";

import { type AxisType } from "./AxisType.js";
import { type IVisualizationProperties } from "./Visualization.js";

export interface IConfigItemSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties?: IVisualizationProperties;
    pushData?(data: IPushData): void;
}

export interface IHeadlinePanelConfig {
    separators?: ISeparators;
    comparisonColorPalette: IColorPalette;
    supportsAttributeHierarchies: boolean;
}
