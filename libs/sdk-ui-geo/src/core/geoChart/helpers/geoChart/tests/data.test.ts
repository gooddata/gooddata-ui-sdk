// (C) 2020-2023 GoodData Corporation
import { getGeoData, getLocation, parseCoordinate } from "../../geoChart/data";
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

describe("parseCoordinate", () => {
    it.each([
        ["44.500000", 44.5],
        ["-89.500000", -89.5],
    ])("should return number from coordinate string '%s'", (input: string, result: number) => {
        const location = parseCoordinate(input);
        expect(location).toEqual(result);
    });

    it.each(["abc", null])("should return null for invalid input '%s'", (input: string | null) => {
        const location = parseCoordinate(input);
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

    it("should return geoData with latitude, longitude and tooltipText", () => {
        const { geoData } = RecShortcuts.LatitudeAndLongitudeOnlyWithTooltip;
        expect(geoData).toMatchSnapshot();
    });
});
