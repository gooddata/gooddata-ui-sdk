// (C) 2007-2020 GoodData Corporation
import partial = require("lodash/partial");
import cloneDeep = require("lodash/cloneDeep");
import Highcharts from "../highcharts/highchartsEntryPoint";
import { styleVariables } from "../../styles/variables";
import { tickLabelClick } from "../../utils/drilldownEventing";
import { ChartType, IDrillConfig, IHighchartsCategoriesTree, IHighchartsParentTick } from "@gooddata/sdk-ui";
import { IHighchartsPointObject } from "../../utils/isGroupHighchartsDrillEvent";

export function getDDPointsInParentTick(axis: any, tick: IHighchartsParentTick): IHighchartsPointObject[] {
    const { startAt, leaves } = tick;
    const ddPoints: IHighchartsPointObject[] = []; // drilldown points

    for (let i = startAt; i < startAt + leaves; i++) {
        ddPoints.push(...cloneDeep(axis.getDDPoints(i)));
    }

    // replace y value by target value for bullet chart target
    ddPoints.forEach((ddPoint) => {
        if ((ddPoint.series as any)?.userOptions?.bulletChartMeasureType === "target") {
            ddPoint.y = ddPoint.isNullTarget ? null : ddPoint.target;
        }
    });

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

export function setupDrilldown(chart: Highcharts.Chart, chartType: ChartType) {
    const xAxes: any[] = (chart && chart.xAxis) || [];
    const axis = xAxes[0];
    if (!axis) {
        return;
    }

    // not support chart without type
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
