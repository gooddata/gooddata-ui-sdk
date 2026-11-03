// (C) 2026 GoodData Corporation

import { type MouseEvent } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { UiIcon } from "../@ui/UiIcon/UiIcon.js";

import { LANGUAGE_MENU_ITEM_ID } from "./generateHeaderAccountMenuItems.js";
import { type IHeaderMenuItem } from "./typings.js";

export interface IHeaderLanguageButtonProps {
    items: IHeaderMenuItem[];
    onMenuItemClick: (menuItem: IHeaderMenuItem, e: MouseEvent) => void;
}

/**
 * The language item of the mobile menu, if the account menu items have it.
 */
export function HeaderLanguageButton({ items, onMenuItemClick }: IHeaderLanguageButtonProps) {
    const intl = useIntl();
    const languageMenuItem = items.find((item) => item.key === LANGUAGE_MENU_ITEM_ID);

    if (!languageMenuItem) {
        return null;
    }

    return (
        <button
            type="button"
            className="gd-header-menu-vertical-bottom-item gd-header-language-button s-language"
            aria-label={
                languageMenuItem.value
                    ? `${intl.formatMessage({ id: languageMenuItem.key })}, ${languageMenuItem.value}`
                    : undefined
            }
            aria-haspopup="dialog"
            onClick={(e) => onMenuItemClick(languageMenuItem, e)}
        >
            <UiIcon type="globe" size={20} color="currentColor" />
            <span className="gd-header-language-label">
                <FormattedMessage id={languageMenuItem.key} />
            </span>
            <UiIcon type="navigateRight" size={12} color="currentColor" />
        </button>
    );
}
