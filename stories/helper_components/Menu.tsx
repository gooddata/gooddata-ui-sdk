// (C) 2007-2018 GoodData Corporation
import { action } from "@storybook/addon-actions";
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";
import { ItemsWrapper, Header, Separator, Item } from "@gooddata/goodstrap/lib/List/MenuList";
import noop = require("lodash/noop");

import AggregationsMenu from "../../src/components/core/pivotTable/AggregationsMenu";
import AggregationsSubMenu from "../../src/components/core/pivotTable/AggregationsSubMenu";
import Menu from "../../src/components/menu/Menu";
import SubMenu, { ISubMenuProps } from "../../src/components/menu/SubMenu";
import { IOnOpenedChangeParams } from "../../src/components/menu/MenuSharedTypes";
import { EXECUTION_RESPONSE_2A_3M } from "../../src/components/visualizations/table/fixtures/2attributes3measures";
import { createIntlMock } from "../../src/components/visualizations/utils/intlUtils";
import { IMenuAggregationClickConfig } from "../../src/interfaces/PivotTable";
import {
    ATTRIBUTE_HEADERS_3A_LONG_NAME,
    COLUMN_TOTAL_1ST_2ND_ATTR_MAX,
    GRAND_TOTAL_SUM,
} from "../data/componentProps";

const ToggleButton = () => <button>toggle menu</button>;

const TestMenuItem = ({ length = 4, close }: { length?: number; close?: () => void }) => (
    <div
        style={{
            padding: 8,
            fontFamily: "monospace",
            background: close ? "orange" : "lightgreen",
            whiteSpace: "nowrap",
            cursor: close ? "pointer" : null,
        }}
        onClick={close}
    >
        {close ? "close" : "text ".repeat(length).trim()}
    </div>
);

const TestSubMenu = ({ children, ...subMenuProps }: Partial<ISubMenuProps>) => (
    <SubMenu
        toggler={
            <div
                style={{
                    padding: 8,
                    background: "lightblue",
                    cursor: subMenuProps.openAction === "click" ? "pointer" : null,
                }}
            >
                submenu
            </div>
        }
        {...subMenuProps}
    >
        <div
            style={{
                background: "tomato",
                boxShadow: "2px 2px 2px 2px rgba(0, 0, 0, 0.1)",
            }}
        >
            {children}
        </div>
    </SubMenu>
);

