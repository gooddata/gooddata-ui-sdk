// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { getPagingValues, IStaticLegendProps, StaticLegend } from "../StaticLegend";
import { withIntl } from "@gooddata/sdk-ui";
import LegendItem from "../LegendItem";
import { IPushpinCategoryLegendItem } from "../types";

describe("StaticLegend", () => {
    function render(customProps: Partial<IStaticLegendProps> = {}) {
        const props: IStaticLegendProps = {
            enableBorderRadius: false,
            series: [],
            onItemClick: noop,
            position: "top",
            containerHeight: 500,
            ...customProps,
        };
        const Wrapped = withIntl(StaticLegend);

        return mount(<Wrapped {...props} />);
    }

    it("should render items", () => {
        const series: IPushpinCategoryLegendItem[] = [
            {
                name: "A",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
            {
                name: "B",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
            {
                name: "A",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
        ];

        const topLegend = render({ series, position: "top" });
        expect(topLegend.find(LegendItem)).toHaveLength(3);

        const rightLegend = render({ series, position: "right" });
        expect(rightLegend.find(LegendItem)).toHaveLength(3);
    });
});

describe("getPagingValues", () => {
    const visibleItemsCount = 22;
    const seriesLength = 102;

    it("should return correct start and end values on the first page if custom component is not present", () => {
        const page = 1;
        const hasCustomComponent = false;
        expect(getPagingValues(page, visibleItemsCount, seriesLength, hasCustomComponent)).toEqual([0, 22]);
    });

    it("should return correct start and end values on the second page if custom component is present", () => {
        const page = 2;
        const hasCustomComponent = true;
        expect(getPagingValues(page, visibleItemsCount, seriesLength, hasCustomComponent)).toEqual([0, 22]);
    });

    it("should return correct start and end values on the last page if custom component is not present", () => {
        const page = 5;
        const hasCustomComponent = false;
        expect(getPagingValues(page, visibleItemsCount, seriesLength, hasCustomComponent)).toEqual([88, 102]);
    });

    it("should return correct start and end values on the last page if custom component is present", () => {
        const page = 6;
        const hasCustomComponent = true;
        expect(getPagingValues(page, visibleItemsCount, seriesLength, hasCustomComponent)).toEqual([88, 102]);
    });
});
