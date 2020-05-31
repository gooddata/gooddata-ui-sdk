// (C) 2020 GoodData Corporation
import * as React from "react";
import { AFM } from "@gooddata/typings";
import { ShallowWrapper, shallow } from "enzyme";
import { GeoChartInner, IGeoChartInnerProps, IGeoChartInnerOptions } from "../GeoChartInner";
import { IGeoConfig } from "../../../../interfaces/GeoChart";
import {
    getAfm,
    getExecutionResponse,
    getExecutionResult,
    getGeoConfig,
    IMockGeoOptions,
} from "../../../../../stories/data/geoChart";
import { getGeoData } from "../../../../helpers/geoChart/data";
import { DEFAULT_COLOR_PALETTE } from "../../../visualizations/utils/color";
import { FLUID_LEGEND_THRESHOLD } from "../../../../constants/legend";
import { LEFT, RIGHT, TOP, BOTTOM } from "../../../visualizations/chart/legend/PositionTypes";
import { PositionType } from "../../../visualizations/typings/legend";
import { buildMockColorStrategy } from "./mock";

const geoOptions: IMockGeoOptions = {
    isWithColor: true,
    isWithLocation: true,
    isWithSize: true,
    isWithSegment: true,
    isWithTooltipText: true,
};

const execution = {
    executionResponse: getExecutionResponse(true, true, true, true, true),
    executionResult: getExecutionResult(true, true, true, true, true, 5),
};
const config = getGeoConfig(geoOptions);
const { mdObject: { buckets = [] } = {} } = config;

function buildGeoChartOptions(): IGeoChartInnerOptions {
    const geoData = getGeoData(buckets, execution);
    const mockColorStrategy = buildMockColorStrategy(geoOptions, execution, geoData);
    const categoryItems = [
        {
            name: "General Goods",
            legendIndex: 0,
            color: "rgb(20,178,226)",
            isVisible: true,
            uri: "/gdc/md/projectId/obj/1",
        },
        {
            name: "Toy Store",
            legendIndex: 1,
            color: "rgb(0,193,141)",
            isVisible: true,
            uri: "/gdc/md/projectId/obj/2",
        },
        {
            name: "Speciality",
            legendIndex: 2,
            color: "rgb(229,77,66)",
            isVisible: true,
            uri: "/gdc/md/projectId/obj/3",
        },
        {
            name: "Convenience",
            legendIndex: 3,
            color: "rgb(241,134,0)",
            isVisible: true,
            uri: "/gdc/md/projectId/obj/4",
        },
    ];

    return {
        geoData,
        categoryItems,
        colorStrategy: mockColorStrategy,
        colorPalette: DEFAULT_COLOR_PALETTE,
    };
}

