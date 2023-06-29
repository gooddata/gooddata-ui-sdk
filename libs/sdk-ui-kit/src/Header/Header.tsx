// (C) 2007-2022 GoodData Corporation
import React, { Component, createRef } from "react";
import { WrappedComponentProps, injectIntl, FormattedMessage } from "react-intl";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import cx from "classnames";
import differenceInMonths from "date-fns/differenceInMonths/index.js";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays/index.js";
import format from "date-fns/format/index.js";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { v4 as uuid } from "uuid";
import debounce from "lodash/debounce.js";

import { Overlay } from "../Overlay/index.js";
import { removeFromDom } from "../utils/domUtilities.js";
import { Icon } from "../Icon/index.js";

import {
    getItemActiveColor,
    getTextColor,
    getItemHoverColor,
    getSeparatorColor,
    getWorkspacePickerHoverColor,
} from "./colors.js";
import { addCssToStylesheet } from "./addCssToStylesheet.js";
import { IAppHeaderProps, IAppHeaderState, IHeaderMenuItem } from "./typings.js";
import { HeaderHelp } from "./HeaderHelp.js";
import { HeaderAccount } from "./HeaderAccount.js";
import { HeaderMenu } from "./HeaderMenu.js";
import { HeaderUpsellButton } from "./HeaderUpsellButton.js";
import { HeaderInvite } from "./HeaderInvite.js";

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

class AppHeaderCore extends Component<IAppHeaderProps & WrappedComponentProps, IAppHeaderState> {
    public static defaultProps: Pick<
        IAppHeaderProps,
        "logoHref" | "accountMenuItems" | "helpMenuItems" | "menuItemsGroups" | "helpMenuDropdownAlignPoints"
    > = {
        logoHref: "/",
        helpMenuDropdownAlignPoints: "br tr",
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
            guid: `header-${uuid()}`,
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

        this.stylesheet = addCssToStylesheet(`header-css-${guid}`, css.join("\n"), true);
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
        [this.getHelpMenuLink("gd-icon-header-help-back"), ...this.props.helpMenuItems],
    ];

    private getHelpMenuLink = (icon = "gd-icon-header-help") => ({
        key: "gs.header.help",
        className: `s-menu-help ${icon}`,
        href: this.state.responsiveMode && this.props.helpMenuItems ? undefined : this.props.documentationUrl,
        onClick: this.state.responsiveMode && this.props.helpMenuItems ? this.toggleHelpMenu : undefined,
    });

    private getTrialCountdown = (expiredDate: string) => {
        // expiredDate is the last day that user can use the service
        const trialDaysLeft = differenceInCalendarDays(new Date(expiredDate), new Date()) + 1;
        if (trialDaysLeft === 1) {
            return <FormattedMessage id="gs.header.countdown.lastDay" />;
        }
        if (trialDaysLeft === 30) {
            return <FormattedMessage id="gs.header.countdown.oneMonthLeft" />;
        }
        if (trialDaysLeft > 1 && trialDaysLeft < 30) {
            return (
                <FormattedMessage
                    id="gs.header.countdown.numberOfDaysLeft"
                    values={{ number: trialDaysLeft }}
                />
            );
        }
        if (trialDaysLeft > 30 && trialDaysLeft <= 91) {
            const currentDateWithoutTime = format(new Date(), "yyyy-MM-dd");
            const trialMonthsLeft = differenceInMonths(
                new Date(expiredDate),
                new Date(currentDateWithoutTime),
            );
            return (
                <FormattedMessage
                    id="gs.header.countdown.numberOfMonthsLeft"
                    values={{ number: trialMonthsLeft + 1 }}
                />
            );
        }
        return "";
    };

    private renderNav = () => {
        return this.state.responsiveMode ? this.renderMobileNav() : this.renderStandardNav();
    };

