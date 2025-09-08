// (C) 2007-2025 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import cx from "classnames";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays/index.js";
import differenceInMonths from "date-fns/differenceInMonths/index.js";
import format from "date-fns/format/index.js";
import debounce from "lodash/debounce.js";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { addCssToStylesheet } from "./addCssToStylesheet.js";
import {
    getItemActiveColor,
    getItemHoverColor,
    getSeparatorColor,
    getTextColor,
    getWorkspacePickerHoverColor,
} from "./colors.js";
import { HeaderAccount } from "./HeaderAccount.js";
import { HeaderChatButton } from "./HeaderChatButton.js";
import { HeaderHelp } from "./HeaderHelp.js";
import { HeaderMenu } from "./HeaderMenu.js";
import { HeaderSearchButton } from "./HeaderSearchButton.js";
import { HeaderSearchProvider } from "./headerSearchContext.js";
import { HeaderUpsellButton } from "./HeaderUpsellButton.js";
import { IAppHeaderProps, IAppHeaderState, IHeaderMenuItem } from "./typings.js";
import { Icon } from "../Icon/index.js";
import { Overlay } from "../Overlay/index.js";
import { Typography } from "../Typography/index.js";
import { removeFromDom } from "../utils/domUtilities.js";

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

function AppHeaderCore(props: IAppHeaderProps & WrappedComponentProps) {
    const {
        logoHref = "/",
        accountMenuItems = [],
        helpMenuItems = [],
        menuItemsGroups = [],
        search = null,
        notificationsPanel = null,
        workspacePicker,
        isAccessibilityCompliant,
        intl,
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
        theme,
        helpMenuDropdownAlignPoints: helpDropdownAlign,
        disableHelpDropdown,
        onHelpClick,
        helpRedirectUrl,
        showChatItem,
        onChatItemClick,
        onLogoClick,
        onMenuItemClick,
    } = props;

    const [state, setState] = useState<IAppHeaderState>({
        childrenWidth: 0,
        guid: `header-${uuid()}`,
        isOverlayMenuOpen: false,
        responsiveMode: false,
        isHelpMenuOpen: false,
        isSearchMenuOpen: false,
        isNotificationsMenuOpen: false,
    });

    const nodeRef = useRef<HTMLDivElement>(null);
    const stylesheetRef = useRef<HTMLStyleElement | null>(null);

    const measureChildren = useCallback(() => {
        const currentDOMNode = nodeRef.current;
        const childrenWidth = getWidthOfChildren(currentDOMNode, ".gd-header-measure");

        setState((prevState) => ({
            ...prevState,
            childrenWidth,
        }));
    }, []);

    const measure = useCallback(() => {
        const currentDOMNode = nodeRef.current;
        if (!currentDOMNode) {
            // ref is null because 'this.measure()' is called after 100ms 'componentWillUnmount' called,
            // which cleans the nodeRef
            return;
        }

        const currentWidth = currentDOMNode.clientWidth;
        const responsiveMode = currentWidth < state.childrenWidth;

        if (state.responsiveMode !== responsiveMode) {
            setState((prevState) => ({
                ...prevState,
                responsiveMode,
                isOverlayMenuOpen: false,
                isHelpMenuOpen: false,
                isSearchMenuOpen: false,
                isNotificationsMenuOpen: false,
            }));
        }
    }, [state.childrenWidth, state.responsiveMode]);

    const resizeHandler = useMemo(() => debounce(() => measure(), 100), [measure]);

    useEffect(() => {
        measure();
    }, [state.childrenWidth, measure]);

    useEffect(() => {
        window.addEventListener("resize", resizeHandler);

        return () => {
            window.removeEventListener("resize", resizeHandler);
            if (stylesheetRef.current) {
                removeFromDom(stylesheetRef.current);
            }
        };
    }, [resizeHandler]);

    const createStyles = useCallback(() => {
        const { guid } = state;

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
    }, [state, activeColor, headerColor, headerTextColor]);

    const setOverlayMenu = useCallback((isOverlayMenuOpen: boolean) => {
        setState((prevState) => ({
            ...prevState,
            isOverlayMenuOpen,
            isHelpMenuOpen: false,
            isSearchMenuOpen: false,
            isNotificationsMenuOpen: false,
        }));
    }, []);

    const toggleSearchMenu = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            isSearchMenuOpen: !prevState.isSearchMenuOpen,
            isHelpMenuOpen: false,
            isNotificationsMenuOpen: false,
        }));
    }, []);

    const toggleNotificationsMenu = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            isNotificationsMenuOpen: !prevState.isNotificationsMenuOpen,
            isHelpMenuOpen: false,
            isSearchMenuOpen: false,
        }));
    }, []);

    const closeNotificationsMenu = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            isNotificationsMenuOpen: false,
            isHelpMenuOpen: false,
            isSearchMenuOpen: false,
            isOverlayMenuOpen: false,
        }));
    }, []);

    const setHelpMenu = useCallback((isHelpMenuOpen: boolean) => {
        setState((prevState) => ({
            ...prevState,
            isHelpMenuOpen,
            isSearchMenuOpen: false,
            isNotificationsMenuOpen: false,
        }));
    }, []);

    const toggleHelpMenu = useCallback(() => setHelpMenu(!state.isHelpMenuOpen), [setHelpMenu, state]);

    const handleMenuItemClick = useCallback(
        (item: IHeaderMenuItem, event: React.MouseEvent) => {
            if (state.isHelpMenuOpen) {
                setOverlayMenu(false);
            }
            onMenuItemClick(item, event);
        },
        [state, setOverlayMenu, onMenuItemClick],
    );

    const getHelpMenuLink = useCallback(
        (icon = "gd-icon-header-help") => ({
            key: "gs.header.help",
            className: `s-menu-help ${icon}`,
            href: state.responsiveMode && helpMenuItems ? undefined : documentationUrl,
            onClick: state.responsiveMode && helpMenuItems ? toggleHelpMenu : undefined,
        }),
        [state, helpMenuItems, documentationUrl, toggleHelpMenu],
    );

    const addHelpItemGroup = useCallback(
        (itemGroups: IHeaderMenuItem[][]): IHeaderMenuItem[][] => {
            return documentationUrl ? [...itemGroups, [getHelpMenuLink()]] : itemGroups;
        },
        [documentationUrl, getHelpMenuLink],
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
                const AlertIcon = Icon["Alert"];

                additionalItems.push({
                    key: "gs.header.notifications",
                    className: "gd-icon-header-notifications",
                    icon: <AlertIcon width={16} height={16} />,
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
        [getHelpMenuLink, helpMenuItems],
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

    const getClassNames = useCallback(() => {
        return cx({
            "gd-header": true,
            [state.guid]: true,
            [className]: !!className,
        });
    }, [state.guid, className]);

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
        [intl, logoHref, onLogoClick, logoUrl, logoTitle, measureChildren],
    );

    const renderSearchMenu = useCallback(() => {
        return (
            <div className="gd-header-menu-search">
                <Typography tagName="h3" className="gd-header-menu-search-title">
                    <FormattedMessage id="gs.header.search" />
                </Typography>
                <HeaderSearchProvider isOpen={state.isSearchMenuOpen} toggleOpen={toggleSearchMenu}>
                    {search}
                </HeaderSearchProvider>
            </div>
        );
    }, [state.isSearchMenuOpen, toggleSearchMenu, search]);

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
        const LogoutIcon = Icon["Logout"];
        return logoutMenuItem ? (
            <button
                className="logout-button gd-button s-logout"
                onClick={(e: React.MouseEvent) => {
                    onMenuItemClick(logoutMenuItem, e);
                }}
            >
                <LogoutIcon className="gd-icon-logout" color={theme?.palette?.complementary?.c0} />
                <span className="gd-button-text">
                    <FormattedMessage id="gs.header.logout" />
                </span>
            </button>
        ) : (
            false
        );
    }, [accountMenuItems, onMenuItemClick, theme?.palette?.complementary?.c0]);

    const renderVerticalMenu = useCallback(() => {
        const menuItemsGroupsToRender = state.isHelpMenuOpen
            ? getHelpMenu()
            : showStaticHelpMenu
              ? [[getHelpMenuLink()]]
              : addHelpItemGroup(addAdditionalItems(menuItemsGroups));

        return (
            <div key="overlay-menu" className="gd-header-menu-vertical-wrapper">
                <div className="gd-header-menu-vertical-header">Menu</div>
                <div className="gd-header-menu-vertical-content">
                    <HeaderMenu
                        onMenuItemClick={handleMenuItemClick}
                        sections={menuItemsGroupsToRender}
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
        state.isHelpMenuOpen,
        showStaticHelpMenu,
        getHelpMenuLink,
        addHelpItemGroup,
        addAdditionalItems,
        menuItemsGroups,
        getHelpMenu,
        handleMenuItemClick,
        renderTrialItems,
        badges,
        userName,
        renderLogoutButton,
    ]);

    const renderOverlayMenu = useCallback(() => {
        let content = renderVerticalMenu();
        if (state.isSearchMenuOpen) {
            content = renderSearchMenu();
        }
        if (state.isNotificationsMenuOpen) {
            content = renderNotificationsOverlay();
        }

        return (
            <Overlay
                key="header-overlay-menu"
                alignPoints={[
                    {
                        align: state.isSearchMenuOpen || state.isNotificationsMenuOpen ? "tl tl" : "tr tr",
                    },
                ]}
                closeOnOutsideClick={state.isOverlayMenuOpen}
                isModal={state.isOverlayMenuOpen}
                positionType="fixed"
                onClose={() => {
                    setOverlayMenu(false);
                }}
            >
                {content}
            </Overlay>
        );
    }, [
        renderVerticalMenu,
        state.isSearchMenuOpen,
        state.isNotificationsMenuOpen,
        renderSearchMenu,
        renderNotificationsOverlay,
        state.isOverlayMenuOpen,
        setOverlayMenu,
    ]);

    const renderMobileNav = useCallback(() => {
        const iconClasses = cx({
            "hamburger-icon": true,
            "is-open": state.isOverlayMenuOpen,
            "search-open": state.isSearchMenuOpen,
            "notifications-open": state.isNotificationsMenuOpen,
        });

        return (
            <>
                <div className="hamburger-wrapper" key="hamburger-wrapper">
                    <div
                        className={iconClasses}
                        key="hamburger-icon"
                        onClick={() => {
                            setOverlayMenu(!state.isOverlayMenuOpen);
                        }}
                    >
                        <i />
                    </div>
                </div>
                {state.isOverlayMenuOpen ? renderOverlayMenu() : null}
            </>
        );
    }, [
        state.isOverlayMenuOpen,
        state.isSearchMenuOpen,
        state.isNotificationsMenuOpen,
        setOverlayMenu,
        renderOverlayMenu,
    ]);

    const renderStandardNav = useCallback(() => {
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
                    <HeaderSearchProvider isOpen={state.isSearchMenuOpen} toggleOpen={toggleSearchMenu}>
                        <HeaderSearchButton title={intl.formatMessage({ id: "gs.header.search" })}>
                            {search}
                        </HeaderSearchButton>
                    </HeaderSearchProvider>
                ) : null}

                {helpMenuItems.length ? (
                    <HeaderHelp
                        onMenuItemClick={onMenuItemClick}
                        className="gd-header-measure"
                        helpMenuDropdownAlignPoints={helpDropdownAlign}
                        items={helpMenuItems}
                        disableDropdown={disableHelpDropdown}
                        onHelpClicked={onHelpClick}
                        helpRedirectUrl={helpRedirectUrl}
                    />
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
        state.isSearchMenuOpen,
        toggleSearchMenu,
        helpMenuItems,
        helpDropdownAlign,
        disableHelpDropdown,
        onHelpClick,
        helpRedirectUrl,
        userName,
        accountMenuItems,
        badges,
    ]);

    const renderNav = useCallback(() => {
        return state.responsiveMode ? renderMobileNav() : renderStandardNav();
    }, [state.responsiveMode, renderMobileNav, renderStandardNav]);

    useEffect(() => {
        createStyles();
    }, [createStyles]);

    const logoLinkClassName = useMemo(
        () =>
            cx({
                "gd-header-logo": true,
                "gd-header-measure": true,
                "gd-header-shrink": state.responsiveMode,
            }),
        [state.responsiveMode],
    );

    const applicationHeaderAccessibilityLabel = useMemo(
        () =>
            intl.formatMessage({
                id: "gs.header.accessibility.label",
            }),
        [intl],
    );

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
export const AppHeader = withTheme(
    injectIntl<"intl", IAppHeaderProps & WrappedComponentProps>(AppHeaderCore),
);
