// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IResultAttributeHeader } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { recordedDataFacade } from "../../../testUtils/recordings.fixture.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { ColorFactory } from "../_chartOptions/colorFactory.js";
import { getMVSForViewByTwoAttributes } from "../_util/helper.js";
import { CUSTOM_COLOR_PALETTE } from "../tests/colorPalette.test.helpers.js";

import { CHART_TYPE, COLOR_MAPPINGS, EMPTY_HEADER_TITLE_VALUE, RECORDS } from "./sankeyChart.test.helpers.js";
import { buildSankeyChartSeries } from "./sankeyChartOptions.js";

describe("SankeyChart buildSankeyChartSeries", () => {
    it.each(RECORDS)("should return series correctly in cases %s", (_title, record) => {
        const dv = recordedDataFacade(record);
        const { viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);
        const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
            CUSTOM_COLOR_PALETTE,
            undefined,
            viewByAttribute,
            viewByParentAttribute,
            null,
            dv,
            CHART_TYPE,
        );
        const series = buildSankeyChartSeries(
            dv,
            [viewByParentAttribute, viewByAttribute],
            colorStrategy,
            EMPTY_HEADER_TITLE_VALUE,
        );
        expect(series).toMatchSnapshot();
    });

    it.each(RECORDS)(
        "should return series correctly with custom color mappings in cases %s",
        (_title, record) => {
            const dv = recordedDataFacade(record);
            const { viewByAttribute, viewByParentAttribute } = getMVSForViewByTwoAttributes(dv);

            const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                COLOR_MAPPINGS,
                viewByAttribute,
                viewByParentAttribute,
                null,
                dv,
                CHART_TYPE,
            );
            const series = buildSankeyChartSeries(
                dv,
                [viewByParentAttribute, viewByAttribute],
                colorStrategy,
                EMPTY_HEADER_TITLE_VALUE,
            );
            expect(series).toMatchSnapshot();
        },
    );

    describe("attributes with a number format", () => {
        const element = (name: string, formattedName?: string): IResultAttributeHeader => ({
            attributeHeaderItem: { uri: name, name, ...(formattedName ? { formattedName } : {}) },
        });
        const attribute = (
            items: IResultAttributeHeader[],
            numberFormat?: string,
        ): IUnwrappedAttributeHeadersWithItems =>
            ({ items, ...(numberFormat ? { numberFormat } : {}) }) as IUnwrappedAttributeHeadersWithItems;
        const dv = (data: number[]) =>
            ({ rawData: () => ({ dataAt: () => data }) }) as unknown as DataViewFacade;
        const colorStrategy = (items: IResultAttributeHeader[]) =>
            ({
                getColorAssignment: () => items.map((headerItem) => ({ headerItem })),
                getColorByIndex: (index: number) => `color${index}`,
            }) as unknown as IColorStrategy;

        it("should identify nodes by the raw value and show the formatted value", () => {
            // both values format to the same text, they must stay distinct nodes
            const from = [element("1.234", "1.23"), element("1.2349", "1.23")];
            const to = [element("A"), element("B")];

            const [series] = buildSankeyChartSeries(
                dv([1, 2]),
                [attribute(from, "#,#.##"), attribute(to)],
                colorStrategy([...from, ...to]),
                EMPTY_HEADER_TITLE_VALUE,
            );

            expect(series.nodes).toEqual([
                { id: "1.234", name: "1.23", color: "color0" },
                { id: "1.2349", name: "1.23", color: "color1" },
                { id: "A", color: "color2" },
                { id: "B", color: "color3" },
            ]);
            expect(series.data).toEqual([
                { from: "1.234", to: "A", weight: 1, name: "1.23" },
                { from: "1.2349", to: "B", weight: 2, name: "1.23" },
            ]);
        });

        it("should keep identifying elements of attributes without a number format by their display value", () => {
            const from = [element("2020-01", "Jan 2020")];
            const to = [element("X")];

            const [series] = buildSankeyChartSeries(
                dv([3]),
                [attribute(from), attribute(to)],
                colorStrategy([...from, ...to]),
                EMPTY_HEADER_TITLE_VALUE,
            );

            expect(series.nodes).toEqual([
                { id: "Jan 2020", color: "color0" },
                { id: "X", color: "color1" },
            ]);
            expect(series.data).toEqual([{ from: "Jan 2020", to: "X", weight: 3, name: "Jan 2020" }]);
        });
    });
});