    private renderMobileNav = () => {
        const iconClasses = cx({
            "hamburger-icon": true,
            "is-open": this.state.isOverlayMenuOpen,
        });

        return (
            <>
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
                </div>
                {this.state.isOverlayMenuOpen ? this.renderOverlayMenu() : null}
            </>
        );
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

    private renderTrialItems = () => {
        if (this.props.expiredDate || this.props.showUpsellButton) {
            return (
                <div className="gd-header-menu-trial gd-header-measure">
                    {this.props.expiredDate ? (
                        <div className="gd-header-expiration-date">
                            {this.getTrialCountdown(this.props.expiredDate)}
                        </div>
                    ) : null}

                    {this.props.showUpsellButton ? (
                        <HeaderUpsellButton onUpsellButtonClick={this.props.onUpsellButtonClick} />
                    ) : null}
                </div>
            );
        }
        return null;
    };

    private renderVerticalMenu = () => {
        const { badges } = this.props;

        const menuItemsGroups = !this.state.isHelpMenuOpen
            ? this.props.showStaticHelpMenu
                ? [[this.getHelpMenuLink()]]
                : this.addHelpItemGroup(this.props.menuItemsGroups)
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
                    {this.renderTrialItems()}
                </div>
                <div className="gd-header-menu-vertical-footer">
                    {!!badges && <div className="gd-header-vertical-badges">{badges}</div>}
                    <div className="gd-header-menu-vertical-bottom-item">
                        <span className="gd-header-username gd-icon-user">{this.props.userName}</span>
                    </div>
                    <div>{this.renderLogoutButton()}</div>
                </div>
            </div>
        );
    };

    private renderLogoutButton = () => {
        const [logoutMenuItem] = this.props.accountMenuItems.filter(
            (item) => item.key === "gs.header.logout",
        );

        return logoutMenuItem ? (
            <button
                className="logout-button gd-button s-logout"
                onClick={(e: React.MouseEvent) => {
                    this.props.onMenuItemClick(logoutMenuItem, e);
                }}
            >
                <Icon.Logout
                    className="gd-icon-logout"
                    color={this.props.theme?.palette?.complementary?.c0}
                />
                <span className="gd-button-text">
                    <FormattedMessage id="gs.header.logout" />
                </span>
            </button>
        ) : (
            false
        );
    };

    private renderStandardNav = () => {
        const { badges, helpMenuDropdownAlignPoints, headerTextColor, headerColor } = this.props;
        const textColor = getTextColor(headerTextColor, headerColor);

        return (
            <div className="gd-header-stretch gd-header-menu-wrapper">
                <HeaderMenu
                    onMenuItemClick={this.props.onMenuItemClick}
                    sections={this.props.menuItemsGroups}
                    className="gd-header-menu-horizontal"
                />

                {this.renderTrialItems()}

                {this.props.helpMenuItems.length ? (
                    <HeaderHelp
                        onMenuItemClick={this.props.onMenuItemClick}
                        className="gd-header-measure"
                        helpMenuDropdownAlignPoints={helpMenuDropdownAlignPoints}
                        items={this.props.helpMenuItems}
                        disableDropdown={this.props.disableHelpDropdown}
                        onHelpClicked={this.props.onHelpClick}
                        helpRedirectUrl={this.props.helpRedirectUrl}
                    />
                ) : null}

                {this.props.showInviteItem ? (
                    <HeaderInvite onInviteItemClick={this.props.onInviteItemClick} textColor={textColor} />
                ) : null}

                <HeaderAccount
                    userName={this.props.userName}
                    onMenuItemClick={this.props.onMenuItemClick}
                    className="gd-header-measure"
                    items={this.props.accountMenuItems}
                />
                {badges ? <div className="gd-header-badges gd-header-measure">{badges}</div> : null}
            </div>
        );
    };
}

/**
 * @internal
 */
export const AppHeader = withTheme(
    injectIntl<"intl", IAppHeaderProps & WrappedComponentProps>(AppHeaderCore),
);
