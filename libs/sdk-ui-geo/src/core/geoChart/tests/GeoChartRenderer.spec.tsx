// (C) 2020 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";

import GeoChartRenderer, { IGeoChartRendererProps } from "../GeoChartRenderer";

function createComponent(customProps: Partial<IGeoChartRendererProps> = {}): ShallowWrapper {
    const chartProps: Partial<IGeoChartRendererProps> = {
        ...customProps,
    };
    return shallow(<GeoChartRenderer {...chartProps} />, { disableLifecycleMethods: true });
}

describe("GeoChartRenderer", () => {
    const geoData = {};
    it("should render component", () => {
        const wrapper = createComponent({ geoData });
        expect(wrapper.hasClass("s-gd-geo-chart-renderer")).toBe(true);
    });

    it("should render GeoChartRenderer component in export mode", () => {
        const wrapper = createComponent({
            config: {
                isExportMode: true,
                mapboxToken: "",
            },
            geoData,
        });
        expect(wrapper.hasClass("s-isExportMode")).toBe(true);
    });
});
