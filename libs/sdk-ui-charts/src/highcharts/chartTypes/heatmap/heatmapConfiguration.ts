// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import last from "lodash/last.js";

const HEATMAP_TEMPLATE = {
    chart: {
        type: "heatmap",
        marginTop: 8,
        marginRight: 0,
        spacingRight: 0,
    },
    plotOptions: {
        heatmap: {
            dataLabels: {
                enabled: true,
                allowOverlap: false,
                crop: true,
                overflow: "justify",
            },
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
    yAxis: [
        {
            labels: {
                formatter() {
                    const { axis, isLast } = this;
                    const { tickPositions, categories } = axis;
                    // tickPositions is array of index of categories
                    const lastIndex = parseInt(last(tickPositions).toString(), 10);
                    const lastCategory = categories ? categories[lastIndex] : null;
                    let labelValue = axis.defaultLabelFormatter.call(this);

                    // When generate linear tick positions base on categories length.
                    // Last tick position can be out of index of categories.
                    // In this case, set label value to null to ignore last label.
                    if (isLast && categories && !lastCategory) {
                        labelValue = null;
                    }
                    return labelValue;
                },
            },
        },
    ],
};

export function getHeatmapConfiguration(): typeof HEATMAP_TEMPLATE {
    return cloneDeep(HEATMAP_TEMPLATE);
}
