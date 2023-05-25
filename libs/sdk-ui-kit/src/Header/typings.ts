// (C) 2021-2022 GoodData Corporation

import React from "react";
import { ITheme } from "@gooddata/sdk-model";
import { HelpMenuDropdownAlignPoints } from "../typings/positioning.js";

/**
 * @internal
 */
export interface IHeaderMenuItem {
    key: string;
    href?: string;
    isActive?: boolean;
    className?: string;
    target?: string;
    iconName?: string;
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

    badges?: React.ReactNode;

    logoUrl?: string;
    logoHref?: string;
    logoTitle?: string;

    documentationUrl?: string;

    workspacePicker: React.ReactNode;

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
    onUpsellButtonClick?: (e: React.MouseEvent) => void;

    showInviteItem?: boolean;
    onInviteItemClick?: (e: React.MouseEvent) => void;
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

/**
 * @internal
 */
export interface IHeaderAccountProps {
    className?: string;
    items?: IHeaderMenuItem[];
    onMenuItemClick: (menuItem: IHeaderMenuItem, e?: React.MouseEvent) => void;
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
    onMenuItemClick?: (menuItem: IHeaderMenuItem, e?: React.MouseEvent) => void;
    sections?: IHeaderMenuItem[][];
}

/**
 * @internal
 */
export interface IHeaderUpsellButtonProps {
    onUpsellButtonClick?: (e: React.MouseEvent) => void;
}

/**
 * @internal
 */
export interface IHeaderInviteProps {
    textColor?: string;
    onInviteItemClick?: (e: React.MouseEvent) => void;
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
