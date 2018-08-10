// (C) 2007-2018 GoodData Corporation
import * as cx from 'classnames';
import noop = require('lodash/noop');
import set = require('lodash/set');
import get = require('lodash/get');
import merge = require('lodash/merge');
import map = require('lodash/map');
import partial = require('lodash/partial');
import isEmpty = require('lodash/isEmpty');
import compact = require('lodash/compact');
import cloneDeep = require('lodash/cloneDeep');
import every = require('lodash/every');
import { styleVariables } from '../../styles/variables';
import { IAxis } from '../chartOptionsBuilder';

import * as numberJS from '@gooddata/numberjs';
import { VisualizationTypes } from '../../../../constants/visualizationTypes';
import { HOVER_BRIGHTNESS, MINIMUM_HC_SAFE_BRIGHTNESS } from './commonConfiguration';
import { getLighterColor } from '../../utils/color';
import {
    isBarChart,
    isColumnChart,
    isOneOfTypes,
    isAreaChart,
    isRotationInRange,
    isTreemap
} from '../../utils/common';
import {
    shouldFollowPointer,
    shouldStartOrEndOnTick
} from '../../../visualizations/chart/highcharts/helpers';

const {
    stripColors,
    numberFormat
}: any = numberJS;

const EMPTY_DATA: any = { categories: [], series: [] };

const ALIGN_LEFT = 'left';
const ALIGN_RIGHT = 'right';
const ALIGN_CENTER = 'center';

const TOOLTIP_ARROW_OFFSET = 23;
const TOOLTIP_FULLSCREEN_THRESHOLD = 480;
const TOOLTIP_MAX_WIDTH = 366;
const TOOLTIP_BAR_CHART_VERTICAL_OFFSET = 5;
const TOOLTIP_VERTICAL_OFFSET = 14;

const escapeAngleBrackets = (str: any) => str && str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

function getTitleConfiguration(chartOptions: any) {
    const { yAxes = [], xAxes = [] }: { yAxes: IAxis[], xAxes: IAxis[] } = chartOptions;
    const yAxis = yAxes.map((axis: IAxis) => (axis ? {
        title: {
            text: escapeAngleBrackets(get(axis, 'label', ''))
        }
    } : {}));

    const xAxis = xAxes.map((axis: IAxis) => (axis ? {
        title: {
            text: escapeAngleBrackets(get(axis, 'label', ''))
        }
    } : {}));

    return {
        yAxis,
        xAxis
    };
}

function formatAsPercent() {
    const val = parseFloat((this.value * 100).toPrecision(14));
    return `${val}%`;
}

function isInPercent(format: string = '') {
    return format.includes('%');
}

function formatOverlapping() {
    const chartHeight = get(this, 'chart.chartHeight', 1);
    const categoriesCount = get(this, 'axis.categories', []).length;
    const width = Math.floor(chartHeight / categoriesCount);
    const pixelOffset = 20;

    const finalWidth = Math.max(0, width - pixelOffset);

    return (
        `<div align="center" style="width: ${finalWidth}px; overflow: hidden; text-overflow: ellipsis">`
        + this.value + '</div>'
    );
}

function hideOverlappedLabels(chartOptions: any) {
    const rotation = Number(get(chartOptions, 'xAxisProps.rotation', '0'));

    // Set only for bar chart and labels are rotated by 90
    if (isBarChart(chartOptions.type) && isRotationInRange(rotation, 75, 105)) {
        const { xAxes = [] }: { xAxes: IAxis[]} = chartOptions;

        return {
            xAxis: xAxes.map(axis => (axis) ? {
                labels: {
                    useHTML: true,
                    formatter: formatOverlapping
                }
            } : {})
        };
    }

    return {};
}

function getShowInPercentConfiguration(chartOptions: any) {
    const { yAxes = [], xAxes = [] }: { yAxes: IAxis[], xAxes: IAxis[] } = chartOptions;

    const xAxis = xAxes.map(axis => (axis && isInPercent(axis.format) ? {
        labels: {
            formatter: formatAsPercent
        }
    } : {}));

    const yAxis = yAxes.map(axis => (axis && isInPercent(axis.format) ? {
        labels: {
            formatter: formatAsPercent
        }
    } : {}));

    return {
        xAxis,
        yAxis
    };
}

