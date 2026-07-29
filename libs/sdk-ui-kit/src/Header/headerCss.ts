// (C) 2026 GoodData Corporation

import {
    getItemActiveColor,
    getItemHoverColor,
    getSeparatorColor,
    getTextColor,
    getWorkspacePickerHoverColor,
} from "./colors.js";

/**
 * Builds the per-instance stylesheet that paints the app header with the branding/theme colors.
 *
 * The rules are scoped by `guid`, a class the header root carries next to the static `gd-header`
 * one. The root rule is deliberately written as `.gd-header.<guid>` rather than `.<guid>`: the
 * latter has the same specificity as `.gd-header { color: #fff; background: #000 }` from
 * `header.scss` and applies to the very same element, so the cascade would be decided by document
 * order alone. Any stylesheet appended to `<head>` after this one — module-federated apps re-ship
 * `header.scss` when the host lazy-loads them — would then revert a themed header to the default
 * black/white. The descendant rules below already outrank their `header.scss` counterparts on
 * specificity, so they need no such qualification.
 *
 * @internal
 */
export function createHeaderCssRules(
    guid: string,
    headerColor = "",
    headerTextColor = "",
    activeColor = "",
): string {
    const textColor = getTextColor(headerTextColor, headerColor);
    const itemActiveColor = getItemActiveColor(activeColor, headerColor);
    const itemHoverColor = getItemHoverColor(headerColor, activeColor);
    const separatorColor = getSeparatorColor(headerColor, activeColor);
    const workspacesPickerHoverColor = getWorkspacePickerHoverColor(headerColor);

    return [
        `.gd-header.${guid} { color: ${textColor}; background: ${headerColor}}`,
        `.${guid} .gd-header-menu-section { border-color: ${separatorColor}}`,
        `.${guid} .gd-header-menu-item:hover { border-color: ${itemHoverColor}}`,
        `.${guid} .gd-header-menu-item.active { border-color: var(--gd-palette-primary-base-from-theme, ${itemActiveColor})}`,
        `.${guid} .gd-header-project { border-color: ${separatorColor}}`,
        `.${guid} .gd-header-project:hover { background-color: ${workspacesPickerHoverColor}; color: ${textColor}}`,
        `.${guid} .hamburger-icon:not(.is-open) i { border-color: ${textColor}}`,
        `.${guid} .hamburger-icon:not(.is-open):after { border-color: ${textColor}}`,
        `.${guid} .hamburger-icon:not(.is-open):before { border-color: ${textColor}}`,
    ].join("\n");
}
