// (C) 2021 GoodData Corporation
import React, { useState } from "react";
import {
    ItemsWrapper,
    Separator,
    Header,
    Item,
    Menu,
    SubMenu,
    Button,
    IOnOpenedChangeParams,
} from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";

import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "./NestedMenu.scss";

const NestedMenuExamples = () => {
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
};

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

storiesOf(`${UiKit}/Nested Menu`)
    .add("full-featured", () => <NestedMenuExamples />, { screenshots: screenshotProps })
    .add("themed", () => wrapWithTheme(<NestedMenuExamples />), { screenshots: screenshotProps });