function getArrowAlignment(arrowPosition: any, chartWidth: any) {
    const minX = -TOOLTIP_ARROW_OFFSET;
    const maxX = chartWidth + TOOLTIP_ARROW_OFFSET;

    if (
        arrowPosition + (TOOLTIP_MAX_WIDTH / 2) > maxX &&
        arrowPosition - (TOOLTIP_MAX_WIDTH / 2) > minX
    ) {
        return ALIGN_RIGHT;
    }

    if (
        arrowPosition - (TOOLTIP_MAX_WIDTH / 2) < minX &&
        arrowPosition + (TOOLTIP_MAX_WIDTH / 2) < maxX
    ) {
        return ALIGN_LEFT;
    }

    return ALIGN_CENTER;
}

const getTooltipHorizontalStartingPosition = (arrowPosition: any, chartWidth: any, tooltipWidth: any) => {
    switch (getArrowAlignment(arrowPosition, chartWidth)) {
        case ALIGN_RIGHT:
            return (arrowPosition - tooltipWidth) + TOOLTIP_ARROW_OFFSET;
        case ALIGN_LEFT:
            return arrowPosition - TOOLTIP_ARROW_OFFSET;
        default:
            return arrowPosition - (tooltipWidth / 2);
    }
};

function getArrowHorizontalPosition(chartType: any, stacking: any, dataPointEnd: any, dataPointHeight: any) {
    if (isBarChart(chartType) && stacking) {
        return dataPointEnd - (dataPointHeight / 2);
    }

    return dataPointEnd;
}

function getDataPointEnd(chartType: any, isNegative: any, endPoint: any, height: any, stacking: any) {
    return (isBarChart(chartType) && isNegative && stacking) ? endPoint + height : endPoint;
}

function getDataPointStart(chartType: any, isNegative: any, endPoint: any, height: any, stacking: any) {
    return (isColumnChart(chartType) && isNegative && stacking) ? endPoint - height : endPoint;
}

function getTooltipVerticalOffset(chartType: any, stacking: any, point: any) {
    if (isColumnChart(chartType) && (stacking || point.negative)) {
        return 0;
    }

    if (isBarChart(chartType)) {
        return TOOLTIP_BAR_CHART_VERTICAL_OFFSET;
    }

    return TOOLTIP_VERTICAL_OFFSET;
}

function positionTooltip(chartType: any, stacking: any, labelWidth: any, labelHeight: any, point: any) {
    const dataPointEnd = getDataPointEnd(chartType, point.negative, point.plotX, point.h, stacking);
    const arrowPosition = getArrowHorizontalPosition(chartType, stacking, dataPointEnd, point.h);
    const chartWidth = this.chart.plotWidth;

    const tooltipHorizontalStartingPosition = getTooltipHorizontalStartingPosition(
        arrowPosition,
        chartWidth,
        labelWidth
    );

    const verticalOffset = getTooltipVerticalOffset(chartType, stacking, point);

    const dataPointStart = getDataPointStart(
        chartType,
        point.negative,
        point.plotY,
        point.h,
        stacking
    );

    return {
        x: this.chart.plotLeft + tooltipHorizontalStartingPosition,
        y: (this.chart.plotTop + dataPointStart) - (labelHeight + verticalOffset)
    };
}

const showFullscreenTooltip = () => {
    return document.documentElement.clientWidth <= TOOLTIP_FULLSCREEN_THRESHOLD;
};

function isPointBasedChart(chartType: string) {
    const pointBasedTypes = [
        VisualizationTypes.LINE,
        VisualizationTypes.AREA,
        VisualizationTypes.TREEMAP,
        VisualizationTypes.DUAL,
        VisualizationTypes.SCATTER
    ];
    return isOneOfTypes(chartType, pointBasedTypes);
}

function formatTooltip(chartType: any, stacking: any, tooltipCallback: any) {
    const { chart } = this.series;
    const { color: pointColor } = this.point;

    // when brushing, do not show tooltip
    if (chart.mouseIsDown) {
        return false;
    }

    const dataPointEnd = (
        isPointBasedChart(chartType) ||
        !this.point.tooltipPos
    )
        ? this.point.plotX
        : getDataPointEnd(
            chartType,
            this.point.negative,
            this.point.tooltipPos[0],
            this.point.tooltipPos[2],
            stacking
        );

    const ignorePointHeight =
        isPointBasedChart(chartType) ||
        !this.point.shapeArgs;

    const dataPointHeight = ignorePointHeight ? 0 : this.point.shapeArgs.height;

    const arrowPosition = getArrowHorizontalPosition(
        chartType,
        stacking,
        dataPointEnd,
        dataPointHeight
    );

    const chartWidth = chart.plotWidth;
    const align = getArrowAlignment(arrowPosition, chartWidth);

    const strokeStyle = pointColor ? `border-top-color: ${pointColor};` : '';

    const tailStyle = showFullscreenTooltip() ?
        `style="left: ${arrowPosition + chart.plotLeft}px;"` : '';

    const getTailClasses = (classname: any) => {
        return cx(classname, {
            [align]: !showFullscreenTooltip()
        });
    };

    const tooltipContent = tooltipCallback(this.point); // null disables whole tooltip

    return tooltipContent !== null ? (
        `<div class="hc-tooltip">
            <span class="stroke" style="${strokeStyle}"></span>
            <div class="content">
                ${tooltipContent}
            </div>
            <div class="${getTailClasses('tail1')}" ${tailStyle}></div>
            <div class="${getTailClasses('tail2')}" ${tailStyle}></div>
        </div>`
    ) : null;
}

