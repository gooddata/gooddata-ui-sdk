// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { ResponsiveText, IResponsiveTextProps } from "../ResponsiveText";

describe("ResponsiveText", () => {
    function createContainerMock(scrollWidth: number, width: number) {
        return {
            scrollWidth,
            getBoundingClientRect() {
                return {
                    width,
                };
            },
        };
    }

    function createWindowMock() {
        return {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getComputedStyle: jest.fn(() => ({
                fontSize: "20px",
            })),
        };
    }

    function renderComponent(
        customProps: IResponsiveTextProps,
    ): ReactWrapper<IResponsiveTextProps, any, ResponsiveText> {
        return mount(<ResponsiveText {...customProps} />);
    }

    it("should set component configurable properties", () => {
        const props: IResponsiveTextProps = {
            tagName: "span",
            tagClassName: "test-class",
            title: "Responsive text title",
        };
        const component = renderComponent(props);

        expect(component.children().name()).toEqual(props.tagName);
        expect(component.find(".test-class").exists()).toEqual(true);
        expect(component.find(".test-class").props().title).toEqual(props.title);
    });

    it("should add resize window event listener when component is mounted", () => {
        const props = {
            window: createWindowMock(),
        };
        renderComponent(props);

        expect(props.window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("should remove window event listener when component is unmounted", () => {
        const props = {
            window: createWindowMock(),
        };
        const component = renderComponent(props);

        component.unmount();

        expect(props.window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("should adjust component text size when props changed", () => {
        const props = {
            tagClassName: "responsive-text",
            window: createWindowMock(),
        };
        const component = renderComponent(props);
        component.instance().containerRef.current = createContainerMock(100, 100);

        expect(component.find(".responsive-text").instance().style.fontSize).toBe("NaNpx");

        component.setProps({ tagClassName: "new-responsive-text" });

        expect(component.find(".new-responsive-text").instance().style.fontSize).toBe("20px");
    });

    it("should adjust component text size when window size is changed", () => {
        const props = {
            tagClassName: "responsive-text",
            window: createWindowMock(),
        };
        const component = renderComponent(props);

        component.instance().containerRef.current = createContainerMock(100, 100);
        component.instance().resetFontSize();
        expect(component.find(".responsive-text").instance().style.fontSize).toBe("20px");

        component.instance().containerRef.current = createContainerMock(160, 100);
        component.instance().resetFontSize();
        expect(component.find(".responsive-text").instance().style.fontSize).toBe("12px");

        component.instance().containerRef.current = createContainerMock(140, 100);
        component.instance().resetFontSize();
        expect(component.find(".responsive-text").instance().style.fontSize).toBe("14px");
    });
});
