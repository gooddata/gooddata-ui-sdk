// (C) 2020 GoodData Corporation
import * as React from "react";
import { ShallowWrapper, shallow } from "enzyme";
import { Execution } from "@gooddata/typings";
import { GeoChartOptionsWrapper } from "../GeoChartOptionsWrapper";
import { IGeoChartInnerProps } from "../GeoChartInner";
import { IGeoConfig } from "../../../../interfaces/GeoChart";
import { getExecutionResponse, getExecutionResult, getGeoConfig } from "../../../../../stories/data/geoChart";
import { createIntlMock } from "../../../visualizations/utils/intlUtils";
import { locationDataSource, locationSizeColorSegmentDataSource } from "../../../tests/mocks";
import { DEFAULT_COLOR_PALETTE } from "../../../visualizations/utils/color";

const intl = createIntlMock();

describe("GeoChartOptionsWrapper", () => {
    function renderComponent(
        customProps: Partial<IGeoChartInnerProps> = {},
        customConfig: Partial<IGeoConfig> = {},
    ): ShallowWrapper {
        const defaultProps: Partial<IGeoChartInnerProps> = {
            config: {
                mapboxToken: "",
                ...customConfig,
            },
            execution: {
                executionResponse: getExecutionResponse(true),
                executionResult: getExecutionResult(true),
            },
            intl,
        };
        return shallow(<GeoChartOptionsWrapper {...defaultProps} {...customProps} />);
    }

    it("should return geoChartOptions in props with location bucket", async () => {
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                ...getGeoConfig({ isWithLocation: true }),
                colorPalette: DEFAULT_COLOR_PALETTE.slice(0, 2),
            },
            execution: {
                executionResponse: getExecutionResponse(true),
                executionResult: getExecutionResult(true, false, false, false, false, 2),
            },
            dataSource: locationDataSource,
        };
        const wrapper = renderComponent(props);
        const geoChartOptions = "geoChartOptions";
        expect(wrapper.props()[geoChartOptions]).toEqual({
            geoData: {
                location: {
                    index: 0,
                    name: "State",
                    data: [
                        {
                            lat: 44.5,
                            lng: -89.5,
                        },
                        {
                            lat: 39,
                            lng: -80.5,
                        },
                    ],
                },
            },
            categoryItems: [],
            colorStrategy: {
                fullColorAssignment: [
                    {
                        headerItem: {
                            attributeHeader: {
                                name: "State",
                                localIdentifier: "a_state",
                                uri: "/gdc/md/projectId/obj/1",
                                identifier: "label.state",
                                formOf: {
                                    name: "State",
                                    uri: "any-uri",
                                    identifier: "attr.state",
                                },
                            },
                        },
                        color: {
                            type: "guid",
                            value: "1",
                        },
                    },
                ],
                outputColorAssignment: [
                    {
                        headerItem: {
                            attributeHeader: {
                                name: "State",
                                localIdentifier: "a_state",
                                uri: "/gdc/md/projectId/obj/1",
                                identifier: "label.state",
                                formOf: {
                                    name: "State",
                                    uri: "any-uri",
                                    identifier: "attr.state",
                                },
                            },
                        },
                        color: {
                            type: "guid",
                            value: "1",
                        },
                    },
                ],
                palette: ["rgb(20,178,226)"],
            },
            colorPalette: [
                {
                    guid: "1",
                    fill: {
                        r: 20,
                        g: 178,
                        b: 226,
                    },
                },
                {
                    guid: "2",
                    fill: {
                        r: 0,
                        g: 193,
                        b: 141,
                    },
                },
            ],
        });
    });

    it("should return geoChartOptions with full buckets", async () => {
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                ...getGeoConfig({
                    isWithLocation: true,
                    isWithColor: true,
                    isWithSegment: true,
                    isWithSize: true,
                    isWithTooltipText: true,
                }),
                colorPalette: DEFAULT_COLOR_PALETTE.slice(0, 5),
            },
            execution: {
                executionResponse: getExecutionResponse(true, true, true, true, true),
                executionResult: getExecutionResult(true, true, true, true, true, 20),
            },
            dataSource: locationSizeColorSegmentDataSource,
        };
        const wrapper = renderComponent(props);
        const geoChartOptions = "geoChartOptions";
        expect(wrapper.props()[geoChartOptions]).toEqual({
            categoryItems: [
                {
                    color: "rgb(20,178,226)",
                    isVisible: true,
                    legendIndex: 0,
                    name: "General Goods",
                    uri: "/gdc/md/storybook/obj/23/elements?id=1",
                },
                {
                    color: "rgb(0,193,141)",
                    isVisible: true,
                    legendIndex: 1,
                    name: "Toy Store",
                    uri: "/gdc/md/storybook/obj/23/elements?id=2",
                },
            ],
            colorPalette: [
                { fill: { b: 226, g: 178, r: 20 }, guid: "1" },
                { fill: { b: 141, g: 193, r: 0 }, guid: "2" },
                { fill: { b: 66, g: 77, r: 229 }, guid: "3" },
                { fill: { b: 0, g: 134, r: 241 }, guid: "4" },
                { fill: { b: 163, g: 85, r: 171 }, guid: "5" },
            ],
            colorStrategy: {
                fullColorAssignment: [
                    {
                        color: { type: "guid", value: "1" },
                        headerItem: {
                            attributeHeaderItem: {
                                name: "General Goods",
                                uri: "/gdc/md/storybook/obj/23/elements?id=1",
                            },
                        },
                    },
                    {
                        color: { type: "guid", value: "2" },
                        headerItem: {
                            attributeHeaderItem: {
                                name: "Toy Store",
                                uri: "/gdc/md/storybook/obj/23/elements?id=2",
                            },
                        },
                    },
                ],
                outputColorAssignment: [
                    {
                        color: { type: "guid", value: "1" },
                        headerItem: {
                            attributeHeaderItem: {
                                name: "General Goods",
                                uri: "/gdc/md/storybook/obj/23/elements?id=1",
                            },
                        },
                    },
                    {
                        color: { type: "guid", value: "2" },
                        headerItem: {
                            attributeHeaderItem: {
                                name: "Toy Store",
                                uri: "/gdc/md/storybook/obj/23/elements?id=2",
                            },
                        },
                    },
                ],
                palette: ["rgb(20,178,226)", "rgb(0,193,141)"],
            },
            geoData: {
                color: {
                    data: [
                        NaN,
                        6832,
                        3294,
                        8340,
                        957,
                        NaN,
                        253,
                        1047,
                        7520,
                        22220,
                        18,
                        2282,
                        5602,
                        150,
                        1242,
                        1782,
                        NaN,
                        2299,
                        596,
                        12064,
                    ],
                    format: "#,##0",
                    index: 1,
                    name: "Area",
                },
                location: {
                    data: [
                        { lat: 44.5, lng: -89.5 },
                        { lat: 39, lng: -80.5 },
                        { lat: 44, lng: -72.699997 },
                        { lat: 31, lng: -100 },
                        { lat: 44.5, lng: -100 },
                        { lat: 41.700001, lng: -71.5 },
                        { lat: 44, lng: -120.5 },
                        { lat: 43, lng: -75 },
                        { lat: 44, lng: -71.5 },
                        { lat: 41.5, lng: -100 },
                        { lat: 38.5, lng: -98 },
                        { lat: 33, lng: -90 },
                        { lat: 40, lng: -89 },
                        { lat: 39, lng: -75.5 },
                        { lat: 41.599998, lng: -72.699997 },
                        { lat: 34.799999, lng: -92.199997 },
                        { lat: 40.273502, lng: -86.126976 },
                        { lat: 38.573936, lng: -92.60376 },
                        { lat: 27.994402, lng: -81.760254 },
                        { lat: 39.876019, lng: -117.224121 },
                    ],
                    index: 0,
                    name: "State",
                },
                segment: {
                    data: [
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "General Goods",
                        "Toy Store",
                        "Toy Store",
                        "Toy Store",
                        "Toy Store",
                    ],
                    index: 1,
                    name: "Type",
                    uris: [
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=2",
                        "/gdc/md/storybook/obj/23/elements?id=2",
                        "/gdc/md/storybook/obj/23/elements?id=2",
                        "/gdc/md/storybook/obj/23/elements?id=2",
                    ],
                },
                size: {
                    data: [
                        1005,
                        943,
                        NaN,
                        4726,
                        1719,
                        2844,
                        838,
                        3060,
                        709,
                        772,
                        3949,
                        1766,
                        1560,
                        1938,
                        3836,
                        5302,
                        3310,
                        3500,
                        2288,
                        11564,
                    ],
                    format: "#,##0",
                    index: 0,
                    name: "Population",
                },
            },
        });
    });

    it("should return props with new excutionResult be replaced emptyHeaderString", async () => {
        const executionResult: Execution.IExecutionResult = {
            data: [],
            paging: {
                count: [1, 1],
                offset: [0, 0],
                total: [1, 1],
            },
            headerItems: [
                [
                    [
                        {
                            attributeHeaderItem: {
                                name: "",
                                uri: "/gdc/md/storybook/obj/694/elements?id=1",
                            },
                        },
                    ],
                ],
            ],
        };
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                ...getGeoConfig({
                    isWithLocation: true,
                }),
                colorPalette: DEFAULT_COLOR_PALETTE.slice(0, 5),
            },
            execution: {
                executionResponse: getExecutionResponse(true),
                executionResult,
            },
            dataSource: locationDataSource,
        };
        const wrapper = renderComponent(props);
        expect(wrapper.prop("execution")).toEqual(
            expect.objectContaining({
                executionResult: {
                    data: [],
                    paging: {
                        count: [1, 1],
                        offset: [0, 0],
                        total: [1, 1],
                    },
                    headerItems: [
                        [
                            [
                                {
                                    attributeHeaderItem: {
                                        name: "(empty value)",
                                        uri: "/gdc/md/storybook/obj/694/elements?id=1",
                                    },
                                },
                            ],
                        ],
                    ],
                },
            }),
        );
    });

    it("should call onDataTooLarge", () => {
        const onDataTooLarge = jest.fn();
        const props: Partial<IGeoChartInnerProps> = {
            config: { ...getGeoConfig({ isWithLocation: true }), limit: 5, mapboxToken: "" },
            onDataTooLarge,
            execution: {
                executionResponse: getExecutionResponse(true),
                executionResult: getExecutionResult(true),
            },
        };
        renderComponent(props);
        expect(onDataTooLarge).toBeCalled();
    });
});
