// (C) 2007-2018 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { FormattedNumber } from "../FormattedNumber";

describe("FormattedNumber", () => {
    it("should format number with default format", () => {
        const wrapper = shallow(<FormattedNumber value="10.2402" />);
        expect(wrapper.find("span").text()).toBe("10.24");
    });

    it("should format number with provided format and separators", () => {
        const wrapper = shallow(
            <FormattedNumber
                value="10000.2402"
                format="#,#.#"
                separators={{ thousand: ",", decimal: "@" }}
            />,
        );
        expect(wrapper.find("span").text()).toBe("10,000@2");
    });

    it("should be colored when formatting contains colors", () => {
        const wrapper = shallow(<FormattedNumber value="10" format="[color=99AE00]" />);
        expect(wrapper.find("span").text()).toBe("10");
        expect(wrapper.find("span").prop("style")!.color).toBe("#99AE00");
    });
});
