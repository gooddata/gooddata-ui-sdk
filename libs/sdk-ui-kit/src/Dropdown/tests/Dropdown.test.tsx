// (C) 2007-2020 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { Dropdown, IDropdownButtonRenderProps, IDropdownBodyRenderProps, IDropdownProps } from "../Dropdown";
import { componentMock } from "./testUtils";

const bodyMock = componentMock<IDropdownBodyRenderProps>();
const buttonMock = componentMock<IDropdownButtonRenderProps>();

const findButton = (dropdown: ReactWrapper) => dropdown.find(buttonMock.selector);
const clickButton = (dropdown: ReactWrapper) => findButton(dropdown).simulate("click");
const isBodyRendered = (dropdown: ReactWrapper) => dropdown.find(bodyMock.selector).exists();

const renderDropdown = (props: Partial<IDropdownProps> = {}) => {
    const defaultProps = {
        renderButton: buttonMock.component,
        renderBody: bodyMock.component,
    };

    return mount(<Dropdown {...defaultProps} {...props} />);
};

describe("Dropdown", () => {
    it("should render dropdown button", () => {
        const dropdown = renderDropdown();
        expect(findButton(dropdown).exists()).toBeTruthy();
    });

    it("should not open dropdown by default", () => {
        const dropdown = renderDropdown();
        expect(isBodyRendered(dropdown)).toBeFalsy();
    });

    it("should open dropdown by default, when openOnInit is true", () => {
        const dropdown = renderDropdown({ openOnInit: true });
        expect(isBodyRendered(dropdown)).toBeTruthy();
    });

    it("should close dropdown, after closeDropdown() callback is called", () => {
        const CloseButton = buttonMock.componentWithProps(({ closeDropdown }) => ({
            onClick: closeDropdown,
        }));
        const dropdown = renderDropdown({
            renderButton: CloseButton,
            openOnInit: true,
        });
        expect(isBodyRendered(dropdown)).toBeTruthy();
        clickButton(dropdown);
        expect(isBodyRendered(dropdown)).toBeFalsy();
    });

    it("should open dropdown, after openDropdown() callback is called", () => {
        const OpenButton = buttonMock.componentWithProps(({ openDropdown }) => ({
            onClick: openDropdown,
        }));
        const dropdown = renderDropdown({
            renderButton: OpenButton,
        });
        clickButton(dropdown);
        expect(isBodyRendered(dropdown)).toBeTruthy();
    });

    it("should toggle dropdown, when toggleDropdown() callback is called", () => {
        const ToggleButton = buttonMock.componentWithProps(({ toggleDropdown }) => ({
            onClick: toggleDropdown,
        }));
        const dropdown = renderDropdown({
            renderButton: ToggleButton,
        });
        clickButton(dropdown);
        expect(isBodyRendered(dropdown)).toBeTruthy();
        clickButton(dropdown);
        expect(isBodyRendered(dropdown)).toBeFalsy();
        clickButton(dropdown);
        expect(isBodyRendered(dropdown)).toBeTruthy();
    });

    it("should call onOpenStateChanged, on isOpen change", () => {
        const onOpenStateChanged = jest.fn();
        const ToggleButton = buttonMock.componentWithProps(({ toggleDropdown }) => ({
            onClick: toggleDropdown,
        }));
        const dropdown = renderDropdown({
            onOpenStateChanged,
            renderButton: ToggleButton,
        });
        expect(onOpenStateChanged).not.toHaveBeenCalled();
        clickButton(dropdown);
        expect(onOpenStateChanged).toHaveBeenNthCalledWith(1, true);
        clickButton(dropdown);
        expect(onOpenStateChanged).toHaveBeenNthCalledWith(2, false);
        clickButton(dropdown);
        expect(onOpenStateChanged).toHaveBeenNthCalledWith(3, true);
    });
});
