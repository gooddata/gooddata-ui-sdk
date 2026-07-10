// (C) 2026 GoodData Corporation

import { type DataValue, type IMeasureGroupDescriptor, type ITheme } from "@gooddata/sdk-model";
import { type DataViewFacade, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import {
    type IChartFillConfig,
    type IColorStrategy,
    valueWithEmptyHandling,
} from "@gooddata/sdk-ui-vis-commons";

import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { type IPointData, type ISeriesItemConfig } from "../../typings/unsafe.js";
import { parseValue, unwrap } from "../_util/common.js";

/**
 * Mekko (Marimekko) series builder.
 *
 * Mekko needs TWO measures — Height (column height / Y axis) and Width (column width, the variwide `z`)
 * — plus an optional Stack-by attribute. The standard stacked-column path (`getDefaultSeries`) cannot
 * be reused, because it assumes a single measure when a stack attribute is present
 * (see chartSeries.ts: "you can not have multi-measure stacked charts").
 *
 * Assumed execution shape (set up by the public Mekko component via `stackedChartDimensions`).
 * Measure order follows bucket order: Width (MEASURES bucket) is index 0, Height
 * (SECONDARY_MEASURES bucket) is index 1.
 *   - measureGroup.items[WIDTH_MEASURE_INDEX]  = Width measure (MEASURES bucket)
 *   - measureGroup.items[HEIGHT_MEASURE_INDEX] = Height measure (SECONDARY_MEASURES bucket)
 *   - dimensions: [[stackBy?], [viewBy, MeasureGroup]] — so twoDimData() rows are stack elements
 *     (one row if no stack), and each row's values are ordered viewBy × measure:
 *     [v0_width, v0_height, v1_width, v1_height, ...].
 *
 * Width is reduced to ONE value per column (the variwide `z` must be identical across the stack so
 * the variable widths line up). For additive width measures (e.g. production volume) summing the
 * per-segment width values across the stack yields the column total. Every point in a column gets
 * that same `z`.
 */

// Width metric is the first (MEASURES bucket), Height the second (SECONDARY_MEASURES).
const WIDTH_MEASURE_INDEX = 0;
const HEIGHT_MEASURE_INDEX = 1;

export function getMekkoSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    _chartFill: IChartFillConfig | undefined,
    _theme: ITheme | undefined,
): ISeriesItemConfig[] {
    const data = dv.rawData().twoDimData();

    // The number of measures = however many metric buckets are actually filled.
    // During authoring this can be 0, 1 (only Width or only Height) or 2 — never assume 2.
    const measureCount = measureGroup.items.length;
    if (measureCount === 0 || data.length === 0) {
        return [];
    }

    const hasWidthMeasure = measureCount >= 2;
    // With a single metric present treat it as the Height (the value drawn on the Y axis);
    // width then falls back to equal-width columns (z = 1).
    const heightIndex = hasWidthMeasure ? HEIGHT_MEASURE_INDEX : 0;
    const heightDescriptor = measureGroup.items[heightIndex];
    const heightFormat = heightDescriptor ? unwrap(heightDescriptor).format : undefined;

    const buildPoint = (y: DataValue, z: number, viewIndex: number): IPointData => ({
        y: parseValue(y),
        z,
        format: heightFormat,
        name: viewByAttribute
            ? valueWithEmptyHandling(
                  getMappingHeaderFormattedName(viewByAttribute.items[viewIndex]),
                  emptyHeaderTitle,
              )
            : "",
    });

    // Sign-preserving so a negative Width metric stays negative (a negative column width is invalid
    // and is caught by validateData → onNegativeValues → empty state, before variwide ever renders).
    const finiteOrZero = (value: DataValue): number => {
        const parsed = parseValue(value);
        return Number.isFinite(parsed) ? (parsed as number) : 0;
    };

    if (stackByAttribute) {
        // Stacked layout from getBarColumnDimensions: [[stackBy], [viewBy, MeasureGroup]].
        // twoDimData rows = stack segments; each row's columns are ordered viewBy × measure
        // (view-major: [v0_width, v0_height, v1_width, v1_height, ...]).
        // viewCount must come from the data width — NOT viewByAttribute.items.length, which
        // counts view×measure header combinations.
        const viewCount = Math.round(data[0].length / measureCount);

        // column width (z) = width measure reduced to one value per column (summed across the
        // stack), sign-preserved. A net-negative column width is invalid and is rejected upstream
        // by validateData (empty state) — negative Height segments do not affect this width sum.
        const widthPerColumn: number[] = [];
        for (let v = 0; v < viewCount; v++) {
            widthPerColumn[v] = hasWidthMeasure
                ? data.reduce(
                      (sum: number, row: DataValue[]) =>
                          sum + finiteOrZero(row[v * measureCount + WIDTH_MEASURE_INDEX]),
                      0,
                  )
                : 1;
        }

        return data.map((row: DataValue[], seriesIndex: number): ISeriesItemConfig => {
            const seriesData: IPointData[] = [];
            for (let v = 0; v < viewCount; v++) {
                seriesData.push(buildPoint(row[v * measureCount + heightIndex], widthPerColumn[v], v));
            }
            return {
                name: valueWithEmptyHandling(
                    getMappingHeaderFormattedName(stackByAttribute.items[seriesIndex]),
                    emptyHeaderTitle,
                ),
                legendIndex: seriesIndex,
                seriesIndex,
                color: colorStrategy.getColorByIndex(seriesIndex),
                data: seriesData,
            };
        });
    }

    // Non-stacked layout from getBarColumnDimensions: [[MeasureGroup], [viewBy]].
    // twoDimData rows = measures; each row's columns are the viewBy values. One series.
    const heightRow = data[heightIndex] ?? [];
    const widthRow = hasWidthMeasure ? data[WIDTH_MEASURE_INDEX] : undefined;
    const seriesData = heightRow.map((value: DataValue, v: number) =>
        buildPoint(value, widthRow ? finiteOrZero(widthRow[v]) : 1, v),
    );

    return [
        {
            name: valueWithEmptyHandling(
                heightDescriptor ? unwrap(heightDescriptor).name : "",
                emptyHeaderTitle,
            ),
            legendIndex: 0,
            seriesIndex: 0,
            color: colorStrategy.getColorByIndex(0),
            data: seriesData,
        },
    ];
}
