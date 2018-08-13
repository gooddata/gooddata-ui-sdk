// (C) 2007-2018 GoodData Corporation
import cloneDeep = require('lodash/cloneDeep');
import { WHITE, GRAY } from '../../utils/color';

const HEATMAP_TEMPLATE = {
    chart: {
        type: 'heatmap',
        marginTop: 0,
        marginRight: 0,
        spacingRight: 0
    },
    defs: {
        patterns: [{
            id: 'empty-data-pattern',
            path: {
                d: 'M 10 0 L 0 10 M 9 11 L 11 9 M 4 11 L 11 4 M -1 1 L 1 -1 M -1 6 L 6 -1',
                stroke: GRAY,
                strokeWidth: 1,
                fill: WHITE
            }
        }]
    },
    plotOptions: {
        heatmap: {
            dataLabels: {
                enabled: true,
                allowOverlap: false
            },
            point: {
                events: {
                    // from Highcharts 5.0.0 cursor can be set by using 'className' for individual data items
                    mouseOver() {
                        if (this.drilldown) {
                            this.graphic.element.style.cursor = 'pointer';
                        }
                    }
                }
            }
        }
    },
    series: [{
        borderWidth: 0,
        nullColor: 'url(#empty-data-pattern)'
    }],
    yAxis: [{
        endOnTick: false
    }]
};

export function getHeatmapConfiguration() {
    return cloneDeep(HEATMAP_TEMPLATE);
}
