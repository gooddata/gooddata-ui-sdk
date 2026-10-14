// (C) 2007-2026 GoodData Corporation

import { type ITheme } from "@gooddata/sdk-model";

import { groupedCategories } from "./plugins/3rdParty/grouped-categories.js";
import { initAccessibleTooltipPluginOnce } from "./plugins/accessibleTooltip.js";
import { adjustTickAmount } from "./plugins/adjustTickAmount.js";
import { autohideLabels } from "./plugins/autohideLabels/autohideLabels.js";
import { skipDataLabelsWithoutSpace } from "./plugins/autohideLabels/skipDataLabelsWithoutSpace.js";
import { skipOverlappingLineDataLabels } from "./plugins/autohideLabels/skipOverlappingLineDataLabels.js";
import { extendDataLabelColors } from "./plugins/dataLabelsColors.js";
import { groupCategoriesWrapper } from "./plugins/group-categories-wrapper.js";
import { inlineFontSize } from "./plugins/inlineFontSize.js";
import { linearTickPositions } from "./plugins/linearTickPositions.js";
import { applyPointHaloOptions } from "./plugins/pointHalo.js";
import { registerPointShapeSymbols } from "./plugins/pointShapeSymbols.js";
import { renderBubbles } from "./plugins/renderBubbles.js";

let basePluginsInitialized = false;
let dataLabelColorsInitialized = false;

export function initChartPlugins(
    highcharts: any,
    enableAccessibleChartTooltip?: boolean,
    theme?: ITheme | null,
): void {
    if (!basePluginsInitialized) {
        autohideLabels(highcharts);
        skipDataLabelsWithoutSpace(highcharts);
        skipOverlappingLineDataLabels(highcharts);
        applyPointHaloOptions(highcharts);
        linearTickPositions(highcharts);
        groupedCategories(highcharts);
        groupCategoriesWrapper(highcharts);
        adjustTickAmount(highcharts);
        // modify rendering bubbles in bubble chart after upgrade to Highcharts v7.1.1
        renderBubbles(highcharts);
        // register custom point-shape marker symbols beyond the five Highcharts built-ins
        registerPointShapeSymbols(highcharts);
        // read text font size from the inline style to avoid forced style recalculations
        inlineFontSize(highcharts);

        basePluginsInitialized = true;
    }

    if (enableAccessibleChartTooltip) {
        initAccessibleTooltipPluginOnce(highcharts);
    }
    if (theme !== undefined && !dataLabelColorsInitialized) {
        extendDataLabelColors(highcharts, theme);
        dataLabelColorsInitialized = true;
    }
}
