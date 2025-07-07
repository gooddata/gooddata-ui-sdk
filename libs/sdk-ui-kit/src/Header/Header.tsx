// (C) 2007-2025 GoodData Corporation
import React, { Component, createRef } from "react";
import { WrappedComponentProps, injectIntl, FormattedMessage } from "react-intl";
import cx from "classnames";
import { differenceInMonths } from "date-fns/differenceInMonths";
import { differenceInCalendarDays } from "date-fns/differenceInCalendarDays";
import { format } from "date-fns/format";
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
import { Typography } from "../Typography/index.js";
import { HeaderSearchButton } from "./HeaderSearchButton.js";
import { HeaderSearchProvider } from "./headerSearchContext.js";
import { HeaderChatButton } from "./HeaderChatButton.js";

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
        | "logoHref"
        | "accountMenuItems"
        | "helpMenuItems"
        | "menuItemsGroups"
        | "helpMenuDropdownAlignPoints"
        | "search"
        | "notificationsPanel"
    > = {
        logoHref: "/",
        helpMenuDropdownAlignPoints: "br tr",
        accountMenuItems: [],
        helpMenuItems: [],
        menuItemsGroups: [],
        search: null,
        notificationsPanel: null,
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
            isSearchMenuOpen: false,
            isNotificationsMenuOpen: false,
        };
    }

    public render() {
        const { workspacePicker, isAccessibilityCompliant, intl } = this.props;

        this.createStyles();

        const logoLinkClassName = cx({
            "gd-header-logo": true,
            "gd-header-measure": true,
            "gd-header-shrink": this.state.responsiveMode,
        });

        const applicationHeaderAccessibilityLabel = intl.formatMessage({
            id: "gs.header.accessibility.label",
        });

        return (
            <header
                aria-label={applicationHeaderAccessibilityLabel}
                className={this.getClassNames()}
                ref={this.nodeRef}
            >
                {isAccessibilityCompliant
                    ? this.renderAccessibilityLogo(logoLinkClassName)
                    : this.renderLogo(logoLinkClassName)}

                {workspacePicker}
                {this.renderNav()}
            </header>
        );
    }

    public componentDidMount() {
        window.addEventListener("resize", this.resizeHandler);
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", this.resizeHandler);
        removeFromDom(this.stylesheet);
    }

    private renderLogo(logoLinkClassName: string) {
        const { logoUrl, logoTitle } = this.props;
        return (
            <a href={this.props.logoHref} onClick={this.props.onLogoClick} className={logoLinkClassName}>
                <img
                    src={logoUrl}
                    title={logoTitle}
                    onLoad={this.measureChildren}
                    onError={this.measureChildren}
                    alt=""
                />
            </a>
        );
    }

    private renderAccessibilityLogo(logoLinkClassName: string) {
        const { logoUrl, logoTitle, intl } = this.props;

        const logoHrefAccesibilityText = intl.formatMessage({
            id: "gs.header.href.accessibility",
        });
        const imageAltAccessibilityText = intl.formatMessage({
            id: "gs.header.logo.title.accessibility",
        });

        return (
            <a
                aria-label={logoHrefAccesibilityText}
                title={logoHrefAccesibilityText}
                href={this.props.logoHref}
                onClick={this.props.onLogoClick}
                className={logoLinkClassName}
            >
                <img
                    src={logoUrl}
                    title={logoTitle}
                    onLoad={this.measureChildren}
                    onError={this.measureChildren}
                    alt={imageAltAccessibilityText}
                />
            </a>
        );
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
                isSearchMenuOpen: false,
                isNotificationsMenuOpen: false,
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
            `.${guid} .gd-header-menu-item.active { border-color: var(--gd-palette-primary-base-from-theme, ${itemActiveColor})}`,
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
            isSearchMenuOpen: false,
            isNotificationsMenuOpen: false,
        });
    };

    private toggleSearchMenu = () => {
        this.setState(({ isSearchMenuOpen }) => ({
            isSearchMenuOpen: !isSearchMenuOpen,
            isHelpMenuOpen: false,
            isNotificationsMenuOpen: false,
        }));
    };

    private toggleNotificationsMenu = () => {
        this.setState(({ isNotificationsMenuOpen }) => ({
            isNotificationsMenuOpen: !isNotificationsMenuOpen,
            isHelpMenuOpen: false,
            isSearchMenuOpen: false,
        }));
    };

    private closeNotificationsMenu = () => {
        this.setState(() => ({
            isNotificationsMenuOpen: false,
            isHelpMenuOpen: false,
            isSearchMenuOpen: false,
            isOverlayMenuOpen: false,
        }));
    };

    private setHelpMenu = (isHelpMenuOpen: boolean) => {
        this.setState({
            isHelpMenuOpen,
            isSearchMenuOpen: false,
            isNotificationsMenuOpen: false,
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

    private addAdditionalItems = (itemGroups: IHeaderMenuItem[][]): IHeaderMenuItem[][] => {
        const additionalItems = [];
        if (this.props.search) {
            additionalItems.push({
                key: "gs.header.search",
                className: "gd-icon-header-search",
                onClick: this.toggleSearchMenu,
            });
        }

        if (this.props.notificationsPanel) {
            additionalItems.push({
                key: "gs.header.notifications",
                className: "gd-icon-header-notifications",
                icon: <Icon.Alert width={16} height={16} />,
                onClick: this.toggleNotificationsMenu,
            });
        }

        if (!additionalItems.length) {
            return itemGroups;
        }

        return [...itemGroups, additionalItems];
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
            "search-open": this.state.isSearchMenuOpen,
            "notifications-open": this.state.isNotificationsMenuOpen,
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
        let content = this.renderVerticalMenu();
        if (this.state.isSearchMenuOpen) {
            content = this.renderSearchMenu();
        }
        if (this.state.isNotificationsMenuOpen) {
            content = this.renderNotificationsOverlay();
        }

        return (
            <Overlay
                key="header-overlay-menu"
                alignPoints={[
                    {
                        align:
                            this.state.isSearchMenuOpen || this.state.isNotificationsMenuOpen
                                ? "tl tl"
                                : "tr tr",
                    },
                ]}
                closeOnOutsideClick={this.state.isOverlayMenuOpen}
                isModal={this.state.isOverlayMenuOpen}
                positionType="fixed"
                onClose={() => {
                    this.setOverlayMenu(false);
                }}
            >
                {content}
            </Overlay>
        );
    };

    private renderSearchMenu = () => {
        return (
            <div className="gd-header-menu-search">
                <Typography tagName="h3" className="gd-header-menu-search-title">
                    <FormattedMessage id="gs.header.search" />
                </Typography>
                <HeaderSearchProvider isOpen={this.state.isSearchMenuOpen} toggleOpen={this.toggleSearchMenu}>
                    {this.props.search}
                </HeaderSearchProvider>
            </div>
        );
    };

    private renderNotificationsOverlay = () => {
        if (!this.props.notificationsPanel) {
            return null;
        }
        return (
            <div className="gd-header-menu-notifications">
                <Typography tagName="h3" className="gd-header-menu-notifications-title">
                    <FormattedMessage id="gs.header.notifications" />
                </Typography>
                {this.props.notificationsPanel({
                    isMobile: true,
                    closeNotificationsOverlay: this.closeNotificationsMenu,
                })}
            </div>
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
                : this.addHelpItemGroup(this.addAdditionalItems(this.props.menuItemsGroups))
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

                {this.props.showChatItem ? (
                    <HeaderChatButton
                        title={this.props.intl.formatMessage({ id: "gs.header.ai" })}
                        color={this.props.theme?.palette?.primary?.base}
                        onClick={this.props.onChatItemClick}
                    />
                ) : null}

                {this.props.notificationsPanel
                    ? this.props.notificationsPanel({
                          isMobile: false,
                          closeNotificationsOverlay: this.closeNotificationsMenu,
                      })
                    : null}

                {this.props.search ? (
                    <HeaderSearchProvider
                        isOpen={this.state.isSearchMenuOpen}
                        toggleOpen={this.toggleSearchMenu}
                    >
                        <HeaderSearchButton title={this.props.intl.formatMessage({ id: "gs.header.search" })}>
                            {this.props.search}
                        </HeaderSearchButton>
                    </HeaderSearchProvider>
                ) : null}

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
