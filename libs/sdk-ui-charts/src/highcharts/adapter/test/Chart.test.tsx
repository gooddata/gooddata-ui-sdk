// (C) 2007-2025 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import Highcharts from "../../lib/index.js";
import { Chart } from "../Chart.js";

const destroyMock = vi.fn();

vi.mock("highcharts", () => {
    return {
        default: {
            Chart: (_: any, callback: any) => ({
                callback: callback(),
                destroy: destroyMock,
            }),
        },
    };
});

vi.mock("highcharts/esm/modules/drilldown", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/treemap", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/bullet", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/heatmap", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/funnel", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/sankey", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/dependency-wheel", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/highcharts-more", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/pattern-fill", () => {
    return { default: vi.fn() };
});

vi.mock("highcharts/esm/modules/accessibility", () => {
    return { default: vi.fn() };
});

vi.mock("../chartPlugins", () => {
    return {
        initChartPlugins: (H: any) => H,
    };
});

describe("Chart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function createComponent(props: any = {}) {
        return render(<Chart config={{}} {...props} />);
    }

    it("should render highcharts", () => {
        const spy = vi.spyOn(Highcharts as any, "Chart");
        createComponent();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call callback on componentDidMount", () => {
        const callback = vi.fn();
        createComponent({ callback });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should call destroy callback on componentWillUnmount", () => {
        createComponent();

        () => expect(destroyMock).toHaveBeenCalledTimes(1);
    });
});
