// (C) 2007-2018 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");

const TREEMAP_TEMPLATE: any = {
    chart: {
        type: "treemap",
        margin: [0, 0, 5, 0],
    },
    plotOptions: {
        treemap: {
            showInLegend: true,
            borderColor: "white",
            layoutAlgorithm: "squarified",
            dataLabels: {
                enabled: true,
                allowOverlap: false,
            },
            levels: [
                {
                    level: 1,
                    dataLabels: {
                        enabled: true,
                        allowOverlap: false,
                    },
                },
                {
                    level: 2,
                    dataLabels: {
                        enabled: true,
                        allowOverlap: false,
                    },
                },
            ],
            point: {
                events: {
                    // from Highcharts 5.0.0 cursor can be set by using 'className' for individual data items
                    mouseOver() {
                        if (this.drilldown) {
                            this.graphic.element.style.cursor = "pointer";
                        }
                    },
                },
            },
        },
    },
    legend: {
        enabled: false,
    },
};

export function getTreemapConfiguration() {
    return cloneDeep(TREEMAP_TEMPLATE);
}
