// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');

const HEATMAP_TEMPLATE = {
    chart: {
        type: 'heatmap',
        marginTop: 45
    },
    colorAxis: {
        tickColor: 'rgb(255,255,255)',
        stops: [
            [0, 'rgb(254,254,255)'],
            [0.25, 'rgb(193,236,248)'],
            [0.5, 'rgb(139,220,244)'],
            [0.75, 'rgb(109,209,230)'],
            [1, 'rgb(20,178,226)']
        ]
    },
    plotOptions: {
        heatmap: {
            borderColor: 'rgb(255,255,255)'
        }
    },
    legend: {
        enabled: true,
        align: 'right',
        layout: 'horizontal',
        margin: 0,
        verticalAlign: 'top',
        y: -10,
        symbolWidth: 280,
        symbolHeight: 10
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
