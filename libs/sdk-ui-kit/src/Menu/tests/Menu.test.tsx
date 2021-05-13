// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { Menu } from "../Menu";
import { SubMenu } from "../SubMenu";

// Enzyme object unmount method needs to be called explicitly after each test
// because top level Menu mounts its content to document.body with React Portals.
// If we forget about this it will leave stray elements in .body which might
// cause trouble, especially with snapshots tests that snapshot document.body.

const Toggler = () => <button>toggler</button>;

const MenuContent = (props: React.HTMLAttributes<HTMLElement>) => {
    const { className = "content", ...restProps } = props;
    return (
        <ul className={className} {...restProps}>
            <li>1</li>
            <li>2</li>
        </ul>
    );
};
const MenuItem = () => <p>Menu Item</p>;

const isContentRenderedInBody = () => Boolean(document.querySelector("body .content"));

describe("Menu renderer", () => {
    it("should render the toggler", () => {
        const wrapper = mount(
            <Menu toggler={<Toggler />}>
                <MenuContent />
            </Menu>,
        );

        expect(wrapper.contains(<Toggler />)).toBeTruthy();
        wrapper.unmount();
    });

    it("should render the menu content to body", () => {
        const wrapper = mount(
            <Menu toggler={<Toggler />} opened={true}>
                <MenuContent />
            </Menu>,
        );

        expect(isContentRenderedInBody()).toBeTruthy();
        wrapper.unmount();
    });

    it("should render the menu content to portal target", () => {
        const portalTarget = document.createElement("section");
        const wrapper = mount(
            <Menu toggler={<Toggler />} portalTarget={portalTarget} opened={true}>
                <MenuContent className="content-portaled" />
            </Menu>,
        );

        expect(portalTarget.querySelector(".content-portaled")).toBeTruthy();
        wrapper.unmount();
    });
});

describe("Menu toggling", () => {
    it("should toggle menu when toggler is clicked", () => {
        const wrapper = mount(
            <Menu toggler={<Toggler />}>
                <MenuContent />
            </Menu>,
        );

        expect(isContentRenderedInBody()).toBeFalsy();
        wrapper.find(Toggler).simulate("mousedown");
        wrapper.find(Toggler).simulate("click");
        expect(isContentRenderedInBody()).toBeTruthy();
        wrapper.find(Toggler).simulate("mousedown");
        wrapper.find(Toggler).simulate("click");
        expect(isContentRenderedInBody()).toBeFalsy();

        wrapper.unmount();
    });

    it("should close when we click outside of menu", () => {
        const outsideElement = document.createElement("button");
        document.body.appendChild(outsideElement);

        const wrapper = mount(
            <Menu toggler={<Toggler />}>
                <MenuContent />
            </Menu>,
        );

        expect(isContentRenderedInBody()).toBeFalsy();
        wrapper.find(Toggler).simulate("mousedown");
        wrapper.find(Toggler).simulate("click");
        expect(isContentRenderedInBody()).toBeTruthy();
        outsideElement.dispatchEvent(new MouseEvent("mousedown"));
        expect(isContentRenderedInBody()).toBeFalsy();

        outsideElement.remove();
        wrapper.unmount();
    });

    it("should open/close when we change opened prop", () => {
        const wrapper = mount(
            <Menu toggler={<Toggler />} opened={false}>
                <MenuContent />
            </Menu>,
        );

        expect(isContentRenderedInBody()).toBeFalsy();
        expect(wrapper.props().opened).toBe(false);

        wrapper.setProps({ opened: true });

        expect(isContentRenderedInBody()).toBeTruthy();
        expect(wrapper.props().opened).toBe(true);

        wrapper.setProps({ opened: false });

        expect(isContentRenderedInBody()).toBeFalsy();
        expect(wrapper.props().opened).toBe(false);

        wrapper.unmount();
    });
});

function snapshotComponentAndPortalTarget(Component: React.ReactElement<any>, portalTarget?: HTMLElement) {
    const wrapper = mount(Component);

    // We just want to snapshot final rendered HTML without any React components.
    // - Passing React elements into snapshot will not snapshot the outputted html
    //   but it will snapshot react elements structure
    // - Passing just wrapper.html() into snapshot will have the result unformatted
    //   on one line.
    // - So we do this to have formatted final html in snapshot.
    const el = document.createElement("div");
    // tslint:disable-next-line:no-inner-html
    el.innerHTML = wrapper.html();

    expect(el).toMatchSnapshot();
    expect(portalTarget || document.querySelector("body")).toMatchSnapshot();

    wrapper.unmount();
}

describe("Menu snapshot", () => {
    it("should match snapshot of menu with no config", () => {
        snapshotComponentAndPortalTarget(
            <Menu toggler={<Toggler />}>
                <MenuContent />
            </Menu>,
        );
    });

    it("should match snapshot of menu with config", () => {
        snapshotComponentAndPortalTarget(
            <Menu
                toggler={<Toggler />}
                opened={true}
                openAction="click"
                spacing={16}
                offset={-8}
                alignment={["left", "top"]}
                closeOnScroll={true}
            >
                <MenuContent />
            </Menu>,
        );
    });

    it("should match snapshot of nested menus", () => {
        snapshotComponentAndPortalTarget(
            <Menu toggler={<Toggler />} opened={true}>
                <MenuItem />
                <MenuItem />
                <SubMenu toggler={<Toggler />} opened={true}>
                    <MenuItem />
                    <MenuItem />
                </SubMenu>
                <MenuItem />
            </Menu>,
        );
    });

    it("should match snapshot of menu with portalTarget", () => {
        const portalTarget = document.createElement("section");
        portalTarget.classList.add("portal-target");
        document.body.appendChild(portalTarget);

        snapshotComponentAndPortalTarget(
            <Menu toggler={<Toggler />} opened={true} portalTarget={portalTarget}>
                <MenuContent />
            </Menu>,
            portalTarget,
        );

        portalTarget.remove();
    });
});
