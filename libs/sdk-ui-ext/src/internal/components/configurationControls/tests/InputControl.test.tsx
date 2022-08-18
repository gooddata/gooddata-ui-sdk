// (C) 2019-2022 GoodData Corporation
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import { InputControl, IInputControlProps } from "../InputControl";
import { createInternalIntl, InternalIntlWrapper } from "../../../utils/internalIntlProvider";

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
        return render(
            <InternalIntlWrapper>
                <InputControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render input control", () => {
        createComponent();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should be enabled by default", () => {
        createComponent();
        expect(screen.getByRole("textbox")).toBeEnabled();
    });

    it("should render disabled checkbox", () => {
        createComponent({ disabled: true });
        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should render label provided by props", () => {
        // pick something in the dictionary
        createComponent({ labelText: "properties.canvas.title" });
        expect(screen.getByText("Canvas")).toBeInTheDocument();
    });

    it("should render input control with given value", () => {
        createComponent({
            value: "foo",
        });
        expect(screen.getByRole("textbox")).toHaveValue("foo");
    });

    it("should pushData when press Enter and value in state is different than in props", async () => {
        const pushData = jest.fn();
        createComponent({
            value: "foo",
            pushData,
        });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "bar");
        await userEvent.keyboard("{enter}");
        await waitFor(() => {
            expect(pushData).toHaveBeenCalledTimes(1);
            expect(pushData).toHaveBeenCalledWith({ properties: { controls: { valuePath: "bar" } } });
        });
    });

    it("should not call pushData when value is the same", async () => {
        const pushData = jest.fn();
        createComponent({
            value: "4",
            pushData,
        });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "4");
        fireEvent.blur(screen.getByRole("textbox"));
        expect(pushData).toHaveBeenCalledTimes(0);
    });

    it("should pushData when focus is changed and value in state is different than in props", async () => {
        const pushData = jest.fn();
        createComponent({
            value: "foo",
            pushData,
        });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "bar");
        fireEvent.blur(screen.getByRole("textbox"));
        expect(pushData).toHaveBeenCalledTimes(1);
    });

    it("should pushData with value", async () => {
        const pushData = jest.fn();
        createComponent({
            value: "foo",
            pushData,
        });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "4");
        fireEvent.blur(screen.getByRole("textbox"));
        expect(pushData).toHaveBeenCalledWith({
            properties: { controls: { valuePath: "4" } },
        });
    });

    it("should remove trailing dot when type:number", async () => {
        const pushData = jest.fn();
        createComponent({
            type: "number",
            value: "foo",
            pushData,
        });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "4.");
        fireEvent.blur(screen.getByRole("textbox"));
        expect(pushData).toHaveBeenCalledWith({
            properties: { controls: { valuePath: "4" } },
        });
    });
});
