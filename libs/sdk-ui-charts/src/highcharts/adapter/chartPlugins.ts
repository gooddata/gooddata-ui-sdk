// (C) 2007-2021 GoodData Corporation
import autohideLabels from "./plugins/autohideLabels/autohideLabels.js";
import { extendDataLabelColors } from "./plugins/dataLabelsColors.js";
import { applyPointHaloOptions } from "./plugins/pointHalo.js";
import { linearTickPositions } from "./plugins/linearTickPositions.js";
import { groupCategoriesWrapper } from "./plugins/group-categories-wrapper.js";
import { renderBubbles } from "./plugins/renderBubbles.js";
import { adjustTickAmount } from "./plugins/adjustTickAmount.js";
import { groupedCategories } from "./plugins/3rdParty/grouped-categories.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function initChartPlugins(Highcharts: any): void {
    autohideLabels(Highcharts);
    extendDataLabelColors(Highcharts);
    applyPointHaloOptions(Highcharts);
    linearTickPositions(Highcharts);
    groupedCategories(Highcharts);
    groupCategoriesWrapper(Highcharts);
    adjustTickAmount(Highcharts);
    // modify rendering bubbles in bubble chart after upgrade to Highcharts v7.1.1
    renderBubbles(Highcharts);
}
