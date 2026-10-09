// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InlineColumnChart } from "./InlineColumnChart.js";
import { InlineLineChart } from "./InlineLineChart.js";

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
    beforeEach(() => {
        highchartsReact.mockClear();
    });

    it.each([
        ["column", InlineColumnChart],
        ["line", InlineLineChart],
    ])("should render the %s chart tooltip outside of the chart with the given z-index", (_, Chart) => {
        render(<Chart {...props} />);

        expect(highchartsReact.mock.calls[0][0].options.tooltip).toMatchObject({
            outside: true,
            style: { zIndex: 6002 },
        });
    });
});
