// (C) 2007-2018 GoodData Corporation
import {
    getChartType,
    getDataLabelsGdcVisible,
    minimizeDataLabel,
    hideDataLabel
} from '../../helpers';
import { VisualizationTypes } from '../../../../../../constants/visualizationTypes';
import autohideColumnLabels from './autohideColumnLabels';
import autohideBarLabels from './autohideBarLabels';
import autohidePieLabels from './autohidePieLabels';
import autohideLabelsOverlappingItsShape from './autohideLabelsOverlappingItsShape';

const autohideLabels = (Highcharts: any) => {
    Highcharts.wrap(Highcharts.Chart.prototype, 'hideOverlappingLabels', function(proceed: any, labels: any) {
        const chart = this;
        const chartType = getChartType(this);
        const dataLabelsUserVisibility = getDataLabelsGdcVisible(this);

        if (dataLabelsUserVisibility === 'auto') {
            switch (chartType) {
                case VisualizationTypes.COLUMN:
                    autohideColumnLabels(chart);
                    return;
                case VisualizationTypes.BAR:
                    autohideBarLabels(chart);
                    return;
                case VisualizationTypes.PIE:
                case VisualizationTypes.DONUT:
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
                    proceed.call(this, labels);
                    return;
            }
        }

        proceed.call(this, labels);
    });
};

export default autohideLabels;
