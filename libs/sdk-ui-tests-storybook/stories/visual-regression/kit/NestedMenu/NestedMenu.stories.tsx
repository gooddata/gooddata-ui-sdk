// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import {
    Button,
    Header,
    type IOnOpenedChangeParams,
    Item,
    ItemsWrapper,
    Menu,
    Separator,
    SubMenu,
} from "@gooddata/sdk-ui-kit";

import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
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
                closeOnScroll
                onOpenedChange={onOpenedChange}
            >
                <ItemsWrapper
                    className="adi-date-granularity-dropdown s-date-granularity-switch"
                    smallItemsSpacing
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

const screenshotProps: INeobackstopConfig = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    openedMenu: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-menu-toggle",
        postInteractionWait: { delay: 250 },
    },
    openedSubmenu: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-menu-toggle" }, { selector: ".s-submenu-toggle" }],
        delay: {
            postOperation: 250,
        },
    },
    closedByOutsideClick: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-menu-toggle" }, { selector: "#outside-click-anchor" }],
        delay: {
            postOperation: 250,
        },
    },
};

export default {
    title: "12 UI Kit/Nested Menu",
};

export function FullFeatured() {
    return <NestedMenuExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshots: screenshotProps } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<NestedMenuExamples />);
Themed.parameters = { kind: "themed", screenshots: screenshotProps } satisfies IStoryParameters;
