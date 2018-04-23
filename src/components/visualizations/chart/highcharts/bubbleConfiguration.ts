// (C) 2007-2018 GoodData Corporation
import { cloneDeep } from 'lodash';

const BUBBLE_TEMPLATE = {
    chart: {
        type: 'bubble',
        zoomType: 'xy'
    },
    plotOptions: {
        bubble: {
            marker: {
                symbol: 'circle',
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
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
        states: {
            hover: {
                enabled: false
            }
        }
    },
    legend: {
        enabled: false
    }
};

export function getBubbleConfiguration() {
    return cloneDeep(BUBBLE_TEMPLATE);
}
