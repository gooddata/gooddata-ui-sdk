// (C) 2007-2020 GoodData Corporation
import React, { Component, createRef } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import cx from "classnames";

import uniqueId from "lodash/uniqueId";
import debounce from "lodash/debounce";

import addCSS from "@gooddata/goodstrap/lib/core/addCSS";

import HeaderMenu from "@gooddata/goodstrap/lib/Header/HeaderMenu";
import HeaderAccount from "@gooddata/goodstrap/lib/Header/HeaderAccount";
import HeaderHelp from "@gooddata/goodstrap/lib/Header/HeaderHelp";

import { Button } from "../Button";
import { Overlay } from "../Overlay";

import {
    getItemActiveColor,
    getTextColor,
    getItemHoverColor,
    getSeparatorColor,
    getWorkspacePickerHoverColor,
} from "./colors";
import { removeFromDom } from "../utils/domUtilities";

function getOuterWidth(element: HTMLDivElement) {
    const width = element.offsetWidth;
    const { marginLeft, marginRight } = getComputedStyle(element);
    return width + parseInt(marginLeft, 10) + parseInt(marginRight, 10);
}

function getWidthOfChildren(element: HTMLDivElement, selector = "> *") {
    const SAFETY_PADDING = 10;

    return Array.from(element.querySelectorAll(selector))
        .map(getOuterWidth)
        .reduce((sum, childWidth) => sum + childWidth, SAFETY_PADDING);
}
/**
 * @internal
 */
export interface IHeaderMenuItem {
    key: string;
    href?: string;
    isActive?: boolean;
    className?: string;
    target?: string;
    onClick?: (obj: any) => void;
}
/**
 * @internal
 */
export interface IAppHeaderProps {
    className?: string;

    onLogoClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    onMenuItemClick?: (menuItem: IHeaderMenuItem, e?: React.MouseEvent) => void;

    menuItemsGroups?: IHeaderMenuItem[][];
    accountMenuItems?: IHeaderMenuItem[];
    helpMenuItems?: IHeaderMenuItem[];

    logoUrl?: string;
    logoHref?: string;
    logoTitle?: string;

    documentationUrl?: string;

    workspacePicker: React.ReactNode;

    headerColor?: string;
    headerTextColor?: string;
    activeColor?: string;

    userName: string;

    disableHelpDropdown?: boolean;
    onHelpClick?: (isOpen: boolean) => void;
}
/**
 * @internal
 */
export interface IAppHeaderState {
    childrenWidth: number;
    guid: string;
    isOverlayMenuOpen: boolean;
    responsiveMode: boolean;
    isHelpMenuOpen: boolean;
}

class AppHeaderCore extends Component<IAppHeaderProps & WrappedComponentProps, IAppHeaderState> {
    public static defaultProps: Partial<IAppHeaderProps> = {
        logoHref: "/",
        accountMenuItems: [],
        helpMenuItems: [],
        menuItemsGroups: [],
    };

    private nodeRef = createRef<HTMLDivElement>();
    private resizeHandler = debounce(() => this.measure(), 100);
    private stylesheet: HTMLStyleElement;

    constructor(props: IAppHeaderProps & WrappedComponentProps) {
        super(props);

        this.state = {
            childrenWidth: 0,
            guid: uniqueId("header-"),
            isOverlayMenuOpen: false,
            responsiveMode: false,
            isHelpMenuOpen: false,
        };
    }

    public render() {
        const { logoUrl, logoTitle, workspacePicker } = this.props;

        this.createStyles();

        const logoLinkClassName = cx({
            "gd-header-logo": true,
            "gd-header-measure": true,
            "gd-header-shrink": this.state.responsiveMode,
        });

        return (
            <div className={this.getClassNames()} ref={this.nodeRef}>
                <a href={this.props.logoHref} onClick={this.props.onLogoClick} className={logoLinkClassName}>
                    <img
                        src={logoUrl}
                        title={logoTitle}
                        onLoad={this.measureChildren}
                        onError={this.measureChildren}
                        alt=""
                    />
                </a>
                {workspacePicker}
                {this.renderNav()}
            </div>
        );
    }

