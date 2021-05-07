// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { IPopUpLegendProps, PopUpLegend } from "../PopUpLegend/PopUpLegend";
import { withIntl } from "@gooddata/sdk-ui";
import LegendItem from "../LegendItem";
import { IPushpinCategoryLegendItem } from "../types";

describe("PopUpLegend", () => {
    function render(customProps: Partial<IPopUpLegendProps> = {}) {
        const props: IPopUpLegendProps = {
            enableBorderRadius: false,
            series: [],
            name: "properties.legend.title",
            maxRows: 1,
            onLegendItemClick: noop,
            containerId: "",
            ...customProps,
        };
        const Wrapped = withIntl(PopUpLegend);

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

        const popUpLegend = render({ series });
        expect(popUpLegend.find(LegendItem)).toHaveLength(3);
    });
});
