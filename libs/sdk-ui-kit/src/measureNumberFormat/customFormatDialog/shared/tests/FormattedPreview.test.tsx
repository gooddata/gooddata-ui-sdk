// (C) 2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { FormattedPreview, IFormattedPreviewProps, Label } from "../FormattedPreview";

describe("FormattedPreview", () => {
    function renderComponent(props: Partial<IFormattedPreviewProps> = {}) {
        const defaultProps: IFormattedPreviewProps = {
            previewNumber: 1234.56,
            format: "#.##",
            separators: {
                decimal: ",",
                thousand: " ",
            },
        };

        return shallow(<FormattedPreview {...defaultProps} {...props} />);
    }

    it("should render span with given classname", () => {
        const wrapper = renderComponent({ className: "testClass" });
        expect(wrapper.hasClass("testClass")).toEqual(true);
    });

    it("should render empty span when no format is provided", () => {
        const wrapper = renderComponent({ format: "" });
        expect(wrapper.find(Label).render().text()).toEqual("");
    });

    it("should render formatted number with colors when coloring is enabled", () => {
        const wrapper = renderComponent({ format: "[>1][green]#,##" });
        expect(wrapper.find(Label).props().style).toMatchObject({ color: "#00AA00" });
    });

    it("should render formatted number without colors when coloring is disabled", () => {
        const wrapper = renderComponent({ format: "[>1][GREEN]#,##", colors: false });
        expect(wrapper.find(Label).props().style).toEqual(undefined);
    });

    it("should format null value properly if no value is provided", () => {
        const wrapper = renderComponent({
            previewNumber: null,
            format: "[=NULL]value is null",
            colors: false,
        });
        expect(wrapper.find(Label).render().text()).toEqual("value is null");
    });
});
