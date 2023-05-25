// (C) 2020-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { GeoChartInner, IGeoChartInnerProps, IGeoChartInnerOptions } from "../GeoChartInner.js";
import { RecShortcuts } from "../../../../__mocks__/recordings.js";
import { LegendPosition, FLUID_LEGEND_THRESHOLD, PositionType } from "@gooddata/sdk-ui-vis-commons";
import { IGeoConfig } from "../../../GeoChart.js";
import { createIntlMock, DefaultColorPalette } from "@gooddata/sdk-ui";
import { getColorStrategy } from "../colorStrategy/geoChart.js";
import { createCategoryLegendItems } from "../GeoChartOptionsWrapper.js";
import { describe, it, expect, vi } from "vitest";

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

const intl = createIntlMock();

const componentSelector = ".s-gd-geo-component";

describe("GeoChartInner", () => {
    function renderComponent(
        customProps: Partial<IGeoChartInnerProps> = {},
        customConfig: Partial<IGeoConfig> = {},
    ) {
        const defaultProps: Partial<IGeoChartInnerProps> = {
            config: {
                mapboxToken: "",
                ...customConfig,
            },
            dataView: dv.dataView,
            geoChartOptions: buildGeoChartOptions(),
            height: 600,
            intl,
        };
        return render(<GeoChartInner {...(defaultProps as any)} {...customProps} />);
    }

    it("should render GeoChartInner", () => {
        renderComponent();
        const wrapper = document.querySelector(componentSelector);
        expect(wrapper).toBeInTheDocument();
        expect(wrapper).toHaveClass("flex-direction-column");
    });

    it("should render GeoChartInner has flex-direction-row class", () => {
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                legend: {
                    position: "right",
                },
                mapboxToken: "",
            },
        };
        renderComponent(props);
        expect(document.querySelector(componentSelector)).toHaveClass("flex-direction-row");
    });

    it("should render GeoChartInner has flex-direction-column class", () => {
        const props: Partial<IGeoChartInnerProps> = {
            config: {
                legend: {
                    position: "bottom",
                },
                mapboxToken: "",
            },
        };
        renderComponent(props);
        expect(document.querySelector(componentSelector)).toHaveClass("flex-direction-column");
    });

    it("should use custom Chart renderer", () => {
        const chartRenderer = vi.fn().mockReturnValue(<div />);
        renderComponent({ chartRenderer });
        expect(chartRenderer).toHaveBeenCalledTimes(1);
    });

    it("should use custom Legend renderer", () => {
        const legendRenderer = vi.fn().mockReturnValue(<div />);
        renderComponent({ legendRenderer });

        expect(legendRenderer).toHaveBeenCalledTimes(1);

        const legendProps = legendRenderer.mock.calls[0][0];
        expect(legendProps).toMatchSnapshot({
            containerId: expect.any(String),
        });
    });

    it("should call pushData", () => {
        const pushData = vi.fn();
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
            const legendRenderer = vi.fn().mockReturnValue(<div />);
            renderComponent({ legendRenderer }, { legend: { enabled: false } });
            expect(legendRenderer).toHaveBeenCalledTimes(0);
        });

        it("should set flex-direction-column class for legend position TOP", () => {
            const customProps = getCustomComponentProps({ position: LegendPosition.TOP });
            renderComponent(customProps);
            expect(document.querySelector(componentSelector)).toHaveClass("flex-direction-column");
        });

        it("should set flex-direction-column class for legend position BOTTOM", () => {
            const customProps = getCustomComponentProps({ position: LegendPosition.BOTTOM });
            renderComponent(customProps);
            expect(document.querySelector(componentSelector)).toHaveClass("flex-direction-column");
        });

        it("should set flex-direction-row class for legend position LEFT", () => {
            const customProps = getCustomComponentProps({ position: LegendPosition.LEFT });
            renderComponent(customProps);
            expect(document.querySelector(componentSelector)).toHaveClass("flex-direction-row");
        });

        it("should set flex-direction-row class for legend position RIGHT", () => {
            const customProps = getCustomComponentProps({ position: LegendPosition.RIGHT });
            renderComponent(customProps);
            expect(document.querySelector(componentSelector)).toHaveClass("flex-direction-row");
        });

        it("should set responsive-legend class for responsive legend", () => {
            const customProps = getCustomComponentProps({ responsive: true });
            renderComponent(customProps);
            expect(document.querySelector(componentSelector)).toHaveClass("responsive-legend");
        });

        it("should set non-responsive-legend class for non responsive legend", () => {
            const customProps = getCustomComponentProps({ responsive: false });
            renderComponent(customProps);
            expect(document.querySelector(componentSelector)).toHaveClass("non-responsive-legend");
        });

        it("should render responsive legend for mobile", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD - 10,
                },
            };
            const customProps = getCustomComponentProps({ responsive: true, documentObj });

            renderComponent(customProps);
            expect(document.querySelector(".viz-fluid-legend-wrap")).toBeInTheDocument();
        });

        it("should render StaticLegend on desktop", () => {
            const documentObj = {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD + 10,
                },
            };
            const customProps = getCustomComponentProps({ responsive: true, documentObj });

            renderComponent(customProps);
            expect(document.querySelector(".viz-static-legend-wrap")).toBeInTheDocument();
        });

        it("should not set responsive-legend if responsive is autoPositionWithPopup", () => {
            const customProps = getCustomComponentProps({ responsive: "autoPositionWithPopup" });
            renderComponent(customProps);
            expect(document.querySelector(componentSelector)).not.toHaveClass("responsive-legend");
        });
    });
});
