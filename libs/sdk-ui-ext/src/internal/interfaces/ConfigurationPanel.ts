// (C) 2019-2025 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";
import { IPushData, ISeparators } from "@gooddata/sdk-ui";

import { AxisType } from "./AxisType.js";
import { IVisualizationProperties } from "./Visualization.js";

export interface IConfigItemSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData(data: IPushData): void;
}

export interface IHeadlinePanelConfig {
    separators: ISeparators;
    comparisonColorPalette: IColorPalette;
    supportsAttributeHierarchies: boolean;
}
