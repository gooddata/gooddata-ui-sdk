// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import { IStaticLegendProps, StaticLegend } from "../StaticLegend";
import { withIntl } from "@gooddata/sdk-ui";
import { LegendItem } from "../LegendItem";
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