    public componentDidMount() {
        window.addEventListener("resize", this.resizeHandler);
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", this.resizeHandler);
        removeFromDom(this.stylesheet);
    }

    private getClassNames = () => {
        return cx({
            "gd-header": true,
            [this.state.guid]: true,
            [this.props.className]: !!this.props.className,
        });
    };

    private measureChildren = () => {
        const currentDOMNode = this.nodeRef.current;
        const childrenWidth = getWidthOfChildren(currentDOMNode, ".gd-header-measure");

        this.setState(
            {
                childrenWidth,
            },
            this.measure,
        );
    };

    private measure = () => {
        const currentDOMNode = this.nodeRef.current;
        if (!currentDOMNode) {
            // ref is null because 'this.measure()' is called after 100ms 'componentWillUnmount' called,
            // which cleans the nodeRef
            return;
        }

        const currentWidth = currentDOMNode.clientWidth;
        const responsiveMode = currentWidth < this.state.childrenWidth;

        if (this.state.responsiveMode !== responsiveMode) {
            this.setState({
                responsiveMode,
                isOverlayMenuOpen: false,
                isHelpMenuOpen: false,
            });
        }
    };

    private createStyles = () => {
        const { guid } = this.state;
        const { activeColor, headerColor, headerTextColor } = this.props;

        const textColor = getTextColor(headerTextColor, headerColor);
        const itemActiveColor = getItemActiveColor(activeColor, headerColor);
        const itemHoverColor = getItemHoverColor(headerColor, activeColor);
        const separatorColor = getSeparatorColor(headerColor, activeColor);
        const workspacesPickerHoverColor = getWorkspacePickerHoverColor(headerColor);

        const css = [];
        css.push(`.${guid} { color: ${textColor}; background: ${headerColor}}`);
        css.push(`.${guid} .gd-header-menu-section { border-color: ${separatorColor}}`);
        css.push(`.${guid} .gd-header-menu-item:hover { border-color: ${itemHoverColor}}`);
        css.push(
            `.${guid} .gd-header-menu-item.active { border-color: var(--gd-palette-primary-base, ${itemActiveColor})}`,
        );
        css.push(`.${guid} .gd-header-project { border-color: ${separatorColor}}`);
        css.push(
            `.${guid} .gd-header-project:hover { background-color: ${workspacesPickerHoverColor}; color: ${textColor}}`,
        );
        css.push(`.${guid} .hamburger-icon:not(.is-open) i { border-color: ${textColor}}`);
        css.push(`.${guid} .hamburger-icon:not(.is-open):after { border-color: ${textColor}}`);
        css.push(`.${guid} .hamburger-icon:not(.is-open):before { border-color: ${textColor}}`);

        this.stylesheet = addCSS(`header-css-${guid}`, css.join("\n"), true);
    };

    private setOverlayMenu = (isOverlayMenuOpen: boolean) => {
        this.setState({
            isOverlayMenuOpen,
            isHelpMenuOpen: false,
        });
    };

    private setHelpMenu = (isHelpMenuOpen: boolean) => {
        this.setState({
            isHelpMenuOpen,
        });
    };

    private toggleHelpMenu = () => this.setHelpMenu(!this.state.isHelpMenuOpen);

    private handleMenuItemClick = (item: IHeaderMenuItem, event: React.MouseEvent) => {
        if (this.state.isHelpMenuOpen) {
            this.setOverlayMenu(false);
        }
        this.props.onMenuItemClick(item, event);
    };

    private addHelpItemGroup = (itemGroups: IHeaderMenuItem[][]): IHeaderMenuItem[][] => {
        return !this.props.documentationUrl ? itemGroups : [...itemGroups, [this.getHelpMenuLink()]];
    };

    private getHelpMenu = () => [
        [this.getHelpMenuLink("icon-header-help-back"), ...this.props.helpMenuItems],
    ];

