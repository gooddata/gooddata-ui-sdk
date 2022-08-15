// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IMenuProps, Menu } from "../Menu";
import { SubMenu } from "../SubMenu";

const Toggler = () => <button>toggler</button>;

const MenuContent = (props: React.HTMLAttributes<HTMLElement>) => {
    const { role = "content", ...restProps } = props;
    return (
        <ul role={role} {...restProps}>
            <li>1</li>
            <li>2</li>
        </ul>
    );
};

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

const MenuItem = () => <p>Menu Item</p>;

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

function snapshotComponentAndPortalTarget(Component: React.ReactElement<any>, _portalTarget?: HTMLElement) {
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
