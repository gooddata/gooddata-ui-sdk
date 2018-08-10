// (C) 2007-2018 GoodData Corporation
import { getChartType } from '../../helpers';
import { VisualizationTypes } from '../../../../../../constants/visualizationTypes';
import autohideColumnLabels from './autohideColumnLabels';
import autohideBarLabels from './autohideBarLabels';
import autohideTreemapLabels from './autohideTreemapLabels';

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
        if (chartType === VisualizationTypes.TREEMAP) {
            autohideTreemapLabels(chart);
            return;
        }

        proceed.call(this, labels);
    });
};

export default autohideLabels;