storiesOf("Helper components/Menu", module)
    .add("basic menu", () => (
        <Menu toggler={<ToggleButton />}>
            <TestMenuItem />
            <TestMenuItem />
            <TestMenuItem />
        </Menu>
    ))
    .add("nested menu", () => (
        <Menu toggler={<ToggleButton />}>
            <TestMenuItem />
            <TestMenuItem />
            <TestSubMenu>
                <TestMenuItem />
                <TestMenuItem />
                <TestSubMenu>
                    <TestMenuItem />
                    <TestMenuItem />
                    <TestMenuItem />
                </TestSubMenu>
            </TestSubMenu>
            <TestMenuItem />
        </Menu>
    ))
    .add("closing menu with render prop", () => (
        <Menu toggler={<ToggleButton />}>
            {({ closeMenu }) => (
                <React.Fragment>
                    <TestMenuItem close={closeMenu} />
                    <TestMenuItem />
                    <TestMenuItem />
                </React.Fragment>
            )}
        </Menu>
    ))
    .add("alignment", () => (
        <React.Fragment>
            <p>
                Prefered alignment where menu is opened can be set. If there is enough space it is positioned
                to preferred alignment, if not, it is placed to less ideal position.
            </p>
            <Menu toggler={<ToggleButton />} alignment={["bottom", "right"]}>
                <TestMenuItem />
                <TestMenuItem />
                <TestMenuItem length={8} />
                <TestMenuItem />
                <TestSubMenu alignment={["right", "top"]}>
                    <TestMenuItem length={5} />
                    <TestMenuItem />
                    <TestSubMenu alignment={["bottom", "left"]}>
                        <TestMenuItem />
                        <TestMenuItem length={8} />
                        <TestMenuItem />
                    </TestSubMenu>
                </TestSubMenu>
                <TestMenuItem />
            </Menu>
        </React.Fragment>
    ))
    .add("spacing", () => (
        <React.Fragment>
            <p>Spacing betweem toggler and menu.</p>
            <Menu toggler={<ToggleButton />} spacing={16}>
                <TestMenuItem />
                <TestMenuItem />
                <TestSubMenu spacing={8}>
                    <TestMenuItem />
                    <TestMenuItem />
                </TestSubMenu>
                <TestMenuItem />
            </Menu>
        </React.Fragment>
    ))
    .add("offset", () => (
        <React.Fragment>
            <p>Alignment/Offset of menu relative to toggler in given alignment.</p>
            <Menu toggler={<ToggleButton />} offset={-4}>
                <TestMenuItem />
                <TestMenuItem />
                <TestSubMenu offset={4}>
                    <TestMenuItem />
                </TestSubMenu>
                <TestMenuItem />
            </Menu>
        </React.Fragment>
    ))
    .add("open action", () => (
        <Menu
            toggler={<div style={{ background: "lightblue" }}>Toggle menu by hover</div>}
            openAction="hover"
        >
            <TestMenuItem />
            <TestMenuItem />
            <TestSubMenu openAction="click">
                <TestMenuItem />
                <TestMenuItem />
            </TestSubMenu>
            <TestMenuItem />
        </Menu>
    ))
    .add("default opened", () => (
        <Menu toggler={<ToggleButton />} defaultOpened={false}>
            <TestMenuItem />
            <TestMenuItem />
            <TestSubMenu openAction="click" defaultOpened={true}>
                <TestMenuItem />
                <TestSubMenu openAction="click" defaultOpened={true}>
                    <TestMenuItem />
                    <TestMenuItem />
                </TestSubMenu>
                <TestMenuItem />
            </TestSubMenu>
            <TestMenuItem />
        </Menu>
    ))
    .add("controlled menu", () => {
        class ControlledMenu extends React.Component<{}, { opened: boolean }> {
            public state = {
                opened: true,
            };

            public render() {
                return (
                    <React.Fragment>
                        <p>
                            Top level menu can be controlled. If you pass prop 'opened' it switches from
                            unconstrolled to controlled component. If you do this you should also sunscribe to
                            'onOpenedChange' prop to get updates about 'closeMenu' render prop calls or clicks
                            from outside of the MenuTopLevel.
                        </p>
                        <button onClick={this.toggleOpened}>Outside component controlling menu</button>
                        <hr />
                        <Menu
                            opened={this.state.opened}
                            onOpenedChange={this.onOpenedChange}
                            toggler={<ToggleButton />}
                        >
                            {({ closeMenu }) => (
                                <React.Fragment>
                                    <TestMenuItem close={closeMenu} />
                                    <TestMenuItem />
                                    <TestMenuItem />
                                </React.Fragment>
                            )}
                        </Menu>
                    </React.Fragment>
                );
            }

            private toggleOpened = () => {
                this.setState(state => ({
                    opened: !state.opened,
                }));
            };

            private onOpenedChange = ({ opened }: IOnOpenedChangeParams) => {
                this.setState({ opened });
            };
        }

        return <ControlledMenu />;
    })
    .add("close on scroll", () => (
        <React.Fragment>
            <p>
                Closes the menu whenever user scrolls (can be scrolling of the whole page or some element with
                scrollbar).
            </p>
            <div
                style={{
                    width: 100,
                    height: 100,
                    overflow: "auto",
                }}
            >
                <div
                    style={{
                        width: 1000,
                        height: 1000,
                        background: "lightblue",
                    }}
                >
                    Scrollable element
                </div>
            </div>
            <Menu toggler={<ToggleButton />} closeOnScroll={true}>
                <TestMenuItem />
                <TestMenuItem />
            </Menu>
        </React.Fragment>
    ))
    .add("portal target", () => {
        class PortalTargetMenu extends React.Component<{}, { portalReady: boolean }> {
            public elPortalTarget: Element;

            public state = {
                portalReady: false,
            };

            public render() {
                return (
                    <React.Fragment>
                        <p>
                            Menu uses React portals to render the top level menu inside body element. This is
                            done to prevent problems with overflow: hidden on parent components. Target
                            element, where menu is rendered, can be changed with 'portalTarget' prop.
                        </p>
                        <section
                            ref={(el: HTMLElement) => {
                                this.elPortalTarget = el;
                                if (!this.state.portalReady) {
                                    this.setState({ portalReady: true });
                                }
                            }}
                        />

                        <p>'portalTarget' props set to render into custom section element.</p>
                        {this.state.portalReady && (
                            <Menu toggler={<ToggleButton />} portalTarget={this.elPortalTarget}>
                                <TestMenuItem />
                                <TestMenuItem />
                            </Menu>
                        )}

                        <p>No 'portalTarget' set, menu is rendered into body.</p>
                        <Menu toggler={<ToggleButton />}>
                            <TestMenuItem />
                            <TestMenuItem />
                        </Menu>
                    </React.Fragment>
                );
            }
        }

        return <PortalTargetMenu />;
    })
    .add("presentational menu components", () => (
        <Menu toggler={<ToggleButton />} spacing={4}>
            {({ closeMenu }) => (
                <ItemsWrapper>
                    <SubMenu
                        toggler={
                            <Item subMenu={true} checked={true}>
                                Sort
                            </Item>
                        }
                        offset={-8}
                    >
                        <ItemsWrapper>
                            <Item checked={true} onClick={closeMenu}>
                                Net Revenue
                            </Item>
                            <Item onClick={closeMenu}>Gross Revenue</Item>
                        </ItemsWrapper>
                    </SubMenu>

                    <Separator />

                    <Header>AGGREGATE</Header>
                    <SubMenu
                        toggler={
                            <Item subMenu={true} checked={true}>
                                Total (rollup)
                            </Item>
                        }
                        offset={-8}
                    >
                        <ItemsWrapper>
                            <Item checked={true} onClick={closeMenu}>
                                of all rows
                            </Item>
                            <Item checked={true} onClick={closeMenu}>
                                within department
                            </Item>
                            <Item onClick={closeMenu}>within city</Item>
                        </ItemsWrapper>
                    </SubMenu>
                    <Item onClick={closeMenu}>Sum</Item>
                    <Item onClick={closeMenu}>Average</Item>
                    <Item onClick={closeMenu}>Median</Item>

                    <Separator />
                    <Item disabled={true} checked={true}>
                        Disabled Item
                    </Item>
                    <SubMenu toggler={<Item subMenu={true}>Menu with just items</Item>} offset={-8}>
                        <ItemsWrapper smallItemsSpacing={true}>
                            <Item onClick={closeMenu}>Item text text</Item>
                            <Item onClick={closeMenu}>Item text text text</Item>
                            <Separator />
                            <Item onClick={closeMenu}>Item text text</Item>
                            <Header>HEADING</Header>
                            <Item onClick={closeMenu}>Item text text text</Item>
                        </ItemsWrapper>
                    </SubMenu>
                </ItemsWrapper>
            )}
        </Menu>
    ))
    .add("presentational menu components - example content", () =>
        screenshotWrap(
            <div
                className="screenshot-target"
                style={{
                    // For screenshot tests
                    minHeight: 500,
                }}
            >
                <Menu toggler={<ToggleButton />} opened={true} spacing={4}>
                    <ItemsWrapper>
                        <Header>AGGREGATE</Header>
                        <Item checked={true}>Sum</Item>
                        <Item>Average</Item>
                        <Item>Median</Item>

                        <Separator />
                        <Item disabled={true} checked={true}>
                            Disabled Item
                        </Item>
                        <SubMenu
                            toggler={<Item subMenu={true}>Menu with just items</Item>}
                            offset={-8}
                            opened={true}
                        >
                            <ItemsWrapper smallItemsSpacing={true}>
                                <Item>Item text text</Item>
                                <Item>Item text text text</Item>
                                <Separator />
                                <Item>Item text text</Item>
                                <Header>HEADING</Header>
                                <Item>Item text text text</Item>
                            </ItemsWrapper>
                        </SubMenu>
                    </ItemsWrapper>
                </Menu>
            </div>,
        ),
    )
    .add("Presentational menu components - alignment", () =>
        screenshotWrap(
            <div
                className="screenshot-target"
                style={{
                    // For screenshot tests
                    boxSizing: "border-box",
                    width: 600,
                    height: 600,
                    paddingTop: 400,
                    paddingLeft: 400,
                }}
            >
                <Menu toggler={<ToggleButton />} opened={true} spacing={4} alignment={["left", "bottom"]}>
                    <ItemsWrapper style={{ height: 100, width: 150 }}>
                        <SubMenu
                            toggler={<Item subMenu={true}>Submenu</Item>}
                            offset={-8}
                            opened={true}
                            alignment={["left", "top"]}
                        >
                            <ItemsWrapper style={{ height: 200, width: 150 }}>
                                <SubMenu
                                    toggler={<Item subMenu={true}>Submenu</Item>}
                                    offset={-8}
                                    opened={true}
                                    alignment={["right", "top"]}
                                >
                                    <ItemsWrapper style={{ height: 150, width: 150 }}>
                                        <SubMenu
                                            toggler={<Item subMenu={true}>Submenu</Item>}
                                            offset={-8}
                                            opened={true}
                                            alignment={["right", "bottom"]}
                                        >
                                            <ItemsWrapper smallItemsSpacing={true} style={{ width: 100 }}>
                                                <Item>Item text</Item>
                                            </ItemsWrapper>
                                        </SubMenu>
                                    </ItemsWrapper>
                                </SubMenu>
                            </ItemsWrapper>
                        </SubMenu>
                    </ItemsWrapper>
                </Menu>
            </div>,
        ),
    )
    .add("aggregation menus", () => {
        const intlMock = createIntlMock();
        const getExecutionResponse = () => EXECUTION_RESPONSE_2A_3M;
        const getTotals = () => [GRAND_TOTAL_SUM];
        const onAggregationSelect = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
            action("onAggregationSelect")(menuAggregationClickConfig);
        };

        return screenshotWrap(
            <div className="screenshot-target" style={{ minHeight: 500 }}>
                <AggregationsMenu
                    intl={intlMock}
                    isMenuOpened={true}
                    isMenuButtonVisible={true}
                    showSubmenu={true}
                    colId={"a_6_1-m_0"}
                    getExecutionResponse={getExecutionResponse}
                    getTotals={getTotals}
                    onAggregationSelect={onAggregationSelect}
                    onMenuOpenedChange={noop}
                />

                <div className="gd-aggregation-menu-item" style={{ margin: "230px auto 0 0", width: 0 }}>
                    <AggregationsSubMenu
                        intl={intlMock}
                        totalType={"max"}
                        toggler={null}
                        rowAttributeHeaders={ATTRIBUTE_HEADERS_3A_LONG_NAME}
                        measureLocalIdentifiers={["1st_measure_local_identifier"]}
                        columnTotals={[COLUMN_TOTAL_1ST_2ND_ATTR_MAX]}
                        onAggregationSelect={onAggregationSelect}
                        isMenuOpened={true}
                    />
                </div>
            </div>,
        );
    });
