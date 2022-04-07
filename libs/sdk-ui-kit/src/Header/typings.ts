// (C) 2021-2022 GoodData Corporation

import React from "react";
import { ITheme } from "@gooddata/sdk-model";

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

    disableHelpDropdown?: boolean;
    onHelpClick?: (isOpen: boolean) => void;

    helpRedirectUrl?: string;
    theme?: ITheme;

    showUpsellButton?: boolean;
    onUpsellButtonClick?: (e: React.MouseEvent) => void;
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
