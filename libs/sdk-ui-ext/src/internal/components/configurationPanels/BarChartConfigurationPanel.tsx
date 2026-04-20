// (C) 2019-2026 GoodData Corporation

import { BAR_CHART_AXIS_CONFIG } from "../../constants/axis.js";
import { BaseChartConfigurationPanel } from "./BaseChartConfigurationPanel.js";

export class BarChartConfigurationPanel extends BaseChartConfigurationPanel {
    protected override getAxesConfiguration(type: string): any[] {
        return BAR_CHART_AXIS_CONFIG[type];
    }
}
