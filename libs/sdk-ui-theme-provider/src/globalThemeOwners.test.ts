// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { type ITheme } from "@gooddata/sdk-model";

import {
    type IGlobalThemeOwner,
    createGlobalThemeOwner,
    registerGlobalThemeOwner,
    setGlobalThemeOwnerState,
    unregisterGlobalThemeOwner,
} from "./globalThemeOwners.js";

const outerTheme: ITheme = { palette: { primary: { base: "#aa0000" } } };
const changedOuterTheme: ITheme = { palette: { primary: { base: "#00aa00" } } };
const innerTheme: ITheme = { palette: { primary: { base: "#0000aa" } } };

const primaryColor = () =>
    /--gd-palette-primary-base: ([^;]+);/.exec(
        document.getElementById("gdc-theme-properties")?.textContent ?? "",
    )?.[1];

describe("globalThemeOwners", () => {
    const createdOwners: IGlobalThemeOwner[] = [];

    interface IRegisteredOwnerOptions {
        theme: ITheme;
        removeGlobalStylesWhenLast?: boolean;
        parent?: IGlobalThemeOwner | null;
    }

    const createRegisteredOwner = ({
        theme,
        removeGlobalStylesWhenLast = true,
        parent = null,
    }: IRegisteredOwnerOptions) => {
        const owner = createGlobalThemeOwner(removeGlobalStylesWhenLast, parent);
        createdOwners.push(owner);
        registerGlobalThemeOwner(owner);
        setGlobalThemeOwnerState(owner, { theme });
        return owner;
    };

    afterEach(() => {
        createdOwners.splice(0).reverse().forEach(unregisterGlobalThemeOwner);
    });

    it("should treat a re-registered owner as loading until it resolves again", () => {
        const outer = createRegisteredOwner({ theme: outerTheme });
        const inner = createRegisteredOwner({ theme: innerTheme });

        unregisterGlobalThemeOwner(inner);
        registerGlobalThemeOwner(inner);
        setGlobalThemeOwnerState(outer, { theme: changedOuterTheme });

        expect(primaryColor()).toBe("#00aa00");
    });

    it("should keep an inherited duty to remove the styles across a re-registration", () => {
        const parent = createRegisteredOwner({ theme: outerTheme });
        const child = createRegisteredOwner({ theme: innerTheme, removeGlobalStylesWhenLast: false, parent });

        unregisterGlobalThemeOwner(parent);
        unregisterGlobalThemeOwner(child);
        registerGlobalThemeOwner(child);
        setGlobalThemeOwnerState(child, { theme: innerTheme });
        unregisterGlobalThemeOwner(child);

        expect(document.getElementById("gdc-theme-properties")).toBeNull();
    });
});
