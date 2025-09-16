// (C) 2021-2025 GoodData Corporation

import { useState } from "react";

import {
    Button,
    Header,
    IOnOpenedChangeParams,
    Item,
    ItemsWrapper,
    Menu,
    Separator,
    SubMenu,
} from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

import "./NestedMenu.scss";

function NestedMenuExamples() {
    const [opened, setOpened] = useState(false);

    const onOpenedChange = ({ opened }: IOnOpenedChangeParams) => setOpened(opened);
    const toggleMenu = () => setOpened(!opened);

    return (
        <div className="library-component screenshot-target">
            <h4 id="outside-click-anchor">Nested Menu</h4>

            <Menu
                toggler={
                    <Button value="Menu" className="gd-button-primary s-menu-toggle" onClick={toggleMenu} />
                }
                opened={opened}
                openAction={"click"}
                closeOnScroll={true}
                onOpenedChange={onOpenedChange}
            >
                <ItemsWrapper
                    className="adi-date-granularity-dropdown s-date-granularity-switch"
                    smallItemsSpacing={true}
                >
                    <Header>Main</Header>
                    <Item>First item</Item>
                    <Item>Second item</Item>
                    <Item>Third item</Item>
                    <Separator />
                    <SubMenu
                        toggler={<Item className="is-selected s-submenu-toggle">More...</Item>}
                        openAction={"click"}
                        offset={-70}
                    >
                        <ItemsWrapper smallItemsSpacing>
                            <Header>Secondary</Header>
                            <Item>Fourth item</Item>
                            <Item className="is-selected">Fifth item</Item>
                            <Item>Sixth item</Item>
                        </ItemsWrapper>
                    </SubMenu>
                </ItemsWrapper>
            </Menu>
        </div>
    );
}

const screenshotProps = {
    closed: {},
    openedMenu: {
        clickSelector: ".s-menu-toggle",
        postInteractionWait: 200,
    },
    openedSubmenu: {
        clickSelectors: [".s-menu-toggle", ".s-submenu-toggle"],
        postInteractionWait: 200,
    },
    closedByOutsideClick: {
        clickSelectors: [".s-menu-toggle", "#outside-click-anchor"],
        postInteractionWait: 200,
    },
};

export default {
    title: "12 UI Kit/Nested Menu",
};

export function FullFeatured() {
    return <NestedMenuExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshots: screenshotProps };

export const Themed = () => wrapWithTheme(<NestedMenuExamples />);
Themed.parameters = { kind: "themed", screenshots: screenshotProps };
