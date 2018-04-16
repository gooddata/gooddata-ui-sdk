import cloneDeep = require('lodash/cloneDeep');

export const LINE_WIDTH = 3;

const SCATTER_TEMPLATE: any = {
    chart: {
        type: 'scatter',
        zoomType: 'xy'
    },
    plotOptions: {
        scatter: {
            marker: {
                symbol: 'circle',
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'white'
                    }
                }
            },
            states: {
                hover: {
                    marker: {
                        enabled: false
                    }
                }
            }
        },
        xAxis: [{
            labels: {
                enabled: true
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        }],
        yAxis: [{
            labels: {
                enabled: true
            }
        }]
    },
    series: {
        lineWidth: LINE_WIDTH,
        fillOpacity: 0.3,
        states: {
            hover: {
                lineWidth: LINE_WIDTH + 1
            }
        }
    },
    legend: {
        enabled: false
    }
};

export function getScatterConfiguration() {
    return cloneDeep(SCATTER_TEMPLATE);
}