function formatLabel(value: any, format: any) {
    // no labels for missing values
    if (value === null) {
        return null;
    }

    const stripped = stripColors(format || '');
    return escapeAngleBrackets(String(numberFormat(value, stripped)));
}

function labelFormatter() {
    return formatLabel(this.y, get(this, 'point.format'));
}

function labelFormatterHeatMap(options: any) {
    return formatLabel(this.point.value, options.formatGD);
}

function level1LabelsFormatter() {
    return `${get(this, 'point.name')} (${formatLabel(get(this, 'point.node.val'), get(this, 'point.format'))})`;
}
function level2LabelsFormatter() {
    return `${get(this, 'point.name')} (${formatLabel(get(this, 'point.value'), get(this, 'point.format'))})`;
}

// check whether series contains only positive values, not consider nulls
function hasOnlyPositiveValues(series: any, x: any) {
    return every(series, (seriesItem: any) => {
        const dataPoint = seriesItem.yData[x];
        return dataPoint !== null && dataPoint >= 0;
    });
}

function stackLabelFormatter() {
    // show labels: always for negative,
    // without negative values or with non-zero total for positive
    const showStackLabel =
        this.isNegative || hasOnlyPositiveValues(this.axis.series, this.x) || this.total !== 0;
    return showStackLabel ?
        formatLabel(this.total, get(this, 'axis.userOptions.defaultFormat')) : null;
}

function getTooltipConfiguration(chartOptions: any) {
    const tooltipAction = get(chartOptions, 'actions.tooltip');
    const chartType = chartOptions.type;
    const { stacking } = chartOptions;

    const followPointer = isOneOfTypes(chartType, [VisualizationTypes.COLUMN, VisualizationTypes.BAR])
        ? { followPointer: shouldFollowPointer(chartOptions) }
        : {};

    return tooltipAction ? {
        tooltip: {
            borderWidth: 0,
            borderRadius: 0,
            shadow: false,
            useHTML: true,
            positioner: partial(positionTooltip, chartType, stacking),
            formatter: partial(formatTooltip, chartType, stacking, tooltipAction),
            ...followPointer
        }
    } : {};
}

function getTreemapLabelsConfiguration(isMultiLevel: boolean, style: any) {
    const smallLabelInCenter = {
        dataLabels: {
            enabled: true,
            padding: 2,
            formatter: level2LabelsFormatter,
            allowOverlap: false,
            style
        }
    };
    if (isMultiLevel) {
        return {
            levels: [{
                level: 1,
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    verticalAlign: 'top',
                    padding: 5,
                    style: {
                        ...style,
                        fontSize: '14px'
                    },
                    formatter: level1LabelsFormatter,
                    allowOverlap: false
                }
            }, {
                level: 2,
                ...smallLabelInCenter
            }]
        };
    } else {
        return {
            levels: [{
                level: 1,
                ...smallLabelInCenter
            }]
        };
    }
}

function getLabelsConfiguration(chartOptions: any) {
    const {
        stacking,
        yAxes = [],
        type
    }: {
        stacking: boolean;
        yAxes: IAxis[];
        type: string;
    } = chartOptions;
    const style = stacking || isTreemap(type) ? {
        color: '#ffffff',
        textShadow: '0 0 1px #000000'
    } : {
        color: '#000000',
        textShadow: 'none'
    };

    const drilldown = stacking || isTreemap(type) ? {
        activeDataLabelStyle: {
            color: '#ffffff'
        }
    } : {};

    const yAxis = yAxes.map((axis: any) => ({
        defaultFormat: get(axis, 'format')
    }));

    return {
        drilldown,
        plotOptions: {
            bar: {
                dataLabels: {
                    formatter: labelFormatter,
                    style,
                    allowOverlap: false
                }
            },
            column: {
                dataLabels: {
                    formatter: labelFormatter,
                    style,
                    allowOverlap: false
                }
            },
            heatmap: {
                dataLabels: {
                    formatter: labelFormatterHeatMap
                }
            },
            treemap: {
                ...getTreemapLabelsConfiguration(!!stacking, style)
            }
        },
        yAxis
    };
}

