// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
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
        return render(
            <InternalIntlWrapper>
                <CheckboxControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render checkbox control", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should be unchecked by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should be enabled by default", () => {
        createComponent();
        expect(screen.getByRole("checkbox")).toBeEnabled();
    });

    it("should render checked checkbox", () => {
        createComponent({ checked: true });
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should render disabled checkbox", () => {
        createComponent({ disabled: true });
        expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should call pushData when checkbox value changes", async () => {
        const pushData = jest.fn();
        createComponent({
            properties: {},
            pushData,
        });

        await userEvent.click(screen.getByRole("checkbox"));
        expect(pushData).toHaveBeenCalledTimes(1);
    });
});
