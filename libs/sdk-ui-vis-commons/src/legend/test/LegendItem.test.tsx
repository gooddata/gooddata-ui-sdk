// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { LegendItem } from "../LegendItem";

describe("LegendItem", () => {
    const item = {
        name: "Foo",
        color: "red",
        isVisible: true,
    };

    function createComponent(props: any = {}) {
        return mount(<LegendItem {...props} />);
    }

    it("should render item", () => {
        const props = {
            item,
            chartType: "bar",
            onItemClick: jest.fn(),
        };
        const wrapper = createComponent(props);
        expect(wrapper.find(".series-item").text()).toEqual("Foo");

        wrapper.find(".series-item").simulate("click");
        expect(props.onItemClick).toHaveBeenCalled();
    });

    it.each([
        ["enable", true, "50%"],
        ["enable", false, "0"],
    ])(
        "should %s border radius for %s chart with itemType=%s",
        (_des: string, enableBorderRadius: boolean, expected: string) => {
            const props = {
                item: {
                    ...item,
                },
                enableBorderRadius,
            };
            const component = createComponent(props);
            const seriesIconStyle = component.find(".series-icon").get(0).props.style;

            expect(seriesIconStyle).toEqual({ backgroundColor: "red", borderRadius: expected });
        },
    );
});
