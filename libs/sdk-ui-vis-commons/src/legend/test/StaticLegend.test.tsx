// (C) 2007-2025 GoodData Corporation

import React from "react";

import { render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { IStaticLegendProps, StaticLegend, getPagingValues } from "../StaticLegend.js";
import { IPushpinCategoryLegendItem } from "../types.js";

describe("StaticLegend", () => {
    function renderComponent(customProps: Partial<IStaticLegendProps> = {}) {
        const props: IStaticLegendProps = {
            enableBorderRadius: false,
            series: [],
            onItemClick: noop,
            position: "top",
            containerHeight: 500,
            ...customProps,
        };
        const Wrapped = withIntl(StaticLegend);

        return render(<Wrapped {...props} />);
    }

    it("should render items", () => {
        const series: IPushpinCategoryLegendItem[] = [
            {
                type: "line",
                name: "A",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
            {
                type: "line",
                name: "B",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
            {
                type: "line",
                name: "A",
                color: "#333",
                isVisible: true,
                uri: "/url",
                legendIndex: 0,
            },
        ];

        renderComponent({ series, position: "top" });
        expect(screen.getAllByTestId("legend-item")).toHaveLength(3);

        renderComponent({ series, position: "right" });
        expect(screen.getAllByTestId("legend-item")).toHaveLength(6);
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
