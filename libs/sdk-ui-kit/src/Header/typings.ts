// (C) 2021-2025 GoodData Corporation

import { KeyboardEvent, MouseEvent, ReactNode } from "react";

import { ITheme } from "@gooddata/sdk-model";

import { HelpMenuDropdownAlignPoints } from "../typings/positioning.js";

/**
 * @internal
 */
export interface IHeaderMenuItem {
    key: string; // used both as React key as well as localization message ID
    href?: string;
    isActive?: boolean;
    className?: string;
    target?: string;
    iconName?: string;
    icon?: ReactNode;
    onClick?: (obj: any) => void;
    isActiveByStartWith?: boolean; // if true, item is active when pathname starts with href
}

/**
 * @internal
 */
export interface IAppHeaderProps {
    className?: string;

    onLogoClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
    onMenuItemClick?: (menuItem: IHeaderMenuItem, e?: MouseEvent) => void;

    menuItemsGroups?: IHeaderMenuItem[][];
    accountMenuItems?: IHeaderMenuItem[];
    helpMenuItems?: IHeaderMenuItem[];

    badges?: ReactNode;

    logoUrl?: string;
    logoHref?: string;
    logoTitle?: string;

    organizationName?: string;

    isAccessibilityCompliant?: boolean;

    documentationUrl?: string;

    workspacePicker: ReactNode;

    headerColor?: string;
    headerTextColor?: string;
    activeColor?: string;

    userName: string;

    expiredDate?: string;
    disableHelpDropdown?: boolean;
    onHelpClick?: (isOpen: boolean) => void;
    helpMenuDropdownAlignPoints?: HelpMenuDropdownAlignPoints;
    showStaticHelpMenu?: boolean;

    helpRedirectUrl?: string;
    theme?: ITheme;

    showUpsellButton?: boolean;
    onUpsellButtonClick?: (e: MouseEvent) => void;

    search?: ReactNode;
    notificationsPanel?: (props: { isMobile: boolean; closeNotificationsOverlay: () => void }) => ReactNode;
    showChatItem?: boolean;
    onChatItemClick?: (e: MouseEvent) => void;
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
    isSearchMenuOpen: boolean;
    isNotificationsMenuOpen: boolean;
}

/**
 * @internal
 */
export interface IHeaderAccountProps {
    className?: string;
    items?: IHeaderMenuItem[];
    onMenuItemClick: (menuItem: IHeaderMenuItem, e?: MouseEvent | KeyboardEvent) => void;
    userName?: string;
}

/**
 * @internal
 */
export interface IHeaderAccountState {
    isOpen: boolean;
}

/**
 * @internal
 */
export interface IHeaderMenuProps {
    className?: string;
    onMenuItemClick?: (menuItem: IHeaderMenuItem, e?: MouseEvent) => void;
    sections?: IHeaderMenuItem[][];
}

/**
 * @internal
 */
export interface IHeaderUpsellButtonProps {
    onUpsellButtonClick?: (e: MouseEvent) => void;
}

/**
 * @internal
 */
export type TUTMContent =
    | "main_menu_help_documentation"
    | "main_menu_help_university"
    | "main_menu_help_community"
    | "main_menu_help_support"
    | "main_menu_help_ticket"
    | "main_menu_help_slack";
