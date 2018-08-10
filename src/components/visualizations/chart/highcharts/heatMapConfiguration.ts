// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');

const HEATMAP_TEMPLATE = {
    chart: {
        type: 'heatmap',
        marginTop: 25,
        marginRight: 0
    },
    plotOptions: {
        heatmap: {
            borderColor: 'rgb(255,255,255)'
        }
    },
    series: [{
        dataLabels: {
            color: '#000000',
            allowOverlap: false
        }
    }]
};

export function getHeatMapConfiguration() {
    return cloneDeep(HEATMAP_TEMPLATE);
}
