// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');

const PIE_TEMPLATE = {
    chart: {
        type: 'pie'
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