function getStackingConfiguration(chartOptions: any) {
    const { stacking, yAxes = [], type }: { stacking: boolean, yAxes: IAxis[], type: any } = chartOptions;

    const yAxis = yAxes.map(() => ({
        stackLabels: {
            formatter: stackLabelFormatter
        }
    }));

    let connectNulls = {};
    if (stacking && isAreaChart(type)) {
        connectNulls = {
            connectNulls: true
        };
    }

    return stacking ? {
        plotOptions: {
            series: {
                stacking,
                ...connectNulls
            }
        },
        yAxis
    } : {};
}

function getSeries(series: any, colorPalette: any = []) {
    return series.map((seriesItem: any, index: number) => {
        const item = cloneDeep(seriesItem);
        item.color = colorPalette[index % colorPalette.length];
        // Escaping is handled by highcharts so we don't want to provide escaped input.
        // With one exception, though. Highcharts supports defining styles via
        // for example <b>...</b> and parses that from series name.
        // So to avoid this parsing, escape only < and > to &lt; and &gt;
        // which is understood by highcharts correctly
        item.name = item.name && escapeAngleBrackets(item.name);

        // Escape data items for pie chart
        item.data = item.data.map((dataItem: any) => {
            if (!dataItem) {
                return dataItem;
            }

            return {
                ...dataItem,
                name: escapeAngleBrackets(dataItem.name)
            };
        });

        return item;
    });
}

function getHeatMapDataConfiguration(chartOptions: any) {
    const data = chartOptions.data || EMPTY_DATA;
    const series = data.series;
    const categories = data.categories;

    return {
        series,
        xAxis: [{
            labels: {
                enabled: !isEmpty(compact(categories))
            },
            categories: categories[0] || []
        }],
        yAxis: [{
            labels: {
                enabled: !isEmpty(compact(categories))
            },
            categories: categories[1] || []
        }],
        colorAxis: {
            dataClasses: get(chartOptions, 'colorAxis.dataClasses', [])
        }
    };
}

function getDataConfiguration(chartOptions: any) {
    const data = chartOptions.data || EMPTY_DATA;
    const series = getSeries(data.series, chartOptions.colorPalette);
    const { type } = chartOptions;

    switch (type) {
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.BUBBLE:
            return {
                series
            };
        case VisualizationTypes.HEATMAP:
            return getHeatMapDataConfiguration(chartOptions);
    }

    const categories = map(data.categories, escapeAngleBrackets);
    const labelsEnabled = get(chartOptions, 'xAxisProps.labelsEnabled', true);

    return {
        series,
        xAxis: [{
            labels: {
                enabled: !isEmpty(compact(categories)) && labelsEnabled
            },
            categories
        }]
    };
}

function lineSeriesMapFn(seriesOrig: any) {
    const series = cloneDeep(seriesOrig);

    if (series.isDrillable) {
        set(series, 'marker.states.hover.fillColor', getLighterColor(series.color, HOVER_BRIGHTNESS));
        set(series, 'cursor', 'pointer');
    } else {
        set(series, 'states.hover.halo.size', 0);
    }

    return series;
}

function barSeriesMapFn(seriesOrig: any) {
    const series = cloneDeep(seriesOrig);

    set(series, 'states.hover.brightness', HOVER_BRIGHTNESS);
    set(series, 'states.hover.enabled', series.isDrillable);

    return series;
}

function getHoverStyles({ type }: any, config: any) {
    let seriesMapFn = noop;

    switch (type) {
        default:
            throw new Error(`Undefined chart type "${type}".`);

        case VisualizationTypes.DUAL:
        case VisualizationTypes.LINE:
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.AREA:
        case VisualizationTypes.BUBBLE:
            seriesMapFn = lineSeriesMapFn;
            break;

        case VisualizationTypes.BAR:
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.FUNNEL:
        case VisualizationTypes.HEATMAP:
            seriesMapFn = barSeriesMapFn;
            break;

        case VisualizationTypes.COMBO:
            seriesMapFn = (seriesOrig) => {
                const { type } = seriesOrig;

                if (type === 'line') {
                    return lineSeriesMapFn(seriesOrig);
                }
                return barSeriesMapFn(seriesOrig);
            };
            break;

        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.TREEMAP:
            seriesMapFn = (seriesOrig) => {
                const series = cloneDeep(seriesOrig);

                return {
                    ...series,
                    data: series.data.map((dataItemOrig: any) => {
                        const dataItem = cloneDeep(dataItemOrig);
                        const drilldown = get(dataItem, 'drilldown');

                        set(dataItem, 'states.hover.brightness', drilldown ?
                            HOVER_BRIGHTNESS : MINIMUM_HC_SAFE_BRIGHTNESS);

                        if (!drilldown) {
                            set(dataItem, 'halo.size', 0); // see plugins/pointHalo.js
                        }

                        return dataItem;
                    })
                };
            };
            break;
    }

    return {
        series: config.series.map(seriesMapFn)
    };
}

