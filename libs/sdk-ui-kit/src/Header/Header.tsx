// (C) 2007-2025 GoodData Corporation
import { useRef, useState, useEffect, useCallback, MouseEvent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { differenceInMonths, differenceInCalendarDays, format } from "date-fns";
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
import { IAppHeaderProps, IHeaderMenuItem } from "./typings.js";
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

function AppHeaderCore(props: IAppHeaderProps) {
    const intl = useIntl();

    const {
        logoHref = "/",
        helpMenuDropdownAlignPoints = "br tr",
        accountMenuItems = [],
        helpMenuItems = [],
        menuItemsGroups = [],
        search = null,
        notificationsPanel = null,
        workspacePicker,
        isAccessibilityCompliant,
        logoUrl,
        logoTitle,
        className,
        activeColor,
        headerColor,
        headerTextColor,
        documentationUrl,
        expiredDate,
        showUpsellButton,
        onUpsellButtonClick,
        badges,
        showStaticHelpMenu,
        userName,
        onMenuItemClick,
        onLogoClick,
        theme,
        helpRedirectUrl,
        disableHelpDropdown,
        onHelpClick,
        showChatItem,
        onChatItemClick,
        showInviteItem,
        onInviteItemClick,
    } = props;

    const [childrenWidth, setChildrenWidth] = useState(0);
    const [guid] = useState(`header-${uuid()}`);
    const [isOverlayMenuOpen, setIsOverlayMenuOpen] = useState(false);
    const [responsiveMode, setResponsiveMode] = useState(false);
    const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
    const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);

    const nodeRef = useRef<HTMLDivElement>(null);
    const stylesheetRef = useRef<HTMLStyleElement | null>(null);

    const measure = useCallback(() => {
        const currentDOMNode = nodeRef.current;
        if (!currentDOMNode) {
            // ref is null because 'measure()' is called after 100ms 'componentWillUnmount' called,
            // which cleans the nodeRef
            return;
        }

        const currentWidth = currentDOMNode.clientWidth;
        const currentResponsiveMode = currentWidth < childrenWidth;

        if (responsiveMode !== currentResponsiveMode) {
            setResponsiveMode(currentResponsiveMode);
            setIsOverlayMenuOpen(false);
            setIsHelpMenuOpen(false);
            setIsSearchMenuOpen(false);
            setIsNotificationsMenuOpen(false);
        }
    }, [childrenWidth, responsiveMode]);

    const resizeHandler = useCallback(
        debounce(() => measure(), 100),
        [measure],
    );

    const measureChildren = useCallback(() => {
        const currentDOMNode = nodeRef.current;
        const currentChildrenWidth = getWidthOfChildren(currentDOMNode, ".gd-header-measure");

        setChildrenWidth(currentChildrenWidth);
        measure();
    }, [measure]);

    const createStyles = useCallback(() => {
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

        stylesheetRef.current = addCssToStylesheet(`header-css-${guid}`, css.join("\n"), true);
    }, [guid, activeColor, headerColor, headerTextColor]);

    const handleSetOverlayMenu = useCallback((isOpen: boolean) => {
        setIsOverlayMenuOpen(isOpen);
        setIsHelpMenuOpen(false);
        setIsSearchMenuOpen(false);
        setIsNotificationsMenuOpen(false);
    }, []);

    const toggleSearchMenu = useCallback(() => {
        setIsSearchMenuOpen((prev) => !prev);
        setIsHelpMenuOpen(false);
        setIsNotificationsMenuOpen(false);
    }, []);

    const toggleNotificationsMenu = useCallback(() => {
        setIsNotificationsMenuOpen((prev) => !prev);
        setIsHelpMenuOpen(false);
        setIsSearchMenuOpen(false);
    }, []);

    const closeNotificationsMenu = useCallback(() => {
        setIsNotificationsMenuOpen(false);
        setIsHelpMenuOpen(false);
        setIsSearchMenuOpen(false);
        setIsOverlayMenuOpen(false);
    }, []);

    const handleSetHelpMenu = useCallback((isOpen: boolean) => {
        setIsHelpMenuOpen(isOpen);
        setIsSearchMenuOpen(false);
        setIsNotificationsMenuOpen(false);
    }, []);

    const toggleHelpMenu = useCallback(
        () => handleSetHelpMenu(!isHelpMenuOpen),
        [isHelpMenuOpen, handleSetHelpMenu],
    );

    const handleMenuItemClick = useCallback(
        (item: IHeaderMenuItem, event: MouseEvent) => {
            if (isHelpMenuOpen) {
                handleSetOverlayMenu(false);
            }
            onMenuItemClick(item, event);
        },
        [isHelpMenuOpen, handleSetOverlayMenu, onMenuItemClick],
    );

    const addHelpItemGroup = useCallback(
        (itemGroups: IHeaderMenuItem[][]): IHeaderMenuItem[][] => {
            return !documentationUrl ? itemGroups : [...itemGroups, [getHelpMenuLink()]];
        },
        [documentationUrl],
    );

    const addAdditionalItems = useCallback(
        (itemGroups: IHeaderMenuItem[][]): IHeaderMenuItem[][] => {
            const additionalItems = [];
            if (search) {
                additionalItems.push({
                    key: "gs.header.search",
                    className: "gd-icon-header-search",
                    onClick: toggleSearchMenu,
                });
            }

            if (notificationsPanel) {
                additionalItems.push({
                    key: "gs.header.notifications",
                    className: "gd-icon-header-notifications",
                    icon: <Icon.Alert width={16} height={16} />,
                    onClick: toggleNotificationsMenu,
                });
            }

            if (!additionalItems.length) {
                return itemGroups;
            }

            return [...itemGroups, additionalItems];
        },
        [search, notificationsPanel, toggleSearchMenu, toggleNotificationsMenu],
    );

    const getHelpMenu = useCallback(
        () => [[getHelpMenuLink("gd-icon-header-help-back"), ...helpMenuItems]],
        [helpMenuItems],
    );

    const getHelpMenuLink = useCallback(
        (icon = "gd-icon-header-help") => ({
            key: "gs.header.help",
            className: `s-menu-help ${icon}`,
            href: responsiveMode && helpMenuItems ? undefined : documentationUrl,
            onClick: responsiveMode && helpMenuItems ? toggleHelpMenu : undefined,
        }),
        [responsiveMode, helpMenuItems, documentationUrl, toggleHelpMenu],
    );

    const getTrialCountdown = useCallback((expiredDate: string) => {
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
    }, []);

    const renderLogo = useCallback(
        (logoLinkClassName: string) => {
            return (
                <a href={logoHref} onClick={onLogoClick} className={logoLinkClassName}>
                    <img
                        src={logoUrl}
                        title={logoTitle}
                        onLoad={measureChildren}
                        onError={measureChildren}
                        alt=""
                    />
                </a>
            );
        },
        [logoHref, onLogoClick, logoUrl, logoTitle, measureChildren],
    );

    const renderAccessibilityLogo = useCallback(
        (logoLinkClassName: string) => {
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
                    href={logoHref}
                    onClick={onLogoClick}
                    className={logoLinkClassName}
                >
                    <img
                        src={logoUrl}
                        title={logoTitle}
                        onLoad={measureChildren}
                        onError={measureChildren}
                        alt={imageAltAccessibilityText}
                    />
                </a>
            );
        },
        [logoHref, onLogoClick, logoUrl, logoTitle, measureChildren, intl],
    );

    const getClassNames = useCallback(() => {
        return cx({
            "gd-header": true,
            [guid]: true,
            [className]: !!className,
        });
    }, [guid, className]);

    const renderSearchMenu = useCallback(() => {
        return (
            <div className="gd-header-menu-search">
                <Typography tagName="h3" className="gd-header-menu-search-title">
                    <FormattedMessage id="gs.header.search" />
                </Typography>
                <HeaderSearchProvider isOpen={isSearchMenuOpen} toggleOpen={toggleSearchMenu}>
                    {search}
                </HeaderSearchProvider>
            </div>
        );
    }, [isSearchMenuOpen, toggleSearchMenu, search]);

    const renderNotificationsOverlay = useCallback(() => {
        if (!notificationsPanel) {
            return null;
        }
        return (
            <div className="gd-header-menu-notifications">
                <Typography tagName="h3" className="gd-header-menu-notifications-title">
                    <FormattedMessage id="gs.header.notifications" />
                </Typography>
                {notificationsPanel({
                    isMobile: true,
                    closeNotificationsOverlay: closeNotificationsMenu,
                })}
            </div>
        );
    }, [notificationsPanel, closeNotificationsMenu]);

    const renderTrialItems = useCallback(() => {
        if (expiredDate || showUpsellButton) {
            return (
                <div className="gd-header-menu-trial gd-header-measure">
                    {expiredDate ? (
                        <div className="gd-header-expiration-date">{getTrialCountdown(expiredDate)}</div>
                    ) : null}

                    {showUpsellButton ? (
                        <HeaderUpsellButton onUpsellButtonClick={onUpsellButtonClick} />
                    ) : null}
                </div>
            );
        }
        return null;
    }, [expiredDate, showUpsellButton, getTrialCountdown, onUpsellButtonClick]);

    const renderLogoutButton = useCallback(() => {
        const [logoutMenuItem] = accountMenuItems.filter((item) => item.key === "gs.header.logout");

        return logoutMenuItem ? (
            <button
                className="logout-button gd-button s-logout"
                onClick={(e: MouseEvent) => {
                    onMenuItemClick(logoutMenuItem, e);
                }}
            >
                <Icon.Logout className="gd-icon-logout" color={theme?.palette?.complementary?.c0} />
                <span className="gd-button-text">
                    <FormattedMessage id="gs.header.logout" />
                </span>
            </button>
        ) : (
            false
        );
    }, [accountMenuItems, onMenuItemClick, theme?.palette?.complementary?.c0]);

    const renderVerticalMenu = useCallback(() => {
        const menuItemsGroups = !isHelpMenuOpen
            ? showStaticHelpMenu
                ? [[getHelpMenuLink()]]
                : addHelpItemGroup(addAdditionalItems(props.menuItemsGroups))
            : getHelpMenu();

        return (
            <div key="overlay-menu" className="gd-header-menu-vertical-wrapper">
                <div className="gd-header-menu-vertical-header">Menu</div>
                <div className="gd-header-menu-vertical-content">
                    <HeaderMenu
                        onMenuItemClick={handleMenuItemClick}
                        sections={menuItemsGroups}
                        className="gd-header-menu-vertical"
                    />
                    {renderTrialItems()}
                </div>
                <div className="gd-header-menu-vertical-footer">
                    {!!badges && <div className="gd-header-vertical-badges">{badges}</div>}
                    <div className="gd-header-menu-vertical-bottom-item">
                        <span className="gd-header-username gd-icon-user">{userName}</span>
                    </div>
                    <div>{renderLogoutButton()}</div>
                </div>
            </div>
        );
    }, [
        isHelpMenuOpen,
        showStaticHelpMenu,
        getHelpMenuLink,
        addHelpItemGroup,
        addAdditionalItems,
        props.menuItemsGroups,
        getHelpMenu,
        handleMenuItemClick,
        renderTrialItems,
        badges,
        userName,
        renderLogoutButton,
    ]);

    const renderOverlayMenu = useCallback(() => {
        let content = renderVerticalMenu();
        if (isSearchMenuOpen) {
            content = renderSearchMenu();
        }
        if (isNotificationsMenuOpen) {
            content = renderNotificationsOverlay();
        }

        return (
            <Overlay
                key="header-overlay-menu"
                alignPoints={[
                    {
                        align: isSearchMenuOpen || isNotificationsMenuOpen ? "tl tl" : "tr tr",
                    },
                ]}
                closeOnOutsideClick={isOverlayMenuOpen}
                isModal={isOverlayMenuOpen}
                positionType="fixed"
                onClose={() => {
                    handleSetOverlayMenu(false);
                }}
            >
                {content}
            </Overlay>
        );
    }, [
        renderVerticalMenu,
        isSearchMenuOpen,
        renderSearchMenu,
        isNotificationsMenuOpen,
        renderNotificationsOverlay,
        isOverlayMenuOpen,
        handleSetOverlayMenu,
    ]);

    const renderMobileNav = useCallback(() => {
        const iconClasses = cx({
            "hamburger-icon": true,
            "is-open": isOverlayMenuOpen,
            "search-open": isSearchMenuOpen,
            "notifications-open": isNotificationsMenuOpen,
        });

        return (
            <>
                <div className="hamburger-wrapper" key="hamburger-wrapper">
                    <div
                        className={iconClasses}
                        key="hamburger-icon"
                        onClick={() => {
                            handleSetOverlayMenu(!isOverlayMenuOpen);
                        }}
                    >
                        <i />
                    </div>
                </div>
                {isOverlayMenuOpen ? renderOverlayMenu() : null}
            </>
        );
    }, [
        isOverlayMenuOpen,
        isSearchMenuOpen,
        isNotificationsMenuOpen,
        handleSetOverlayMenu,
        renderOverlayMenu,
    ]);

    const renderStandardNav = useCallback(() => {
        const textColor = getTextColor(headerTextColor, headerColor);

        return (
            <div className="gd-header-stretch gd-header-menu-wrapper">
                <HeaderMenu
                    onMenuItemClick={onMenuItemClick}
                    sections={menuItemsGroups}
                    className="gd-header-menu-horizontal"
                />

                {renderTrialItems()}

                {showChatItem ? (
                    <HeaderChatButton
                        title={intl.formatMessage({ id: "gs.header.ai" })}
                        color={theme?.palette?.primary?.base}
                        onClick={onChatItemClick}
                    />
                ) : null}

                {notificationsPanel
                    ? notificationsPanel({
                          isMobile: false,
                          closeNotificationsOverlay: closeNotificationsMenu,
                      })
                    : null}

                {search ? (
                    <HeaderSearchProvider isOpen={isSearchMenuOpen} toggleOpen={toggleSearchMenu}>
                        <HeaderSearchButton title={intl.formatMessage({ id: "gs.header.search" })}>
                            {search}
                        </HeaderSearchButton>
                    </HeaderSearchProvider>
                ) : null}

                {helpMenuItems.length ? (
                    <HeaderHelp
                        onMenuItemClick={onMenuItemClick}
                        className="gd-header-measure"
                        helpMenuDropdownAlignPoints={helpMenuDropdownAlignPoints}
                        items={helpMenuItems}
                        disableDropdown={disableHelpDropdown}
                        onHelpClicked={onHelpClick}
                        helpRedirectUrl={helpRedirectUrl}
                    />
                ) : null}

                {showInviteItem ? (
                    <HeaderInvite onInviteItemClick={onInviteItemClick} textColor={textColor} />
                ) : null}

                <HeaderAccount
                    userName={userName}
                    onMenuItemClick={onMenuItemClick}
                    className="gd-header-measure"
                    items={accountMenuItems}
                />
                {badges ? <div className="gd-header-badges gd-header-measure">{badges}</div> : null}
            </div>
        );
    }, [
        headerTextColor,
        headerColor,
        onMenuItemClick,
        menuItemsGroups,
        renderTrialItems,
        showChatItem,
        intl,
        theme?.palette?.primary?.base,
        onChatItemClick,
        notificationsPanel,
        closeNotificationsMenu,
        search,
        isSearchMenuOpen,
        toggleSearchMenu,
        helpMenuItems,
        helpMenuDropdownAlignPoints,
        disableHelpDropdown,
        onHelpClick,
        helpRedirectUrl,
        showInviteItem,
        onInviteItemClick,
        userName,
        accountMenuItems,
        badges,
    ]);

    const renderNav = useCallback(() => {
        return responsiveMode ? renderMobileNav() : renderStandardNav();
    }, [responsiveMode, renderMobileNav, renderStandardNav]);

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);
        return () => {
            window.removeEventListener("resize", resizeHandler);
            if (stylesheetRef.current) {
                removeFromDom(stylesheetRef.current);
            }
        };
    }, [resizeHandler]);

    createStyles();

    const logoLinkClassName = cx({
        "gd-header-logo": true,
        "gd-header-measure": true,
        "gd-header-shrink": responsiveMode,
    });

    const applicationHeaderAccessibilityLabel = intl.formatMessage({
        id: "gs.header.accessibility.label",
    });

    return (
        <header aria-label={applicationHeaderAccessibilityLabel} className={getClassNames()} ref={nodeRef}>
            {isAccessibilityCompliant
                ? renderAccessibilityLogo(logoLinkClassName)
                : renderLogo(logoLinkClassName)}

            {workspacePicker}
            {renderNav()}
        </header>
    );
}

/**
 * @internal
 */
export const AppHeader = withTheme(AppHeaderCore);
