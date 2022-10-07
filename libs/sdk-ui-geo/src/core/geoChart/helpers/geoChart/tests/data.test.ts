// (C) 2020-2022 GoodData Corporation
import { getGeoData, getLocation } from "../../geoChart/data";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { RecShortcuts } from "../../../../../../__mocks__/recordings";

describe("getLocation", () => {
    it("should return { lat, lng } from location string", () => {
        const location = getLocation("44.500000;-89.500000");
        expect(location).toEqual({
            lat: 44.5,
            lng: -89.5,
        });
    });

    it.each(["", "123"])("should return null when input is '%s'", (input: string) => {
        const location = getLocation(input);
        expect(location).toEqual(null);
    });
});

describe("geoChartData", () => {
    it("should return geoData with empty bucket", () => {
        const emptyDv = DataViewFacade.for(dummyDataView(emptyDef("testWorkspace")));

        const geoData = getGeoData(emptyDv, "empty value", "null value");
        expect(geoData).toEqual({});
    });

    it("should return geoData with all buckets", () => {
        const { geoData } = RecShortcuts.AllAndSmall;

        expect(geoData).toMatchSnapshot();
    });

    it("should return geoData with location, tooltipText, size", () => {
        const { geoData } = RecShortcuts.LocationSizeAndTooltip_Small;
        expect(geoData).toMatchSnapshot();
    });

    it("should return geoData with location, color, size", () => {
        const { geoData } = RecShortcuts.LocationSizeAndColor_Small;
        expect(geoData).toMatchSnapshot();
    });
});
