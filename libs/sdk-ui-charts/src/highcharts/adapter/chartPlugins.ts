// (C) 2007-2021 GoodData Corporation
import autohideLabels from "./plugins/autohideLabels/autohideLabels";
import { extendDataLabelColors } from "./plugins/dataLabelsColors";
import { applyPointHaloOptions } from "./plugins/pointHalo";
import { linearTickPositions } from "./plugins/linearTickPositions";
import { groupCategoriesWrapper } from "./plugins/group-categories-wrapper";
import { renderBubbles } from "./plugins/renderBubbles";
import { adjustTickAmount } from "./plugins/adjustTickAmount";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function initChartPlugins(Highcharts: any): void {
    autohideLabels(Highcharts);
    extendDataLabelColors(Highcharts);
    applyPointHaloOptions(Highcharts);
    linearTickPositions(Highcharts);
    groupCategoriesWrapper(Highcharts);
    adjustTickAmount(Highcharts);
    // modify rendering bubbles in bubble chart after upgrade to Highcharts v7.1.1
    renderBubbles(Highcharts);
}
