// (C) 2019-2020 GoodData Corporation
import { Execution } from "@gooddata/typings";
import mapboxgl from "mapbox-gl";
import { createPushpinDataSource, IGeoDataSourceProps } from "../geoChartDataSource";
import { IGeoData } from "../../../../interfaces/GeoChart";
import {
    getExecutionResponse,
    getExecutionResult,
    COLOR_NUMBERS,
    LOCATION_LNGLATS,
    SIZE_NUMBERS,
    IMockGeoOptions,
} from "../../../../../stories/data/geoChart";
import { buildMockColorStrategy } from "./mock";

describe("createPushpinDataSource", () => {
    const execution: Execution.IExecutionResponses = {
        executionResponse: getExecutionResponse(false),
        executionResult: getExecutionResult(false),
    };
    const geoData: IGeoData = {
        location: {
            data: [],
            index: 0,
            name: "location",
        },
    };
    const mockColorStrategy = buildMockColorStrategy({ isWithLocation: true }, execution, geoData);
    const commonDataSourceProps: IGeoDataSourceProps = {
        colorStrategy: mockColorStrategy,
        config: { mapboxToken: "" },
        geoData,
        hasClustering: false,
    };

    it("should return empty data source", () => {
        const dataSourceProps: IGeoDataSourceProps = {
            ...commonDataSourceProps,
            hasClustering: true,
        };
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.data).toEqual({
            type: "FeatureCollection",
            features: [],
        });
    });

    it("should return color palette and size scale", () => {
        const geoOptions: IMockGeoOptions = {
            isWithColor: true,
            isWithLocation: true,
            isWithSize: true,
        };
        const execution: Execution.IExecutionResponses = {
            executionResponse: getExecutionResponse(true, false, false, true, true),
            executionResult: getExecutionResult(true, false, false, true, true),
        };
        const geoData: IGeoData = {
            size: {
                index: 0,
                name: "size",
                data: [SIZE_NUMBERS[0]],
                format: "#,##0.00",
            },
            color: {
                index: 1,
                name: "color",
                data: [COLOR_NUMBERS[0]],
                format: "#,##0.00",
            },
            location: {
                index: 0,
                name: "location",
                data: [LOCATION_LNGLATS[0]],
            },
        };
        const colorStrategy = buildMockColorStrategy(geoOptions, execution, geoData);

        const dataSourceProps: IGeoDataSourceProps = {
            ...commonDataSourceProps,
            colorStrategy,
            geoData,
        };
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        const data = source.data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
        expect(data.features[0]).toEqual({
            geometry: {
                coordinates: [-89.5, 44.5],
                type: "Point",
            },
            properties: {
                pushpinSize: 8,
                color: {
                    background: "rgba(20,178,226,0.7)",
                    border: "rgb(233,237,241)",
                    title: "color",
                    value: NaN,
                    format: "#,##0.00",
                },
                locationIndex: 0,
                locationName: {
                    title: "",
                    value: undefined,
                },
                segment: {
                    title: "",
                    value: undefined,
                },
                size: {
                    title: "size",
                    value: 1005,
                    format: "#,##0.00",
                },
            },
            type: "Feature",
        });

        expect(source.type).toEqual("geojson");
    });

    it("should return location without measure", () => {
        const geoOptions: IMockGeoOptions = {
            isWithLocation: true,
        };
        const execution: Execution.IExecutionResponses = {
            executionResponse: getExecutionResponse(true),
            executionResult: getExecutionResult(true),
        };
        const geoData: IGeoData = {
            location: {
                index: 0,
                name: "location",
                data: [
                    {
                        lat: 19.0415,
                        lng: -155.6254,
                    },
                    {
                        lat: 19.0698,
                        lng: -155.5751,
                    },
                    {
                        lat: 19.0716,
                        lng: -155.6143,
                    },
                ],
            },
        };
        const colorStrategy = buildMockColorStrategy(geoOptions, execution, geoData);

        const dataSourceProps: IGeoDataSourceProps = {
            ...commonDataSourceProps,
            colorStrategy,
            geoData,
        };
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.data).toEqual({
            features: [
                {
                    geometry: { coordinates: [-155.6254, 19.0415], type: "Point" },
                    properties: {
                        pushpinSize: 8,
                        color: {
                            format: "",
                            title: "",
                            value: undefined,
                            background: "rgba(20,178,226,0.7)",
                            border: "rgb(233,237,241)",
                        },
                        locationIndex: 0,
                        locationName: { title: "", value: undefined },
                        segment: { title: "", value: undefined },
                        size: { format: "", title: "", value: undefined },
                    },
                    type: "Feature",
                },
                {
                    geometry: { coordinates: [-155.5751, 19.0698], type: "Point" },
                    properties: {
                        pushpinSize: 8,
                        color: {
                            format: "",
                            title: "",
                            value: undefined,
                            background: "rgba(20,178,226,0.7)",
                            border: "rgb(233,237,241)",
                        },
                        locationIndex: 1,
                        locationName: { title: "", value: undefined },
                        segment: { title: "", value: undefined },
                        size: { format: "", title: "", value: undefined },
                    },
                    type: "Feature",
                },
                {
                    geometry: { coordinates: [-155.6143, 19.0716], type: "Point" },
                    properties: {
                        pushpinSize: 8,
                        color: {
                            format: "",
                            title: "",
                            value: undefined,
                            background: "rgba(20,178,226,0.7)",
                            border: "rgb(233,237,241)",
                        },
                        locationIndex: 2,
                        locationName: { title: "", value: undefined },
                        segment: { title: "", value: undefined },
                        size: { format: "", title: "", value: undefined },
                    },
                    type: "Feature",
                },
            ],
            type: "FeatureCollection",
        });
    });

    it("should not return data source with clusters", () => {
        const geoOptions: IMockGeoOptions = {
            isWithColor: true,
            isWithLocation: true,
        };
        const execution: Execution.IExecutionResponses = {
            executionResponse: getExecutionResponse(true, false, false, false, true),
            executionResult: getExecutionResult(true, false, false, false, true),
        };
        const geoData: IGeoData = {
            color: {
                index: 0,
                name: "color",
                data: [COLOR_NUMBERS[0]],
                format: "#,##0",
            },
            location: {
                index: 0,
                name: "location",
                data: [LOCATION_LNGLATS[0]],
            },
        };
        const colorStrategy = buildMockColorStrategy(geoOptions, execution, geoData);

        const dataSourceProps: IGeoDataSourceProps = {
            ...commonDataSourceProps,
            colorStrategy,
            geoData,
        };
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.cluster).toBe(undefined);
    });

    it("should return data source with clusters", () => {
        const geoOptions: IMockGeoOptions = {
            isWithLocation: true,
        };
        const execution: Execution.IExecutionResponses = {
            executionResponse: getExecutionResponse(true),
            executionResult: getExecutionResult(true),
        };
        const geoData: IGeoData = {
            location: {
                index: 0,
                name: "location",
                data: [LOCATION_LNGLATS[0]],
            },
        };
        const colorStrategy = buildMockColorStrategy(geoOptions, execution, geoData);

        const dataSourceProps: IGeoDataSourceProps = {
            ...commonDataSourceProps,
            colorStrategy,
            geoData,
            hasClustering: true,
        };
        const source: mapboxgl.GeoJSONSourceRaw = createPushpinDataSource(dataSourceProps);

        expect(source.cluster).toBe(true);
        expect(source.clusterMaxZoom).toBe(14);
        expect(source.clusterRadius).toBe(50);
    });
});
