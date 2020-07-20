// (C) 2019 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { ExcludeCurrentPeriodToggle } from "../ExcludeCurrentPeriodToggle";

describe("ExcludeCurrentPeriodToggle", () => {
    const renderWithDisabledValue = (disabled: boolean | undefined) => {
        const disabledProp = disabled === undefined ? null : { disabled };
        const props = {
            ...disabledProp,
            onChange: jest.fn(),
            value: true,
        };
        return shallow(<ExcludeCurrentPeriodToggle {...props} />);
    };

    it('should be disabled when passed true as the value of the "disabled" prop', () => {
        const rendered = renderWithDisabledValue(true);
        expect(rendered.find("input")).toBeDisabled();
    });

    it('should not be disabled when passed false as the value of the "disabled" prop', () => {
        const rendered = renderWithDisabledValue(false);
        expect(rendered.find("input")).not.toBeDisabled();
    });

    it('should not be disabled when not passed any value of the "disabled" prop', () => {
        const rendered = renderWithDisabledValue(undefined);
        expect(rendered.find("input")).not.toBeDisabled();
    });

    it("should render a tooltip if disabled", () => {
        const rendered = renderWithDisabledValue(true);
        expect(rendered).toContainMatchingElement("Bubble");
    });

    it("should not render a tooltip if enabled", () => {
        const rendered = renderWithDisabledValue(false);
        expect(rendered).not.toContainMatchingElement("Bubble");
    });
});
