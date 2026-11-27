// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type InlineColumnChart as InlineColumnChartComponent } from "./InlineColumnChart.js";
import { type InlineLineChart as InlineLineChartComponent } from "./InlineLineChart.js";

const { highchartsReact } = vi.hoisted(() => ({ highchartsReact: vi.fn((_props: any) => null) }));

vi.mock("highcharts-react-official", () => ({ HighchartsReact: highchartsReact }));

const props = {
    height: 40,
    data: [],
    headerItems: [],
    metricTitle: "Amount",
    tooltipZIndex: 6002,
};

describe("repeater inline charts", () => {
    // The charts are imported dynamically from a fresh module registry so that they pick up the mock above
    // even when another (non-isolated) test file already imported Highcharts without it.
    let InlineColumnChart: typeof InlineColumnChartComponent;
    let InlineLineChart: typeof InlineLineChartComponent;

    beforeAll(async () => {
        vi.resetModules();
        ({ InlineColumnChart } = await import("./InlineColumnChart.js"));
        ({ InlineLineChart } = await import("./InlineLineChart.js"));
    });

    beforeEach(() => {
        highchartsReact.mockClear();
    });

    it.each([
        ["column", () => InlineColumnChart],
        ["line", () => InlineLineChart],
    ])("should render the %s chart tooltip outside of the chart with the given z-index", (_, getChart) => {
        const Chart = getChart();
        render(<Chart {...props} />);

        expect(highchartsReact.mock.calls[0][0].options.tooltip).toMatchObject({
            outside: true,
            style: { zIndex: 6002 },
        });
    });

    it.each([
        ["column", () => InlineColumnChart],
        ["line", () => InlineLineChart],
    ])(
        "should show the formatted slice value in the %s chart tooltip whenever there is one",
        (_, getChart) => {
            const Chart = getChart();
            const tooltipOf = (headerItem: { uri: string; name: string; formattedName?: string }) => {
                highchartsReact.mockClear();
                render(
                    <Chart
                        {...props}
                        data={[{ value: 10, formattedValue: "10" }]}
                        headerItems={[headerItem]}
                        sliceTitle="Slice"
                    />,
                );
                return highchartsReact.mock.calls[0][0].options.tooltip.formatter.call({ x: 0 }) as string;
            };

            // numeric computed attribute and date attribute values carry a formatted name
            expect(tooltipOf({ uri: "1234.5", name: "1234.5", formattedName: "1 234,5" })).toContain(
                "1 234,5",
            );
            expect(tooltipOf({ uri: "2011-4", name: "2011-4", formattedName: "Q4 2011" })).toContain(
                "Q4 2011",
            );
            // a regular attribute value has none and shows as it is
            expect(tooltipOf({ uri: "Gold", name: "Gold" })).toContain("Gold");
        },
    );
});
