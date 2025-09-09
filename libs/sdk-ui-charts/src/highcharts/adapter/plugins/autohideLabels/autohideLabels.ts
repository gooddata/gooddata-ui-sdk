// (C) 2007-2025 GoodData Corporation

import { VisualizationTypes } from "@gooddata/sdk-ui";

import {
    autohideBarLabels,
    autohideBarTotalLabels,
    handleBarLabelsOutsideChart,
} from "./autohideBarLabels.js";
import {
    autohideColumnLabels,
    autohideColumnTotalLabels,
    handleColumnLabelsOutsideChart,
} from "./autohideColumnLabels.js";
import autohideLabelsOverlappingItsShape from "./autohideLabelsOverlappingItsShape.js";
import autohidePieLabels from "./autohidePieLabels.js";
import {
    getDataLabelsGdcTotalsVisible,
    getDataLabelsGdcVisible,
    hideDataLabel,
    minimizeDataLabel,
} from "../../../chartTypes/_chartCreators/dataLabelsHelpers.js";
import { getChartType } from "../../../chartTypes/_chartCreators/helpers.js";

const autohideLabels = (Highcharts: any): void => {
    Highcharts.wrap(
        Highcharts.Chart.prototype,
        "hideOverlappingLabels",
        function (this: any, proceed: any, labels: any) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const chart = this;
            const chartType = getChartType(this);
            const dataLabelsUserVisibility = getDataLabelsGdcVisible(this);
            const totalLabelsVisibility = getDataLabelsGdcTotalsVisible(this);

            if (totalLabelsVisibility === "auto") {
                switch (chartType) {
                    case VisualizationTypes.COLUMN:
                        autohideColumnTotalLabels(chart);
                        break;
                    case VisualizationTypes.BAR:
                        autohideBarTotalLabels(chart);
                        break;
                }
            }

            if (dataLabelsUserVisibility === "auto") {
                switch (chartType) {
                    case VisualizationTypes.COLUMN:
                    case VisualizationTypes.WATERFALL:
                        autohideColumnLabels(chart);
                        return;
                    case VisualizationTypes.BAR:
                        autohideBarLabels(chart);
                        return;
                    case VisualizationTypes.PIE:
                    case VisualizationTypes.DONUT:
                    case VisualizationTypes.PYRAMID:
                    case VisualizationTypes.FUNNEL:
                        autohidePieLabels(chart);
                        return;
                    case VisualizationTypes.TREEMAP:
                    case VisualizationTypes.HEATMAP:
                        autohideLabelsOverlappingItsShape(chart);
                        return;
                    case VisualizationTypes.BUBBLE:
                        autohideLabelsOverlappingItsShape(chart, (point) => {
                            // only hide is not enough for combination with default label collision detection
                            minimizeDataLabel(point);
                            hideDataLabel(point);
                        });
                        proceed.call(chart, labels);
                        return;
                }
            } else if (dataLabelsUserVisibility === true) {
                switch (chartType) {
                    case VisualizationTypes.COLUMN:
                        handleColumnLabelsOutsideChart(chart);
                        return;
                    case VisualizationTypes.BAR:
                        handleBarLabelsOutsideChart(chart);
                        return;
                }
            }

            proceed.call(chart, labels);
        },
    );
};

export default autohideLabels;
