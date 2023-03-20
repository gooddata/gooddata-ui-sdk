// (C) 2020-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import GeoChartRenderer, { IGeoChartRendererProps } from "../GeoChartRenderer";
import { IGeoData } from "../../../../src/GeoChart";
import { createIntlMock } from "@gooddata/sdk-ui";

const intl = createIntlMock();

function createComponent(customProps: Partial<IGeoChartRendererProps> = {}) {
    const chartProps: IGeoChartRendererProps = {
        ...customProps,
        intl,
    } as any;
    return render(<GeoChartRenderer {...chartProps} />);
}

jest.mock("mapbox-gl", () => ({
    ...jest.requireActual("mapbox-gl"),
    Map: jest.fn(() => ({
        addControl: jest.fn(),
        on: jest.fn(),
        remove: jest.fn(),
    })),
}));

describe("GeoChartRenderer", () => {
    const geoData: IGeoData = { location: { data: [], name: "test", index: 0 } };
    it("should render component", () => {
        createComponent({ geoData });
        expect(document.querySelector(".s-gd-geo-chart-renderer")).toBeInTheDocument();
    });

    it("should render GeoChartRenderer component in export mode", () => {
        createComponent({
            config: {
                isExportMode: true,
                mapboxToken: "",
            },
            geoData,
        });
        expect(document.querySelector(".s-isExportMode")).toBeInTheDocument();
    });
});
