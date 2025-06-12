// (C) 2020-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import GeoChartRenderer, { IGeoChartRendererProps } from "../GeoChartRenderer.js";
import { IGeoData } from "../../../GeoChart.js";
import { createIntlMock } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

const intl = createIntlMock();

function createComponent(customProps: Partial<IGeoChartRendererProps> = {}) {
    const chartProps: IGeoChartRendererProps = {
        ...customProps,
        intl,
    } as any;
    return render(<GeoChartRenderer {...chartProps} />);
}

vi.mock("mapbox-gl", async () => ({
    default: {
        Map: vi.fn(() => ({
            addControl: vi.fn(),
            on: vi.fn(),
            remove: vi.fn(),
        })),
        Popup: vi.fn(),
        AttributionControl: vi.fn(),
        NavigationControl: vi.fn(),
    },
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
