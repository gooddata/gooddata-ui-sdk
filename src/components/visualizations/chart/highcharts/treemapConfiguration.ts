// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');

const TREEMAP_TEMPLATE: any = {
    chart: {
        type: 'treemap',
        margin: [0, 0, 0, 0]
    },
    plotOptions: {
        treemap: {
            dataLabels: {
                enabled: true
            },
            showInLegend: true
        }
    },
    legend: {
        enabled: false
    }
};

export function getTreemapConfiguration() {
    return cloneDeep(TREEMAP_TEMPLATE);
}
