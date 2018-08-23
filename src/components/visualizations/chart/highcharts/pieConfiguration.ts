// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');
import get = require('lodash/get');

const PIE_TEMPLATE = {
    chart: {
        type: 'pie',
        events: {
            load() {
                this.series[0].update({
                    dataLabels: {
                        distance: -(get(this, 'series.0.points.0.shapeArgs.r', 30) / 3)
                    }
                });
            }
        }
    },
    plotOptions: {
        pie: {
            size: '100%',
            allowPointSelect: false,
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    },
    legend: {
        enabled: false
    }
};

export function getPieConfiguration() {
    return cloneDeep(PIE_TEMPLATE);
}
