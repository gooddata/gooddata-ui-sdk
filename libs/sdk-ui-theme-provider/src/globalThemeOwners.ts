// (C) 2026 GoodData Corporation

import { type ITheme } from "@gooddata/sdk-model";

import { clearCssProperties, setCssProperties } from "./cssProperties.js";
import { isDarkTheme } from "./ThemeProvider/isDarkTheme.js";

type ResolvedGlobalThemeState = "cleared" | { theme: ITheme };

export interface IGlobalThemeOwner {
    state: "pending" | ResolvedGlobalThemeState;
    removeGlobalStylesWhenLast: boolean;
    inheritsRemoveGlobalStylesWhenLast: boolean;
    parent: IGlobalThemeOwner | null;
}

type ResolvedGlobalThemeOwner = IGlobalThemeOwner & { state: ResolvedGlobalThemeState };

// Registered global ThemeProviders in effect order. Effects run child-first, so a nested provider
// only outranks its parent when it mounts in a later commit (e.g. an embedded app).
const owners: IGlobalThemeOwner[] = [];

function isResolved(owner: IGlobalThemeOwner): owner is ResolvedGlobalThemeOwner {
    return owner.state !== "pending";
}

function getEffectiveOwner(): ResolvedGlobalThemeOwner | undefined {
    for (let index = owners.length - 1; index >= 0; index--) {
        const owner = owners[index];
        if (isResolved(owner)) {
            return owner;
        }
    }
    return undefined;
}

function paint(state: ResolvedGlobalThemeState): void {
    clearCssProperties();
    if (state !== "cleared") {
        setCssProperties(state.theme, isDarkTheme(state.theme));
    }
}

export function createGlobalThemeOwner(
    removeGlobalStylesWhenLast: boolean,
    parent: IGlobalThemeOwner | null,
): IGlobalThemeOwner {
    return {
        state: "pending",
        removeGlobalStylesWhenLast,
        inheritsRemoveGlobalStylesWhenLast: false,
        parent,
    };
}

export function registerGlobalThemeOwner(owner: IGlobalThemeOwner): void {
    owner.state = "pending";
    owners.push(owner);
}

export function setGlobalThemeOwnerRemovesStylesWhenLast(owner: IGlobalThemeOwner, value: boolean): void {
    owner.removeGlobalStylesWhenLast = value;
}

// Throws when the owner is the one shown and its theme cannot be converted to CSS properties.
export function setGlobalThemeOwnerState(owner: IGlobalThemeOwner, state: ResolvedGlobalThemeState): void {
    if (!owners.includes(owner)) {
        return;
    }
    owner.state = state;
    if (getEffectiveOwner() === owner) {
        paint(state);
    }
}

export function unregisterGlobalThemeOwner(owner: IGlobalThemeOwner): void {
    const index = owners.indexOf(owner);
    if (index === -1) {
        return;
    }
    const wasEffective = getEffectiveOwner() === owner;
    const removesGlobalStylesWhenLast =
        owner.removeGlobalStylesWhenLast || owner.inheritsRemoveGlobalStylesWhenLast;
    owners.splice(index, 1);
    // Parents unmount before their descendants, so a parent's duty to remove the styles passes to its
    // descendant providers that are still mounted.
    if (removesGlobalStylesWhenLast) {
        owners
            .filter((childOwner) => childOwner.parent === owner)
            .forEach((childOwner) => {
                childOwner.inheritsRemoveGlobalStylesWhenLast = true;
            });
    }

    const nextOwner = getEffectiveOwner();
    if (!nextOwner) {
        if (removesGlobalStylesWhenLast) {
            clearCssProperties();
        }
        return;
    }
    if (!wasEffective) {
        return;
    }
    try {
        paint(nextOwner.state);
    } catch (error) {
        console.error("Failed to apply the theme, falling back to the default theme.", error);
        nextOwner.state = "cleared";
        clearCssProperties();
    }
}
