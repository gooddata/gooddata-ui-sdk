// (C) 2007-2018 GoodData Corporation
import { getChartType } from '../../helpers';
import { VisualizationTypes } from '../../../../../../constants/visualizationTypes';
import autohideColumnLabels from './autohideColumnLabels';
import autohideBarLabels from './autohideBarLabels';
import autohideLabelsOverlappingItsShape from './autohideLabelsOverlappingItsShape';

const autohideLabels = (Highcharts: any) => {
    Highcharts.wrap(Highcharts.Chart.prototype, 'hideOverlappingLabels', function(proceed: any, labels: any) {
        const chart = this;
        const chartType = getChartType(this);

        if (chartType === VisualizationTypes.COLUMN) {
            autohideColumnLabels(chart);
            return;
        }
        if (chartType === VisualizationTypes.BAR) {
            autohideBarLabels(chart);
            return;
        }
        if (
            chartType === VisualizationTypes.TREEMAP ||
            chartType === VisualizationTypes.HEATMAP
        ) {
            autohideLabelsOverlappingItsShape(chart);
            return;
        }

        proceed.call(this, labels);
    });
};

export default autohideLabels;
