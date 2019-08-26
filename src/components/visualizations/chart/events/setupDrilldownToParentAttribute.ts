// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import partial = require("lodash/partial");
import Highcharts from "../highcharts/highchartsEntryPoint";
import { styleVariables } from "../../styles/variables";
import { tickLabelClick } from "../../utils/drilldownEventing";
import { ChartType } from "../../../../constants/visualizationTypes";
import {
    IDrillConfig,
    IHighchartsCategoriesTree,
    IHighchartsParentTick,
    IHighchartsPointObject,
} from "../../../../interfaces/DrillEvents";

function getDDPointsInParentTick(axis: any, tick: IHighchartsParentTick): IHighchartsPointObject[] {
    const { startAt, leaves } = tick;
    const ddPoints: IHighchartsPointObject[] = []; // drilldown points

    for (let i = startAt; i < startAt + leaves; i++) {
        ddPoints.push(...axis.getDDPoints(i));
    }

    return ddPoints;
}

function setParentTickDrillable(
    drillConfig: IDrillConfig,
    target: EventTarget,
    chartType: ChartType,
    tick: IHighchartsParentTick,
    ddPoints: IHighchartsPointObject[],
) {
    // copy behavior 'Tick.prototype.drillable' from 'highcharts/module/drilldown.js'
    const label = tick.label;
    const drilldownStyle = {
        cursor: "pointer",
        color: styleVariables.gdColorText,
    };
    if (label && ddPoints && ddPoints.length) {
        if (!label.basicStyles) {
            label.basicStyles = { ...label.styles };
        }
        label
            .addClass("highcharts-drilldown-axis-label")
            .css(drilldownStyle)
            .on("click", () => {
                tickLabelClick(drillConfig, ddPoints, target, chartType);
            });
    } else if (label && label.basicStyles) {
        label.styles = {}; // reset for full overwrite of styles
        label.css(label.basicStyles);
        label.on("click", null);
    }
}

export function setupDrilldown(chart: Highcharts.Chart) {
    const xAxes: any[] = (chart && chart.xAxis) || [];
    const axis = xAxes[0];
    if (!axis) {
        return;
    }

    // not support chart without type
    const chartType: ChartType | null = get(chart, "options.chart.type", null);
    if (!chartType) {
        return;
    }

    const {
        categoriesTree,
        userOptions: { drillConfig },
    } = axis;

    const setParentTickDrillableFunc = partial(
        setParentTickDrillable,
        drillConfig,
        chart.container,
        chartType,
    );

    (categoriesTree || []).forEach((categories: IHighchartsCategoriesTree) => {
        const { tick } = categories;
        if (!tick) {
            return;
        }

        const ddPoints = getDDPointsInParentTick(axis, tick);
        setParentTickDrillableFunc(tick, ddPoints);
    });
}