    private getHelpMenuLink = (icon = "icon-header-help") => ({
        key: "gs.header.help",
        className: `s-menu-help ${icon}`,
        href: this.state.responsiveMode && this.props.helpMenuItems ? undefined : this.props.documentationUrl,
        onClick: this.state.responsiveMode && this.props.helpMenuItems ? this.toggleHelpMenu : undefined,
    });

    private renderNav = () => {
        return this.state.responsiveMode ? this.renderMobileNav() : this.renderStandardNav();
    };

    private renderMobileNav = () => {
        const iconClasses = cx({
            "hamburger-icon": true,
            "is-open": this.state.isOverlayMenuOpen,
        });

        return [
            <div className="hamburger-wrapper" key="hamburger-wrapper">
                <div
                    className={iconClasses}
                    key="hamburger-icon"
                    onClick={() => {
                        this.setOverlayMenu(!this.state.isOverlayMenuOpen);
                    }}
                >
                    <i />
                </div>
            </div>,
            this.renderOverlayMenu(),
        ];
    };

    private renderOverlayMenu = () => {
        return (
            <Overlay
                key="header-overlay-menu"
                alignPoints={[
                    {
                        align: "tr tr",
                    },
                ]}
                closeOnOutsideClick={this.state.isOverlayMenuOpen}
                isModal={this.state.isOverlayMenuOpen}
                positionType="fixed"
                onClose={() => {
                    this.setOverlayMenu(false);
                }}
            >
                <TransitionGroup>
                    <CSSTransition classNames="gd-header" timeout={300}>
                        {this.renderVerticalMenu()}
                    </CSSTransition>
                </TransitionGroup>
            </Overlay>
        );
    };

    private renderVerticalMenu = () => {
        if (!this.state.isOverlayMenuOpen) {
            return false;
        }

        const menuItemsGroups = !this.state.isHelpMenuOpen
            ? this.addHelpItemGroup(this.props.menuItemsGroups)
            : this.getHelpMenu();

        return (
            <div key="overlay-menu" className="gd-header-menu-vertical-wrapper">
                <div className="gd-header-menu-vertical-header">Menu</div>
                <div className="gd-header-menu-vertical-content">
                    <HeaderMenu
                        onMenuItemClick={this.handleMenuItemClick}
                        sections={menuItemsGroups}
                        className="gd-header-menu-vertical"
                    />
                </div>
                <div className="gd-header-menu-vertical-footer">
                    <div className="gd-header-menu-vertical-bottom-item">
                        <span className="gd-header-username icon-user">{this.props.userName}</span>
                    </div>
                    <div>{this.renderLogoutButton()}</div>
                </div>
            </div>
        );
    };

    private renderLogoutButton = () => {
        const t = this.props.intl.formatMessage;
        const [logoutMenuItem] = this.props.accountMenuItems.filter(
            (item) => item.key === "gs.header.logout",
        );

        return logoutMenuItem ? (
            <Button
                value={t({ id: "gs.header.logout" })}
                className="logout-button"
                onClick={(e: React.MouseEvent) => {
                    this.props.onMenuItemClick(logoutMenuItem, e);
                }}
            />
        ) : (
            false
        );
    };

    private renderStandardNav = () => {
        return (
            <div className="gd-header-stretch gd-header-menu-wrapper">
                <HeaderMenu
                    onMenuItemClick={this.props.onMenuItemClick}
                    sections={this.props.menuItemsGroups}
                    className="gd-header-menu-horizontal"
                />

                {!!this.props.helpMenuItems.length && (
                    <HeaderHelp
                        onMenuItemClick={this.props.onMenuItemClick}
                        className="gd-header-measure"
                        items={this.props.helpMenuItems}
                        disableDropdown={this.props.disableHelpDropdown}
                        onHelpClicked={this.props.onHelpClick}
                    />
                )}

                <HeaderAccount
                    userName={this.props.userName}
                    onMenuItemClick={this.props.onMenuItemClick}
                    className="gd-header-measure"
                    items={this.props.accountMenuItems}
                />
            </div>
        );
    };
}
/**
 * @internal
 */
export const AppHeader = injectIntl<"intl", IAppHeaderProps & WrappedComponentProps>(AppHeaderCore);
