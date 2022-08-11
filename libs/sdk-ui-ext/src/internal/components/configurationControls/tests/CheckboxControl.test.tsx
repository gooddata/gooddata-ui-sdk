// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { setupComponent } from "../../../tests/testHelper";
import CheckboxControl, { ICheckboxControlProps } from "../CheckboxControl";

describe("CheckboxControl", () => {
    const defaultProps = {
        valuePath: "path",
        labelText: "properties.canvas.gridline",
        properties: {},
        propertiesMeta: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<ICheckboxControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return setupComponent(
            <InternalIntlWrapper>
                <CheckboxControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render checkbox control", () => {
        const { getByRole } = createComponent();
        expect(getByRole("checkbox")).toBeInTheDocument();
    });

    it("should be unchecked by default", () => {
        const { getByRole } = createComponent();
        expect(getByRole("checkbox")).not.toBeChecked();
    });

    it("should be enabled by default", () => {
        const { getByRole } = createComponent();
        expect(getByRole("checkbox")).toBeEnabled();
    });

    it("should render checked checkbox", () => {
        const { getByRole } = createComponent({ checked: true });
        expect(getByRole("checkbox")).toBeChecked();
    });

    it("should render disabled checkbox", () => {
        const { getByRole } = createComponent({ disabled: true });
        expect(getByRole("checkbox")).toBeDisabled();
    });

    it("should call pushData when checkbox value changes", async () => {
        const pushData = jest.fn();
        const { getByRole, user } = createComponent({
            properties: {},
            pushData,
        });

        await user.click(getByRole("checkbox"));
        expect(pushData).toHaveBeenCalledTimes(1);
    });
});
