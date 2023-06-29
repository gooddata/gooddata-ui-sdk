// (C) 2020 GoodData Corporation

import { getColorStrategy } from "../../../colorStrategy/geoChart.js";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { RecShortcuts } from "../../../../../../__mocks__/recordings.js";
import { describe, it, expect } from "vitest";

describe("getColorStrategy", () => {
    it("should return GeoChartColorStrategy", () => {
        const { dv, geoData } = RecShortcuts.LocationOnly;
        const geoChartColorStrategy = getColorStrategy(DefaultColorPalette, undefined as any, geoData, dv);

        expect(geoChartColorStrategy.getColorAssignment()).toMatchSnapshot();
        expect(geoChartColorStrategy.getColorByIndex(0)).toEqual("rgb(20,178,226)");
        expect(geoChartColorStrategy.getColorByIndex(1)).toBeUndefined();
        expect(geoChartColorStrategy.getFullColorAssignment()).toMatchSnapshot();
    });
});
