// (C) 2025 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { IntlShape, useIntl } from "react-intl";

import {
    DataValue,
    IColorPalette,
    IMeasure,
    ISettings,
    modifyInlineMeasure,
    newAttribute,
    newInlineMeasure,
    newMeasureSort,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ComboChart, IChartConfig } from "@gooddata/sdk-ui-charts";
import { IUiListboxInteractiveItem, useElementSize } from "@gooddata/sdk-ui-kit";

import { selectColorPalette, selectSettings, useDashboardSelector } from "../../model/index.js";
import { KdaItem } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";
import { IKdaDefinition } from "../types.js";

const KDA_LIMIT = 20;

export function KdaKeyDriverChart() {
    const intl = useIntl();
    const { state } = useKdaState();
    const { ref, height } = useElementSize<HTMLDivElement>();
    const [[min, max], setRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);

    const colorPalette = useDashboardSelector(selectColorPalette);
    const settings = useDashboardSelector(selectSettings);

    const selectedItem = state.selectedItem;
    const definition = state.definition;

    if (selectedItem === "summary" || !definition) {
        return null;
    }

    const { primaryMeasures, secondaryMeasures, viewBy, sortBy, filters, deviation } = createChartData(
        intl,
        definition,
        selectedItem,
    );

    return (
        <div className={cx("gd-kda-key-drivers-detail-visualisation-container")} ref={ref}>
            <ComboChart
                locale={intl.locale}
                height={height}
                primaryMeasures={primaryMeasures}
                secondaryMeasures={secondaryMeasures}
                viewBy={viewBy}
                sortBy={sortBy}
                filters={filters}
                config={createConfig(settings, colorPalette, min, max)}
                onDataView={(dv) => {
                    const { min, max } = calculateMinMax(dv, deviation);
                    setRange([min, max]);
                }}
            />
        </div>
    );
}

function createConfig(
    settings: ISettings,
    colorPalette: IColorPalette,
    min: number | undefined,
    max: number | undefined,
): IChartConfig {
    return {
        colorPalette,
        chartFill: {
            type: "outline",
        },
        tooltip: {
            enabled: true,
            className: "gd-kda__vis_tooltip",
        },
        legend: {
            enabled: false,
            responsive: "autoPositionWithPopup" as const,
        },
        dataPoints: {
            visible: false,
        },
        yaxis: {
            min: min?.toString(),
            max: max?.toString(),
        },
        secondary_yaxis: {
            labelsEnabled: false,
            name: {
                visible: false,
            },
            min: min?.toString(),
            max: max?.toString(),
        },
        enableAccessibleTooltip: settings.enableAccessibleChartTooltip,
    };
}

function createChartData(
    intl: IntlShape,
    definition: IKdaDefinition,
    selectedItem: IUiListboxInteractiveItem<KdaItem>,
) {
    const title = intl.formatMessage({ id: "kdaDialog.dialog.keyDriver.chart.std" });
    const metric = definition.metric;
    const trend = selectedItem.data.to.value - selectedItem.data.from.value;

    const deviation =
        trend >= 0
            ? selectedItem.data.mean + selectedItem.data.standardDeviation
            : selectedItem.data.mean - selectedItem.data.standardDeviation;

    const primaryMeasures = [metric];
    const secondaryMeasures = [createStandardDeviationMeasure(metric, title, deviation)];

    const viewBy = [
        newAttribute(selectedItem.data.attribute, (m) => {
            return m.localId("attribute").alias(selectedItem.data.title);
        }),
    ];

    const sortBy = [newMeasureSort(metric.measure.localIdentifier, "desc")];

    const operator = trend >= 0 ? "TOP" : "BOTTOM";
    const filters = [newRankingFilter(metric.measure.localIdentifier, operator, KDA_LIMIT)];

    return {
        primaryMeasures,
        secondaryMeasures,
        viewBy,
        sortBy,
        filters,
        deviation,
    };
}

function createStandardDeviationMeasure(metric: IMeasure, title: string, deviation: number) {
    return modifyInlineMeasure(newInlineMeasure(`SELECT ${deviation}`), (m) => {
        return m
            .title(title)
            .localId(`${metric.measure.localIdentifier}_ranking`)
            .format(metric.measure.format);
    });
}

function calculateMinMax(dv: DataViewFacade, deviation: number) {
    const data = dv.rawData().data();

    function calcMin(vals: DataValue[]) {
        return vals.reduce<number>((min, val) => {
            if (val === null) {
                return min;
            }
            return Math.min(min, parseFloat(String(val)));
        }, Infinity);
    }

    function calcMax(vals: DataValue[]) {
        return vals.reduce<number>((max, val) => {
            if (val === null) {
                return max;
            }
            return Math.max(max, parseFloat(String(val)));
        }, -Infinity);
    }

    let min = data.reduce<number>((min, val) => {
        if (Array.isArray(val)) {
            return Math.min(min, calcMin(val));
        }
        return Math.min(min, parseFloat(String(val)));
    }, Infinity);
    let max = data.reduce<number>((max, val) => {
        if (Array.isArray(val)) {
            return Math.max(max, calcMax(val));
        }
        return Math.max(max, parseFloat(String(val)));
    }, -Infinity);

    //apply also deviation
    min = Math.min(min, deviation);
    max = Math.max(max, deviation);

    return {
        min,
        max,
    };
}
