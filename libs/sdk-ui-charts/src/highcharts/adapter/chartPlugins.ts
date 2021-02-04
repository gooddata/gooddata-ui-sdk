// (C) 2007-2020 GoodData Corporation
//import autohideLabels from "./plugins/autohideLabels/autohideLabels";
import { extendDataLabelColors } from "./plugins/dataLabelsColors";
import { applyPointHaloOptions } from "./plugins/pointHalo";
import { linearTickPositions } from "./plugins/linearTickPositions";
import { groupCategoriesWrapper } from "./plugins/group-categories-wrapper";
import { renderBubbles } from "./plugins/renderBubbles";
import { adjustTickAmount } from "./plugins/adjustTickAmount";

const extendRenderStackTotals = (Highcharts: any) => {
    Highcharts.wrap(Highcharts.Axis.prototype, "renderStackTotals", function (proceed: any) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const axis = this;
        const { chart, stackTotalGroup } = axis;
        const { renderer } = chart;
        /* We override renderStackTotals method to render "stack-labels" directly with desired
         * visibility to prevent blinking of data labels while resizing. In Highcharts it's
         * by default:
         *     visibility: VISIBLE,
         */
        const defaultVisibility = chart.userOptions.stackLabelsVisibility || "visible";

        if (!stackTotalGroup) {
            axis.stackTotalGroup = renderer
                .g("stack-labels")
                .attr({
                    visibility: defaultVisibility,
                    zIndex: 6,
                })
                .add();
        }
        proceed.call(this);
    });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function initChartPlugins(Highcharts: any): void {
    extendRenderStackTotals(Highcharts);
    //autohideLabels(Highcharts);
    extendDataLabelColors(Highcharts);
    applyPointHaloOptions(Highcharts);
    linearTickPositions(Highcharts);
    groupCategoriesWrapper(Highcharts);
    adjustTickAmount(Highcharts);
    // modify rendering bubbles in bubble chart after upgrade to Highcharts v7.1.1
    renderBubbles(Highcharts);
}
