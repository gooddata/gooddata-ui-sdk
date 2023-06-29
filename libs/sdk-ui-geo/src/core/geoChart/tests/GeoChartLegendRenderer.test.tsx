// (C) 2020-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import GeoChartLegendRenderer, { IGeoChartLegendRendererProps } from "../GeoChartLegendRenderer.js";
import { LegendPosition, PositionType } from "@gooddata/sdk-ui-vis-commons";
import {
    DefaultLocale,
    withIntl,
    IntlWrapper,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
} from "@gooddata/sdk-ui";
import { IGeoData } from "../../../GeoChart.js";
import { DEFAULT_COLORS } from "../constants/geoChart.js";
import { RecShortcuts } from "../../../../__mocks__/recordings.js";
import { describe, it, expect } from "vitest";

interface ILegendFlags {
    hasSizeLegend?: boolean;
    hasColorLegend?: boolean;
    height?: number;
    position?: PositionType;
}

function createComponent(customProps: IGeoChartLegendRendererProps, customStyles: React.CSSProperties = {}) {
    const legendProps = {
        ...customProps,
    };
    const Wrapped = withIntl((props: IGeoChartLegendRendererProps) => (
        <IntlWrapper locale={DefaultLocale}>
            <IntlTranslationsProvider>
                {(transplationProps: ITranslationsComponentProps) => (
                    <GeoChartLegendRenderer {...props} numericSymbols={transplationProps.numericSymbols} />
                )}
            </IntlTranslationsProvider>
        </IntlWrapper>
    ));
    return render(
        <div {...(customStyles as any)}>
            <Wrapped {...legendProps} />
        </div>,
    );
}

function getLegendProps(legendFlags: ILegendFlags): IGeoChartLegendRendererProps {
    const { hasSizeLegend = false, hasColorLegend = false, height, position } = legendFlags;
    const geoData: IGeoData = {
        size: hasSizeLegend
            ? {
                  index: 0,
                  name: "size",
                  data: [1, 2, 3],
                  format: "#,##0",
              }
            : undefined,
        color: hasColorLegend
            ? {
                  index: hasSizeLegend ? 1 : 0,
                  name: "color",
                  data: [1, 2, 3],
                  format: "#,##0",
              }
            : undefined,
        location: {
            index: 0,
            name: "location",
            data: [
                { lat: 1, lng: 1 },
                { lat: 2, lng: 2 },
                { lat: 3, lng: 3 },
            ],
        },
    };
    return {
        geoData,
        colorLegendValue: DEFAULT_COLORS[0],
        height,
        position,
        containerId: "id",
    };
}

const legendSelector = ".s-geo-legend";
const sizeLegendSelector = ".s-pushpin-size-legend";
const colorLegendSelector = ".color-legend";
const categoryLegendSelector = ".s-geo-category-legend";

describe("GeoChartLegendRenderer", () => {
    it("should render nothing", () => {
        createComponent(getLegendProps({}));
        expect(document.querySelector(legendSelector)).not.toBeInTheDocument();
    });

    it("should render only Size legend", () => {
        createComponent(getLegendProps({ hasSizeLegend: true }));
        expect(document.querySelector(legendSelector)).toBeInTheDocument();
        expect(document.querySelector(sizeLegendSelector)).toBeInTheDocument();
        expect(document.querySelector(colorLegendSelector)).not.toBeInTheDocument();
        expect(document.querySelector(categoryLegendSelector)).not.toBeInTheDocument();
    });

    it("should render only Color legend", () => {
        createComponent(getLegendProps({ hasColorLegend: true }));
        expect(document.querySelector(legendSelector)).toBeInTheDocument();
        expect(document.querySelector(sizeLegendSelector)).not.toBeInTheDocument();
        expect(document.querySelector(colorLegendSelector)).toBeInTheDocument();
        expect(document.querySelector(categoryLegendSelector)).not.toBeInTheDocument();
    });

    it("should render Size and Color legend", () => {
        createComponent(getLegendProps({ hasColorLegend: true, hasSizeLegend: true }));
        expect(document.querySelector(legendSelector)).toBeInTheDocument();
        expect(document.querySelector(colorLegendSelector)).toBeInTheDocument();
        expect(document.querySelector(sizeLegendSelector)).toBeInTheDocument();
    });

    it("should render Paging for Size and Color legend", () => {
        createComponent(
            getLegendProps({
                hasColorLegend: true,
                hasSizeLegend: true,
                height: 300,
                position: LegendPosition.LEFT,
            }),
        );
        expect(document.querySelector(".geo-legend-paging")).toBeInTheDocument();
    });

    it("should render Size and Category legend ", () => {
        const { geoData } = RecShortcuts.LocationSegmentAndSize;
        const props: IGeoChartLegendRendererProps = {
            geoData,
            colorLegendValue: DEFAULT_COLORS[0],
            categoryItems: [
                {
                    name: "a",
                    uri: "/gdc/md/projectId/obj/1",
                    color: "",
                    legendIndex: 0,
                    isVisible: true,
                },
            ],
            position: LegendPosition.TOP,
            containerId: "id",
        };
        createComponent(props);
        expect(document.querySelector(sizeLegendSelector)).toBeInTheDocument();
        expect(document.querySelector(categoryLegendSelector)).toBeInTheDocument();
    });

    it.each([
        ["viz-static-legend-wrap", "static", false],
        ["viz-fluid-legend-wrap", "fluid", true],
    ])(
        "should set %s class for %s legend",
        (classname: string, _responsiveText: string, responsive: boolean) => {
            const props: IGeoChartLegendRendererProps = getLegendProps({
                hasColorLegend: true,
                hasSizeLegend: true,
            });
            createComponent({
                ...props,
                responsive,
                isFluidLegend: responsive,
                containerId: "id",
            });
            expect(document.querySelector(`.${classname}`)).toBeInTheDocument();
        },
    );
});
