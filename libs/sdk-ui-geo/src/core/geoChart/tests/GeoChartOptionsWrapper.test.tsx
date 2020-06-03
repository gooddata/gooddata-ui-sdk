// (C) 2020 GoodData Corporation
import * as React from "react";
import { ShallowWrapper, shallow } from "enzyme";
import { GeoChartOptionsWrapper } from "../GeoChartOptionsWrapper";
import { IGeoChartInnerProps } from "../GeoChartInner";
import { RecShortcuts } from "../../../../__mocks__/recordings";
import { createIntlMock, DefaultColorPalette } from "@gooddata/sdk-ui";
import { IGeoConfig } from "../../../GeoChart";

const intl = createIntlMock();

describe("GeoChartOptionsWrapper", () => {
    function renderComponent(
        customProps: Partial<IGeoChartInnerProps> = {},
        customConfig: Partial<IGeoConfig> = {},
    ): ShallowWrapper {
        const { dv } = RecShortcuts.LocationOnlySmall;
        const defaultProps: Partial<IGeoChartInnerProps> = {
            config: {
                mapboxToken: "",
                ...customConfig,
            },
            dataView: dv.dataView,
            execution: dv.result().transform(),
            intl,
        };
        return shallow(<GeoChartOptionsWrapper {...(defaultProps as any)} {...customProps} />);
    }

    it("should return geoChartOptions in props with location bucket", async () => {
        const { dv } = RecShortcuts.LocationOnlySmall;

        const props: Partial<IGeoChartInnerProps> = {
            config: {
                colorPalette: DefaultColorPalette.slice(0, 2),
                mapboxToken: "",
            },
            dataView: dv.dataView,
        };
        const wrapper = renderComponent(props);
        const geoChartOptions = "geoChartOptions";
        expect(wrapper.props()[geoChartOptions]).toMatchSnapshot();
    });

    it("should return geoChartOptions with full buckets", async () => {
        const { dv } = RecShortcuts.AllAndSmall;
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                colorPalette: DefaultColorPalette.slice(0, 5),
                mapboxToken: "",
            },
            dataView: dv.dataView,
        };
        const wrapper = renderComponent(props);
        const geoChartOptions = "geoChartOptions";
        expect(wrapper.props()[geoChartOptions]).toMatchSnapshot();
    });

    it("should call onDataTooLarge", () => {
        const onDataTooLarge = jest.fn();
        const { dv } = RecShortcuts.LocationOnlySmall;
        const props: Partial<IGeoChartInnerProps> = {
            config: { limit: 5, mapboxToken: "" },
            onDataTooLarge,
            dataView: dv.dataView,
        };
        renderComponent(props);
        expect(onDataTooLarge).toBeCalled();
    });
});
