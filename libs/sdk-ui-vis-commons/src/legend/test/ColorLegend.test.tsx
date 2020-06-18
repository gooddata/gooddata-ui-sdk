// (C) 2020 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { ColorLegend, IColorLegendProps, ColorBoxes, ColorLabels } from "../ColorLegend";
import range = require("lodash/range");

describe("ColorLegend", () => {
    function renderLegend(props: IColorLegendProps): ReactWrapper {
        return mount(<ColorLegend {...props} />);
    }

    it("should not render color legend with empty data", () => {
        const wrapper = renderLegend({ data: [], numericSymbols: ["k", "M", "G"], position: "top" });

        expect(wrapper.find(ColorBoxes).length).toEqual(0);
        expect(wrapper.find(ColorLabels).length).toEqual(0);
    });

    it("should render color legend", () => {
        const data = range(0, 6).map((itemId) => ({
            color: "color" + itemId,
            range: {
                from: itemId,
                to: itemId + 1,
            },
        }));
        const numericSymbols = ["k", "M", "G"];
        const wrapper = renderLegend({ data, numericSymbols, position: "top" });

        expect(wrapper.find(ColorLegend).length).toEqual(1);
        expect(wrapper.find(ColorBoxes).length).toEqual(1);
        expect(wrapper.find(ColorLabels).length).toEqual(1);
        expect(wrapper.find(".labels span").length).toEqual(11); // 7 label text; 4 space
        expect(wrapper.find(".boxes span").length).toEqual(6);
    });
});
