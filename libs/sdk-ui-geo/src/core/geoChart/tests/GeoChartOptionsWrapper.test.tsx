// (C) 2020-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { GeoChartOptionsWrapper } from "../GeoChartOptionsWrapper";
import { IGeoChartInnerProps, GeoChartInner } from "../GeoChartInner";
import { RecShortcuts } from "../../../../__mocks__/recordings";
import { createIntlMock, DefaultColorPalette } from "@gooddata/sdk-ui";
import { IGeoConfig } from "../../../GeoChart";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../GeoChartInner", () => ({
    GeoChartInner: jest.fn(() => null),
}));

const intl = createIntlMock({
    "visualization.ErrorDescriptionGeneric": "Error 1",
    "visualization.ErrorMessageNotFound": "Error 2",
    "visualization.ErrorMessageGeneric": "Error 3",
    "visualization.ErrorDescriptionNotFound": "Error 4",
    "visualization.ErrorDescriptionUnauthorized": "Error 5",
});

describe("GeoChartOptionsWrapper", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function renderComponent(
        customProps: Partial<IGeoChartInnerProps> = {},
        customConfig: Partial<IGeoConfig> = {},
    ) {
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
        return render(<GeoChartOptionsWrapper {...(defaultProps as any)} {...customProps} />);
    }
    const geoChartOptions = "geoChartOptions";

    it("should return geoChartOptions in props with location bucket", async () => {
        const { dv } = RecShortcuts.LocationOnlySmall;

        const props: Partial<IGeoChartInnerProps> = {
            config: {
                colorPalette: DefaultColorPalette.slice(0, 2),
                mapboxToken: "",
            },
            dataView: dv.dataView,
        };
        renderComponent(props);
        expect((GeoChartInner as any).mock.calls[0][0][geoChartOptions]).toMatchSnapshot();
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
        renderComponent(props);
        expect((GeoChartInner as any).mock.calls[0][0][geoChartOptions]).toMatchSnapshot();
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
