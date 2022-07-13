// (C) 2020-2022 GoodData Corporation
import React from "react";
import { ShallowWrapper, shallow } from "enzyme";
import { GeoChartInner, IGeoChartInnerProps, IGeoChartInnerOptions } from "../GeoChartInner";
import { RecShortcuts } from "../../../../__mocks__/recordings";
import { LegendPosition, FLUID_LEGEND_THRESHOLD, PositionType } from "@gooddata/sdk-ui-vis-commons";
import { IGeoConfig } from "../../../GeoChart";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { getColorStrategy } from "../colorStrategy/geoChart";
import { createCategoryLegendItems } from "../GeoChartOptionsWrapper";

const { dv, geoData } = RecShortcuts.AllAndSmall;

function buildGeoChartOptions(): IGeoChartInnerOptions {
    const colorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);
    const categoryItems = createCategoryLegendItems(colorStrategy, "(empty)", "(null)");

    return {
        geoData,
        categoryItems,
        colorStrategy,
        colorPalette: DefaultColorPalette,
    };
}

describe("GeoChartInner", () => {
    function renderComponent(
        customProps: Partial<IGeoChartInnerProps> = {},
        customConfig: Partial<IGeoConfig> = {},
    ): ShallowWrapper {
        const defaultProps: Partial<IGeoChartInnerProps> = {
            config: {
                mapboxToken: "",
                ...customConfig,
            },
            dataView: dv.dataView,
            geoChartOptions: buildGeoChartOptions(),
            height: 600,
        };
        return shallow(<GeoChartInner {...(defaultProps as any)} {...customProps} />);
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

        const legendProps = legendRenderer.mock.calls[0][0];
        expect(legendProps).toMatchSnapshot({
            containerId: expect.any(String),
        });
    });

    it("should return enabledLegendItems with length equal categories length", () => {
        const wrapper = renderComponent();
        expect(wrapper.state("enabledLegendItems")).toEqual([true, true, true]);
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
            responsive?: boolean | "autoPositionWithPopup";
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
            const customProps = getCustomComponentProps({ position: LegendPosition.TOP });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("flex-direction-column")).toBe(true);
        });

        it("should set flex-direction-column class for legend position BOTTOM", () => {
            const customProps = getCustomComponentProps({ position: LegendPosition.BOTTOM });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("flex-direction-column")).toBe(true);
        });

        it("should set flex-direction-row class for legend position LEFT", () => {
            const customProps = getCustomComponentProps({ position: LegendPosition.LEFT });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("flex-direction-row")).toBe(true);
        });

        it("should set flex-direction-row class for legend position RIGHT", () => {
            const customProps = getCustomComponentProps({ position: LegendPosition.RIGHT });
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

        it("should not set responsive-legend if responsive is autoPositionWithPopup", () => {
            const customProps = getCustomComponentProps({ responsive: "autoPositionWithPopup" });
            const wrapper = renderComponent(customProps);
            expect(wrapper.hasClass("responsive-legend")).toBe(false);
        });
    });
});
