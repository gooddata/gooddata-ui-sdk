// (C) 2007-2025 GoodData Corporation

import autohideLabels from "./plugins/autohideLabels/autohideLabels.js";
import { extendDataLabelColors } from "./plugins/dataLabelsColors.js";
import { applyPointHaloOptions } from "./plugins/pointHalo.js";
import { linearTickPositions } from "./plugins/linearTickPositions.js";
import { adjustTickAmount } from "./plugins/adjustTickAmount.js";
import { groupedCategories } from "./plugins/3rdParty/grouped-categories.js";

import { groupCategoriesWrapper } from "./plugins/group-categories-wrapper.js";
import { renderBubbles } from "./plugins/renderBubbles.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function initChartPlugins(highcharts: any): void {
    autohideLabels(highcharts);
    extendDataLabelColors(highcharts);
    applyPointHaloOptions(highcharts);
    linearTickPositions(highcharts);
    groupedCategories(highcharts);
    groupCategoriesWrapper(highcharts);
    adjustTickAmount(highcharts);
    // modify rendering bubbles in bubble chart after upgrade to Highcharts v7.1.1
    renderBubbles(highcharts);
}
