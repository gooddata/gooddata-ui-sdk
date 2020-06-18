// (C) 2020 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import PushpinSizeLegend, { IPushpinSizeLegendProps } from "../PushpinSizeLegend";

function createComponent(customProps: IPushpinSizeLegendProps): ShallowWrapper {
    const legendProps = {
        ...customProps,
    };
    return shallow(<PushpinSizeLegend {...legendProps} />);
}

describe("PushpinSizeLegend", () => {
    it("should render component with max, average and min value", () => {
        const sizes: number[] = [10, 6, 4, 5, 20, 20, 4];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
        };
        const wrapper = createComponent(props);
        expect(wrapper.hasClass("s-pushpin-size-legend")).toBe(true);
        expect(wrapper.find(".metric-name").text()).toContain("population");
        expect(wrapper.find(".pushpin-size-legend-circle").at(0).find(".circle-value").text()).toEqual("4");
        expect(wrapper.find(".pushpin-size-legend-circle").at(1).find(".circle-value").text()).toEqual("10");
        expect(wrapper.find(".pushpin-size-legend-circle").at(2).find(".circle-value").text()).toEqual("20");
    });
    it("should not render component when Size contains all null values", () => {
        const sizes: Array<number | null> = [null, null, null];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
        };
        const wrapper = createComponent(props);
        expect(wrapper.hasClass("s-pushpin-size-legend")).toBe(false);
    });
    it("should not render component when min value is equal to max value", () => {
        const sizes: number[] = [1000, 1000, 1000];
        const props = {
            sizes,
            format: "#,##0.00",
            numericSymbols: ["k", "M", "G", "T", "P", "E"],
            measureName: "population",
        };
        const wrapper = createComponent(props);
        expect(wrapper.hasClass("s-pushpin-size-legend")).toBe(false);
    });
});