describe("GeoChartInner", () => {
    function renderComponent(
        customProps: Partial<IGeoChartInnerProps> = {},
        customConfig: Partial<IGeoConfig> = {},
    ): ShallowWrapper {
        const mockAfm: AFM.IAfm = getAfm(geoOptions);
        const defaultProps: Partial<IGeoChartInnerProps> = {
            config: {
                mapboxToken: "",
                ...customConfig,
            },
            dataSource: {
                getData: () => Promise.resolve(null),
                getPage: () => Promise.resolve(null),
                getAfm: () => mockAfm,
                getFingerprint: () => JSON.stringify(null),
            },
            execution,
            geoChartOptions: buildGeoChartOptions(),
            height: 600,
        };
        return shallow(<GeoChartInner {...defaultProps} {...customProps} />);
    }

    it("should render GeoChartInner", async () => {
        const wrapper = renderComponent();
        expect(wrapper.find(".s-gd-geo-component").length).toBe(1);
        expect(wrapper.hasClass("flex-direction-column")).toBe(true);
    });

    it("should render GeoChartInner has flex-direction-row class", async () => {
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                legend: {
                    position: "right",
                },
                mapboxToken: "",
            },
        };
        const wrapper = renderComponent(props);
        expect(wrapper.hasClass("flex-direction-row")).toBe(true);
    });

    it("should render GeoChartInner has flex-direction-column class", async () => {
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                legend: {
                    position: "bottom",
                },
                mapboxToken: "",
            },
        };
        const wrapper = renderComponent(props);
        expect(wrapper.hasClass("flex-direction-column")).toBe(true);
    });

    it("should use custom Chart renderer", () => {
        const chartRenderer = jest.fn().mockReturnValue(<div />);
        renderComponent({ chartRenderer });
        expect(chartRenderer).toHaveBeenCalledTimes(1);
    });

    it("should use custom Legend renderer", () => {
        const legendRenderer = jest.fn().mockReturnValue(<div />);
        renderComponent({ legendRenderer });
        expect(legendRenderer).toHaveBeenCalledTimes(1);
        expect(legendRenderer).toHaveBeenCalledWith({
            categoryItems: [
                {
                    color: "rgb(20,178,226)",
                    isVisible: true,
                    legendIndex: 0,
                    name: "General Goods",
                    uri: "/gdc/md/projectId/obj/1",
                },
                {
                    color: "rgb(0,193,141)",
                    isVisible: true,
                    legendIndex: 1,
                    name: "Toy Store",
                    uri: "/gdc/md/projectId/obj/2",
                },
                {
                    color: "rgb(229,77,66)",
                    isVisible: true,
                    legendIndex: 2,
                    name: "Speciality",
                    uri: "/gdc/md/projectId/obj/3",
                },
                {
                    color: "rgb(241,134,0)",
                    isVisible: true,
                    legendIndex: 3,
                    name: "Convenience",
                    uri: "/gdc/md/projectId/obj/4",
                },
            ],
            colorLegendValue: "rgb(20,178,226)",
            format: "#,##0",
            geoData: {
                color: {
                    data: [NaN, 6832, 3294, 8340, 957],
                    format: "#,##0",
                    index: 1,
                    name: "Area",
                },
                location: {
                    data: [
                        { lat: 44.5, lng: -89.5 },
                        { lat: 39, lng: -80.5 },
                        {
                            lat: 44,
                            lng: -72.699997,
                        },
                        { lat: 31, lng: -100 },
                        { lat: 44.5, lng: -100 },
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
                    ],
                    index: 1,
                    name: "Type",
                    uris: [
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                        "/gdc/md/storybook/obj/23/elements?id=1",
                    ],
                },
                size: { data: [1005, 943, NaN, 4726, 1719], format: "#,##0", index: 0, name: "Population" },
            },
            height: 600,
            locale: "en-US",
            onItemClick: expect.any(Function),
            position: "top",
            responsive: false,
            showFluidLegend: true,
        });
    });

    it("should return enabledLegendItems with length equal categories length", () => {
        const wrapper = renderComponent();
        expect(wrapper.state("enabledLegendItems")).toEqual([true, true, true, true]);
    });

    it("should call pushData", () => {
        const pushData = jest.fn();
        const props: Partial<IGeoChartInnerProps> = {
            pushData,
        };
        renderComponent(props);
        expect(pushData).toBeCalledTimes(1);
    });

    describe("GeoChart Legend", () => {
        const defaultDocumentObj: any = {
            documentElement: {
                clientWidth: FLUID_LEGEND_THRESHOLD,
            },
        };

        interface ICustomComponentProps {
            documentObj?: any;
            height?: number;
            position?: PositionType;
            responsive?: boolean;
        }

        const getCustomComponentProps = (props: ICustomComponentProps): Partial<IGeoChartInnerProps> => {
            const { height = 600, position, responsive = false, documentObj = defaultDocumentObj } = props;
            return {
                documentObj,
                config: {
                    legend: {
                        enabled: true,
                        position,
                        responsive,
                    },
                    mapboxToken: "",
                },
                height,
            };
        };

        it("should not render if legend is disabled", () => {
            const legendRenderer = jest.fn().mockReturnValue(<div />);
            renderComponent({ legendRenderer }, { legend: { enabled: false } });
            expect(legendRenderer).toHaveBeenCalledTimes(0);
        });

        it("should set flex-direction-column class for legend position TOP", () => {
            const customProps = getCustomComponentProps({ position: TOP });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("flex-direction-column")).toBe(true);
        });

        it("should set flex-direction-column class for legend position BOTTOM", () => {
            const customProps = getCustomComponentProps({ position: BOTTOM });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("flex-direction-column")).toBe(true);
        });

        it("should set flex-direction-row class for legend position LEFT", () => {
            const customProps = getCustomComponentProps({ position: LEFT });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("flex-direction-row")).toBe(true);
        });

        it("should set flex-direction-row class for legend position RIGHT", () => {
            const customProps = getCustomComponentProps({ position: RIGHT });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("flex-direction-row")).toBe(true);
        });

        it("should set responsive-legend class for responsive legend", () => {
            const customProps = getCustomComponentProps({ responsive: true });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("responsive-legend")).toBe(true);
        });

        it("should set non-responsive-legend class for non responsive legend", () => {
            const customProps = getCustomComponentProps({ responsive: false });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("non-responsive-legend")).toBe(true);
        });

        it("should render responsive legend for mobile", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD - 10,
                },
            };
            const customProps = getCustomComponentProps({ responsive: true, documentObj });

            const wrapper = renderComponent(customProps);
            expect(wrapper.state("showFluidLegend")).toBeTruthy();
        });

        it("should render StaticLegend on desktop", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD + 10,
                },
            };
            const customProps = getCustomComponentProps({ responsive: true, documentObj });

            const wrapper = renderComponent(customProps);
            expect(wrapper.state("showFluidLegend")).toBeFalsy();
        });
    });
});
