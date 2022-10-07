// (C) 2019-2022 GoodData Corporation
import mapboxgl from "mapbox-gl";
import { createPushpinDataSource, IGeoDataSourceProps } from "../geoChartDataSource";
import { DataViewFacade, DefaultColorPalette } from "@gooddata/sdk-ui";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";
import { getGeoData } from "../helpers/geoChart/data";
import { getColorStrategy } from "../colorStrategy/geoChart";
import { RecShortcuts } from "../../../../__mocks__/recordings";

const commonDataSourceProps: Partial<IGeoDataSourceProps> = {
    config: { mapboxToken: "" },
    hasClustering: false,
};

function createProps(complement: Partial<IGeoDataSourceProps>): IGeoDataSourceProps {
    return {
        ...commonDataSourceProps,
        ...complement,
    } as any;
}

describe("createPushpinDataSource", () => {
    it("should return empty data source", () => {
        const emptyDv = DataViewFacade.for(dummyDataView(emptyDef("testWorkspace")));
        const geoData = getGeoData(emptyDv, "empty value", "null value");

        const dataSourceProps = createProps({
            hasClustering: true,
            geoData,
        });

        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.data).toEqual({
            type: "FeatureCollection",
            features: [],
        });
    });

    it("should return color palette and size scale", () => {
        const { dv, geoData } = RecShortcuts.LocationSizeAndColor_Small;
        const colorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const dataSourceProps = createProps({
            colorStrategy,
            geoData,
        });
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        const data = source.data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
        expect(data.features[0]).toMatchSnapshot();

        expect(source.type).toEqual("geojson");
    });

    it("should return location without measure", () => {
        const { dv, geoData } = RecShortcuts.LocationOnlySmall;
        const colorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const dataSourceProps = createProps({
            colorStrategy,
            geoData,
        });
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.data).toMatchSnapshot();
    });

    it("should not return data source with clusters", () => {
        const { dv, geoData } = RecShortcuts.LocationAndColor_Small;
        const colorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const dataSourceProps = createProps({
            colorStrategy,
            geoData,
        });
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.cluster).toBe(undefined);
    });

    it("should return data source with clusters", () => {
        const { dv, geoData } = RecShortcuts.LocationOnly;
        const colorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const dataSourceProps = createProps({
            colorStrategy,
            geoData,
            hasClustering: true,
        });
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.cluster).toBe(true);
        expect(source.clusterMaxZoom).toBe(14);
        expect(source.clusterRadius).toBe(50);
    });
});
