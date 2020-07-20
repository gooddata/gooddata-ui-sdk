// (C) 2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import GeoChartLegendRenderer, { IGeoChartLegendRendererProps } from "../GeoChartLegendRenderer";

import PushpinCategoryLegend from "../legends/PushpinCategoryLegend";
import PushpinSizeLegend from "../legends/PushpinSizeLegend";
import { LegendPosition, Paging, PositionType } from "@gooddata/sdk-ui-vis-commons";
import {
    DefaultLocale,
    withIntl,
    IntlWrapper,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
} from "@gooddata/sdk-ui";
import { IGeoData } from "../../../GeoChart";
import { DEFAULT_COLORS } from "../constants/geoChart";
import { RecShortcuts } from "../../../../__mocks__/recordings";

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
    return mount(
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
    };
}

describe("GeoChartLegendRenderer", () => {
    it("should render nothing", () => {
        const wrapper = createComponent(getLegendProps({}));
        expect(wrapper.find(".s-geo-legend")).toHaveLength(0);
    });

    it("should render only Size legend", async () => {
        const wrapper = createComponent(getLegendProps({ hasSizeLegend: true }));
        expect(await wrapper.find(".s-geo-legend")).toHaveLength(1);
        expect(await wrapper.find(".s-pushpin-size-legend")).toHaveLength(1);
        expect(await wrapper.find(".color-legend")).toHaveLength(0);
        expect(wrapper.find(".s-geo-category-legend")).toHaveLength(0);
    });

    it("should render only Color legend", async () => {
        const wrapper = createComponent(getLegendProps({ hasColorLegend: true }));
        expect(await wrapper.find(".s-geo-legend")).toHaveLength(1);
        expect(await wrapper.find(".color-legend")).toHaveLength(1);
        expect(await wrapper.find(".s-pushpin-size-legend")).toHaveLength(0);
        expect(wrapper.find(".s-geo-category-legend")).toHaveLength(0);
    });

    it("should render Size and Color legend", async () => {
        const wrapper = createComponent(getLegendProps({ hasColorLegend: true, hasSizeLegend: true }));
        expect(await wrapper.find(".s-geo-legend")).toHaveLength(1);
        expect(await wrapper.find(".color-legend")).toHaveLength(1);
        expect(await wrapper.find(".s-pushpin-size-legend")).toHaveLength(1);
    });

    it("should render Paging for Size and Color legend", async () => {
        const wrapper = createComponent(
            getLegendProps({
                hasColorLegend: true,
                hasSizeLegend: true,
                height: 300,
                position: LegendPosition.LEFT,
            }),
        );
        expect(await wrapper.find(Paging)).toHaveLength(1);
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
        };
        const wrapper = createComponent(props);
        const sizeLegend = wrapper.find(PushpinSizeLegend);
        const categoryLegend = wrapper.find(PushpinCategoryLegend);
        expect(wrapper.find(".s-geo-legend")).toHaveLength(1);
        expect(wrapper.find(".s-geo-category-legend")).toHaveLength(1);
        expect(sizeLegend.length).toEqual(1);
        expect(categoryLegend.length).toEqual(1);
    });

    it.each([
        ["viz-static-legend-wrap", "static", false],
        ["viz-fluid-legend-wrap", "fluid", true],
    ])(
        "should set %s class for %s legend",
        async (classname: string, _responsiveText: string, responsive: boolean) => {
            const props: IGeoChartLegendRendererProps = getLegendProps({
                hasColorLegend: true,
                hasSizeLegend: true,
            });
            const wrapper = createComponent({
                ...props,
                responsive,
                showFluidLegend: true,
            });
            expect(await wrapper.find(`.${classname}`)).toHaveLength(1);
        },
    );
});
