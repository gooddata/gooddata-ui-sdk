// (C) 2007-2026 GoodData Corporation

import { type HTMLAttributes, type ReactElement } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { isClickInsideOwnSubtree } from "../@ui/hooks/useCloseOnOutsideClick.js";

import { type IMenuProps, Menu } from "./Menu.js";
import { SubMenu } from "./SubMenu.js";

function Toggler() {
    return <button>toggler</button>;
}

function MenuContent({ role = "content", ...restProps }: HTMLAttributes<HTMLElement>) {
    return (
        <ul role={role} {...restProps}>
            <li>1</li>
            <li>2</li>
        </ul>
    );
}

const renderComponent = (customProps: any = {}) => {
    const defaultProps: Partial<IMenuProps> = {
        toggler: <Toggler />,
    };
    return render(
        <Menu {...defaultProps} {...customProps.menu}>
            <MenuContent {...customProps.menuContent} />
        </Menu>,
    );
};

const isContentRenderedInBody = () => screen.queryByRole("content");

function MenuItem() {
    return <p>Menu Item</p>;
}

describe("Menu renderer", () => {
    it("should render the toggler", () => {
        renderComponent();

        expect(screen.getByText("toggler")).toBeInTheDocument();
    });

    it("should render the menu content to body", () => {
        renderComponent({ menu: { opened: true } });

        expect(isContentRenderedInBody()).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should mark the portaled content as a floating element anchored to the toggler", () => {
        const { container } = renderComponent({ menu: { opened: true } });

        // the portal is DOM-outside whatever opened the menu, so overlay/dialog outside-click
        // detection must be able to attribute its clicks through the floating-anchor registry
        const content = screen.getByRole("content");
        const panel = content.closest("[data-gd-floating-element]");
        expect(panel).not.toBeNull();

        // the subtree that hosts the toggler owns the portaled content through the anchor chain
        expect(isClickInsideOwnSubtree(content, container)).toBe(true);
    });

    it("should render the menu content to portal target", () => {
        const portalTarget = document.createElement("section");
        const props = {
            menu: {
                opened: true,
                portalTarget,
            },
            menuContent: {
                className: "content-portaled",
            },
        };
        renderComponent(props);

        expect(isContentRenderedInBody()).not.toBeInTheDocument();
        expect(portalTarget.querySelector(".content-portaled")).toBeTruthy();
    });
});

describe("Menu toggling", () => {
    it("should toggle menu when toggler is clicked", async () => {
        renderComponent();

        expect(isContentRenderedInBody()).not.toBeInTheDocument();

        await userEvent.click(screen.getByText("toggler"));

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(isContentRenderedInBody()).toBeInTheDocument();

        await userEvent.click(screen.getByText("toggler"));

        await waitFor(() => {
            expect(screen.queryByText("1")).not.toBeInTheDocument();
        });
        expect(isContentRenderedInBody()).not.toBeInTheDocument();
    });

    it("should close when we click outside of menu", async () => {
        const outsideElement: HTMLElement = document.createElement("button");
        outsideElement.setAttribute("aria-label", "outside");
        document.body.appendChild(outsideElement);
        renderComponent();

        expect(isContentRenderedInBody()).not.toBeInTheDocument();

        await userEvent.click(screen.getByText("toggler"));

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(isContentRenderedInBody()).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText("outside"));

        expect(isContentRenderedInBody()).not.toBeInTheDocument();
        expect(screen.queryByText("1")).not.toBeInTheDocument();

        outsideElement.remove();
    });
});

function snapshotComponentAndPortalTarget(Component: ReactElement<any>, _portalTarget?: HTMLElement) {
    const { baseElement } = render(Component);

    expect(baseElement).toMatchSnapshot();
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
                opened
                openAction="click"
                spacing={16}
                offset={-8}
                alignment={["left", "top"]}
                closeOnScroll
            >
                <MenuContent />
            </Menu>,
        );
    });

    it("should match snapshot of nested menus", () => {
        snapshotComponentAndPortalTarget(
            <Menu toggler={<Toggler />} opened>
                <MenuItem />
                <MenuItem />
                <SubMenu toggler={<Toggler />} opened>
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
            <Menu toggler={<Toggler />} opened portalTarget={portalTarget}>
                <MenuContent />
            </Menu>,
            portalTarget,
        );

        portalTarget.remove();
    });
});
