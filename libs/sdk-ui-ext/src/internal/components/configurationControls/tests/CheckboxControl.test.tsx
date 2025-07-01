// (C) 2019-2025 GoodData Corporation
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";
import CheckboxControl, { ICheckboxControlProps } from "../CheckboxControl.js";
import { describe, it, expect, vi } from "vitest";

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

    it("should display tooltip message when configured", async () => {
        createComponent({ disabled: true, showDisabledMessage: true });
        fireEvent.mouseOver(screen.getByRole("checkbox"));

        await waitFor(() =>
            expect(
                screen.getByText("Property is not applicable for this configuration of the visualization"),
            ).toBeInTheDocument(),
        );
    });

    it("should call pushData when checkbox value changes", async () => {
        const pushData = vi.fn();
        createComponent({
            properties: {},
            pushData,
        });

        await act(() => userEvent.click(screen.getByRole("checkbox")));
        expect(pushData).toHaveBeenCalledTimes(1);
    });
});