function getGridConfiguration(chartOptions: any) {
    const gridEnabled = get(chartOptions, 'grid.enabled', true);
    const { yAxes = [] }: { yAxes: IAxis[] } = chartOptions;
    const yAxis = yAxes.map(() => ({
        gridLineWidth: 0
    }));

    if (!gridEnabled) {
        return {
            yAxis
        };
    }

    return {};
}

function getAxesConfiguration(chartOptions: any) {
    return {
        yAxis: get(chartOptions, 'yAxes', []).map((axis: any) => {
            if (!axis) {
                return {
                    visible: false
                };
            }

            // For bar chart take x axis options
            const min = get(chartOptions, 'yAxisProps.min', '');
            const max = get(chartOptions, 'yAxisProps.max', '');
            const visible = get(chartOptions, 'yAxisProps.visible', true);
            const labelsEnabled = get(chartOptions, 'yAxisProps.labelsEnabled', true);
            const startOrEndOnTick = shouldStartOrEndOnTick(max, min);

            const maxProp = max ? { max: Number(max) } : {};
            const minProp = min ? { min: Number(min) } : {};
            const visibleProp = visible ? {} : {
                labels: {
                    enabled: false
                },
                title: {
                    enabled: false
                }
            };

            const rotation = get(chartOptions, 'yAxisProps.rotation', 'auto');
            const rotationProp = rotation !== 'auto' ? { rotation: -Number(rotation) } : {};

            return {
                gridLineColor: '#ebebeb',
                labels: {
                    enabled: labelsEnabled,
                    style: {
                        color: styleVariables.gdColorStateBlank,
                        font: '12px Avenir, "Helvetica Neue", Arial, sans-serif'
                    },
                    ...rotationProp
                },
                title: {
                    margin: 15,
                    style: {
                        color: styleVariables.gdColorLink,
                        font: '14px Avenir, "Helvetica Neue", Arial, sans-serif'
                    }
                },
                opposite: axis.opposite,
                ...visibleProp,
                ...maxProp,
                ...minProp,
                startOnTick: startOrEndOnTick,
                endOnTick: startOrEndOnTick
            };
        }),

        xAxis: get(chartOptions, 'xAxes', []).map((axis: any) => {
            if (!axis) {
                return {
                    visible: false
                };
            }

            const visible = get(chartOptions, 'xAxisProps.visible', true);
            const rotation = get(chartOptions, 'xAxisProps.rotation', 'auto');
            const labelsEnabled = get(chartOptions, 'xAxisProps.labelsEnabled', true);
            const rotationProp = rotation !== 'auto' ? { rotation: -Number(rotation) } : {};

            // for bar chart take y axis options
            return {
                lineColor: '#d5d5d5',

                // hide ticks on x axis
                minorTickLength: 0,
                tickLength: 0,

                // padding of maximum value
                maxPadding: 0.05,

                labels: {
                    enabled: labelsEnabled,
                    style: {
                        color: styleVariables.gdColorStateBlank,
                        font: '12px Avenir, "Helvetica Neue", Arial, sans-serif'
                    },
                    autoRotation: [-90],
                    ...rotationProp
                },
                title: {
                    margin: 10,
                    style: {
                        color: styleVariables.gdColorLink,
                        font: '14px Avenir, "Helvetica Neue", Arial, sans-serif'
                    }
                },
                visible
            };
        })
    };
}

export function getCustomizedConfiguration(chartOptions: any) {
    const configurators = [
        getAxesConfiguration,
        getTitleConfiguration,
        getStackingConfiguration,
        hideOverlappedLabels,
        getShowInPercentConfiguration,
        getLabelsConfiguration,
        getDataConfiguration,
        getTooltipConfiguration,
        getHoverStyles,
        getGridConfiguration
    ];

    const commonData = configurators.reduce((config: any, configurator: any) => {
        return merge(config, configurator(chartOptions, config));
    }, {});

    return merge({}, commonData);
}
