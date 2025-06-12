// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import {
    Dropdown,
    IDropdownButtonRenderProps,
    IDropdownBodyRenderProps,
    IDropdownProps,
} from "../Dropdown.js";
import { componentMock } from "./testUtils.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

const bodyMock = componentMock<IDropdownBodyRenderProps>();
const buttonMock = componentMock<IDropdownButtonRenderProps>();

const getButton = () => document.querySelector(buttonMock.selector);
const clickButton = async () => await userEvent.click(getButton());
const getBody = () => document.querySelector(bodyMock.selector);

const renderDropdown = (props: Partial<IDropdownProps> = {}) => {
    const defaultProps = {
        renderButton: buttonMock.component,
        renderBody: bodyMock.component,
    };

    return render(<Dropdown {...defaultProps} {...props} />);
};

describe("Dropdown", () => {
    it("should render dropdown button", () => {
        renderDropdown();

        expect(getButton()).toBeInTheDocument();
    });

    it("should not open dropdown by default", () => {
        renderDropdown();

        expect(getBody()).not.toBeInTheDocument();
    });

    it("should open dropdown by default, when openOnInit is true", () => {
        renderDropdown({ openOnInit: true });

        expect(getBody()).toBeInTheDocument();
    });

    it("should close dropdown, after closeDropdown() callback is called", async () => {
        const CloseButton = buttonMock.componentWithProps(({ closeDropdown }) => ({
            onClick: closeDropdown,
        }));
        renderDropdown({
            renderButton: CloseButton,
            openOnInit: true,
        });

        expect(getBody()).toBeInTheDocument();
        await clickButton();
        await waitFor(() => {
            expect(getBody()).not.toBeInTheDocument();
        });
    });

    it("should open dropdown, after openDropdown() callback is called", async () => {
        const OpenButton = buttonMock.componentWithProps(({ openDropdown }) => ({
            onClick: openDropdown,
        }));
        renderDropdown({
            renderButton: OpenButton,
        });

        await clickButton();
        await waitFor(() => expect(getBody()).toBeInTheDocument());
    });

    it("should toggle dropdown, when toggleDropdown() callback is called", async () => {
        const ToggleButton = buttonMock.componentWithProps(({ toggleDropdown }) => ({
            onClick: toggleDropdown,
        }));
        renderDropdown({
            renderButton: ToggleButton,
        });
        await clickButton();
        await waitFor(() => expect(getBody()).toBeInTheDocument());
        await clickButton();
        await waitFor(() => expect(getBody()).not.toBeInTheDocument());
        await clickButton();
        await waitFor(() => expect(getBody()).toBeInTheDocument());
    });

    it("should call onOpenStateChanged, on isOpen change", async () => {
        const onOpenStateChanged = vi.fn();
        const ToggleButton = buttonMock.componentWithProps(({ toggleDropdown }) => ({
            onClick: toggleDropdown,
        }));
        renderDropdown({
            onOpenStateChanged,
            renderButton: ToggleButton,
        });
        expect(onOpenStateChanged).not.toHaveBeenCalled();
        await clickButton();
        expect(onOpenStateChanged).toHaveBeenNthCalledWith(1, true);
        await clickButton();
        expect(onOpenStateChanged).toHaveBeenNthCalledWith(2, false);
        await clickButton();
        expect(onOpenStateChanged).toHaveBeenNthCalledWith(3, true);
    });
});
