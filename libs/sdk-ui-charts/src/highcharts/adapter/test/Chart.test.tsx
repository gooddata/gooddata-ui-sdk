// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import Highcharts from "../../lib";
import { Chart } from "../Chart";

jest.mock("highcharts", () => {
    return {
        Chart: (_: any, callback: any) => {
            callback();
        },
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
    function createComponent(props: any = {}) {
        return mount(<Chart config={{}} {...props} />);
    }

    it("should render highcharts", () => {
        const spy = jest.spyOn(Highcharts as any, "Chart");
        const wrapper = createComponent();
        const component: any = wrapper.instance();
        expect(component.chart).toBeTruthy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should rerender highcharts on props change", () => {
        const createChartSpy = jest.spyOn(Chart.prototype, "createChart");
        const wrapper = createComponent();

        expect(createChartSpy).toHaveBeenCalledTimes(1);

        wrapper.setProps({ config: { foo: "bar" } });
        expect(createChartSpy).toHaveBeenCalledTimes(2);

        createChartSpy.mockReset();
        createChartSpy.mockRestore();
    });

    it("should call callback on componentDidMount", () => {
        const callback = jest.fn();
        createComponent({ callback });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should call destroy callback on componentWillUnmount", () => {
        const wrapper = createComponent();
        const component: any = wrapper.instance();
        component.chart.destroy = jest.fn();

        component.componentWillUnmount();
        expect(component.chart.destroy).toHaveBeenCalledTimes(1);
    });
});
