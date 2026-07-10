// (C) 2007-2026 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
    Dropdown,
    type IDropdownBodyRenderProps,
    type IDropdownButtonRenderProps,
    type IDropdownProps,
} from "../Dropdown.js";

import { componentMock } from "./testUtils.js";

const bodyMock = componentMock<IDropdownBodyRenderProps>();
const buttonMock = componentMock<IDropdownButtonRenderProps>();

const getButton = () => document.querySelector(buttonMock.selector);
const clickButton = async () => await userEvent.click(getButton()!);
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

    it("should call consumer onAlign when the overlay aligns, without looping", async () => {
        const onAlign = vi.fn();
        renderDropdown({ onAlign, openOnInit: true });

        await waitFor(() => expect(onAlign).toHaveBeenCalled());

        // The autofocus re-arm on align must not re-render in a way that makes the
        // overlay realign forever (Overlay realigns after every update).
        const settledCallCount = onAlign.mock.calls.length;
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(onAlign.mock.calls.length).toBeLessThanOrEqual(settledCallCount + 1);
    });

    it("should focus the initialFocus element when opened with autofocusOnOpen", async () => {
        renderDropdown({
            openOnInit: true,
            autofocusOnOpen: true,
            initialFocus: "autofocus-target",
            renderBody: () => <input id="autofocus-target" />,
        });

        await waitFor(() => expect(document.activeElement?.id).toBe("autofocus-target"));
    });

    it("should close on Escape inside the body without leaking the event to ancestors", async () => {
        const ancestorKeyDown = vi.fn();
        render(
            <div onKeyDown={ancestorKeyDown}>
                <Dropdown
                    renderButton={buttonMock.component}
                    renderBody={() => <input id="escape-target" />}
                    openOnInit
                    closeOnEscape
                />
            </div>,
        );

        document.getElementById("escape-target")!.focus();
        await userEvent.keyboard("{Escape}");

        await waitFor(() => expect(document.getElementById("escape-target")).toBeNull());
        expect(ancestorKeyDown).not.toHaveBeenCalled();
    });
});
