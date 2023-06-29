// (C) 2007-2022 GoodData Corporation
import partial from "lodash/partial.js";
import Highcharts from "../../lib/index.js";
import { styleVariables } from "./styles/variables.js";
import { tickLabelClick } from "./drilldownEventing.js";
import { ChartType, IDrillConfig, IHighchartsCategoriesTree, IHighchartsParentTick } from "@gooddata/sdk-ui";
import { IHighchartsPointObject } from "./isGroupHighchartsDrillEvent.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getDDPointsInParentTick(axis: any, tick: IHighchartsParentTick): IHighchartsPointObject[] {
    const { startAt, leaves } = tick;
    const ddPoints: IHighchartsPointObject[] = []; // drilldown points

    for (let i = startAt; i < startAt + leaves; i++) {
        const currentDDPoints: IHighchartsPointObject[] = axis.getDDPoints(i);
        ddPoints.push(...currentDDPoints.filter((point) => !!point));
    }

    // replace y value by target value for bullet chart target
    return ddPoints.map((ddPoint) => {
        if ((ddPoint.series as any)?.userOptions?.bulletChartMeasureType === "target") {
            return Object.assign({}, ddPoint, { y: ddPoint.isNullTarget ? null : ddPoint.target });
        }
        return ddPoint;
    });
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
    } else if (label?.basicStyles) {
        label.styles = {}; // reset for full overwrite of styles
        label.css(label.basicStyles);
        label.on("click", null);
    }
}

export function setupDrilldown(chart: Highcharts.Chart, chartType: ChartType): void {
    const xAxes: any[] = chart?.xAxis || [];
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
