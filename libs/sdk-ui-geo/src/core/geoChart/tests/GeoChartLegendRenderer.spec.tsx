// (C) 2020 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { withIntl } from "../../../visualizations/utils/intlUtils";
import GeoChartLegendRenderer, { IGeoChartLegendRendererProps } from "../GeoChartLegendRenderer";
import { IGeoData } from "../../../../interfaces/GeoChart";

import PushpinCategoryLegend from "../legends/PushpinCategoryLegend";
import PushpinSizeLegend from "../legends/PushpinSizeLegend";
import Paging from "../../../visualizations/chart/legend/Paging";
import { TOP, LEFT } from "../../../visualizations/chart/legend/PositionTypes";
import { PositionType } from "../../../visualizations/typings/legend";
import { getGeoData } from "../../../../helpers/geoChart/data";
import {
    LOCATION_LNGLATS,
    SIZE_NUMBERS,
    COLOR_NUMBERS,
    getExecutionResponse,
    getGeoConfig,
    getExecutionResult,
} from "../../../../../stories/data/geoChart";
import { DEFAULT_COLORS } from "../../../visualizations/utils/color";
import { IntlWrapper } from "../../base/IntlWrapper";
import { IntlTranslationsProvider, ITranslationsComponentProps } from "../../base/TranslationsProvider";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

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
        <IntlWrapper locale={DEFAULT_LOCALE}>
            <IntlTranslationsProvider>
                {(transplationProps: ITranslationsComponentProps) => (
                    <GeoChartLegendRenderer {...props} numericSymbols={transplationProps.numericSymbols} />
                )}
            </IntlTranslationsProvider>
        </IntlWrapper>
    ));
    return mount(
        <div {...customStyles}>
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
                  data: SIZE_NUMBERS,
                  format: "#,##0",
              }
            : undefined,
        color: hasColorLegend
            ? {
                  index: hasSizeLegend ? 1 : 0,
                  name: "color",
                  data: COLOR_NUMBERS,
                  format: "#,##0",
              }
            : undefined,
        location: {
            index: 0,
            name: "location",
            data: LOCATION_LNGLATS,
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
            getLegendProps({ hasColorLegend: true, hasSizeLegend: true, height: 300, position: LEFT }),
        );
        expect(await wrapper.find(Paging)).toHaveLength(1);
    });

    it("should render Size and Category legend ", () => {
        const execution = {
            executionResponse: getExecutionResponse(true, true, false, true),
            executionResult: getExecutionResult(true, true, false, true),
        };
        const config = getGeoConfig({ isWithLocation: true, isWithSize: true, isWithSegment: true });
        const { mdObject: { buckets = [] } = {} } = config;
        const geoData = getGeoData(buckets, execution);

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
            position: TOP,
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
