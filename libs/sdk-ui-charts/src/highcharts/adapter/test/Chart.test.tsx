// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import Highcharts from "../../lib";
import { Chart } from "../Chart";

const destroyMock = jest.fn();

jest.mock("highcharts", () => {
    return {
        Chart: (_: any, callback: any) => ({
            callback: callback(),
            destroy: destroyMock,
        }),
    };
});

jest.mock("highcharts/modules/drilldown", () => {
    return (H: any) => H;
});

jest.mock("highcharts/modules/treemap", () => {
    return (H: any) => H;
});

jest.mock("highcharts/modules/bullet", () => {
    return (H: any) => H;
});

jest.mock("highcharts/modules/heatmap", () => {
    return (H: any) => H;
});

jest.mock("highcharts/modules/funnel", () => {
    return (H: any) => H;
});

jest.mock("highcharts/modules/sankey", () => {
    return (H: any) => H;
});

jest.mock("highcharts/modules/dependency-wheel", () => {
    return (H: any) => H;
});

jest.mock("highcharts/highcharts-more", () => {
    return (H: any) => H;
});

jest.mock("highcharts/modules/pattern-fill", () => {
    return (H: any) => H;
});

jest.mock("../chartPlugins", () => {
    return {
        initChartPlugins: (H: any) => H,
    };
});

describe("Chart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function createComponent(props: any = {}) {
        return render(<Chart config={{}} {...props} />);
    }

    it("should render highcharts", () => {
        const spy = jest.spyOn(Highcharts as any, "Chart");
        createComponent();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should call callback on componentDidMount", () => {
        const callback = jest.fn();
        createComponent({ callback });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should call destroy callback on componentWillUnmount", () => {
        createComponent();

        () => expect(destroyMock).toHaveBeenCalledTimes(1);
    });
});
