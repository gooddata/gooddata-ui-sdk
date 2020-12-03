// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { ResponsiveText, IResponsiveTextProps } from "../ResponsiveText";

describe("ResponsiveText", () => {
    function createWindowMock() {
        return {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getComputedStyle: jest.fn(
                (): any =>
                    ({
                        fontSize: "20px",
                    } as any),
            ),
        };
    }

    it("should set component configurable properties", () => {
        const props: IResponsiveTextProps = {
            tagName: "span",
            tagClassName: "test-class",
            title: "Responsive text title",
        };
        const component = mount(<ResponsiveText {...props} />);

        expect(component.children().name()).toEqual(props.tagName);
        expect(component.find(".test-class").exists()).toEqual(true);
        expect(component.find(".test-class").props().title).toEqual(props.title);
    });

    it("should add resize window event listener when component is mounted", () => {
        const props = {
            window: createWindowMock(),
        };
        mount(<ResponsiveText {...props} />);

        expect(props.window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("should remove window event listener when component is unmounted", () => {
        const props = {
            window: createWindowMock(),
        };
        const component = mount(<ResponsiveText {...props} />);

        component.unmount();

        expect(props.window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });
});
