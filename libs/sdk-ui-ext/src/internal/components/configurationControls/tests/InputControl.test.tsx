// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor, fireEvent } from "@testing-library/react";
import noop from "lodash/noop";
import { InputControl, IInputControlProps } from "../InputControl";
import { createInternalIntl, InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { setupComponent } from "../../../tests/testHelper";

describe("InputControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        properties: {},
        intl: createInternalIntl(),
        propertiesMeta: {},
        pushData: noop,
        placeholder: "properties.auto_placeholder",
        labelText: "properties.canvas.gridline", // pick something what exists in the dictionary
    };

    function createComponent(customProps: Partial<IInputControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return setupComponent(
            <InternalIntlWrapper>
                <InputControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render input control", () => {
        const { getByRole } = createComponent();
        expect(getByRole("textbox")).toBeInTheDocument();
    });

    it("should be enabled by default", () => {
        const { getByRole } = createComponent();
        expect(getByRole("textbox")).toBeEnabled();
    });

    it("should render disabled checkbox", () => {
        const { getByRole } = createComponent({ disabled: true });
        expect(getByRole("textbox")).toBeDisabled();
    });

    it("should render label provided by props", () => {
        // pick something in the dictionary
        const { getByText } = createComponent({ labelText: "properties.canvas.title" });
        expect(getByText("Canvas")).toBeInTheDocument();
    });

    it("should render input control with given value", () => {
        const { getByRole } = createComponent({
            value: "foo",
        });
        expect(getByRole("textbox")).toHaveValue("foo");
    });

    it("should pushData when press Enter and value in state is different than in props", async () => {
        const pushData = jest.fn();
        const { getByRole, user } = createComponent({
            value: "foo",
            pushData,
        });

        await user.clear(getByRole("textbox"));
        await user.type(getByRole("textbox"), "bar");
        await user.keyboard("{enter}");
        await waitFor(() => {
            expect(pushData).toHaveBeenCalledTimes(1);
            expect(pushData).toHaveBeenCalledWith({ properties: { controls: { valuePath: "bar" } } });
        });
    });

    it("should not call pushData when value is the same", async () => {
        const pushData = jest.fn();
        const { getByRole, user } = createComponent({
            value: "4",
            pushData,
        });

        await user.clear(getByRole("textbox"));
        await user.type(getByRole("textbox"), "4");
        fireEvent.blur(getByRole("textbox"));
        expect(pushData).toHaveBeenCalledTimes(0);
    });

    it("should pushData when focus is changed and value in state is different than in props", async () => {
        const pushData = jest.fn();
        const { getByRole, user } = createComponent({
            value: "foo",
            pushData,
        });

        await user.clear(getByRole("textbox"));
        await user.type(getByRole("textbox"), "bar");
        fireEvent.blur(getByRole("textbox"));
        expect(pushData).toHaveBeenCalledTimes(1);
    });

    it("should pushData with value", async () => {
        const pushData = jest.fn();
        const { getByRole, user } = createComponent({
            value: "foo",
            pushData,
        });

        await user.clear(getByRole("textbox"));
        await user.type(getByRole("textbox"), "4");
        fireEvent.blur(getByRole("textbox"));
        expect(pushData).toHaveBeenCalledWith({
            properties: { controls: { valuePath: "4" } },
        });
    });

    it("should remove trailing dot when type:number", async () => {
        const pushData = jest.fn();
        const { getByRole, user } = createComponent({
            type: "number",
            value: "foo",
            pushData,
        });

        await user.clear(getByRole("textbox"));
        await user.type(getByRole("textbox"), "4.");
        fireEvent.blur(getByRole("textbox"));
        expect(pushData).toHaveBeenCalledWith({
            properties: { controls: { valuePath: "4" } },
        });
    });
});
