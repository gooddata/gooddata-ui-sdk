// (C) 2026 GoodData Corporation

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../test/render.js";

import {
    type IGenerateHeaderAccountMenuItemsOptions,
    generateHeaderAccountMenuItems,
} from "./generateHeaderAccountMenuItems.js";
import { makeWorkspacePermissions } from "./Header.test.helpers.js";
import { HeaderLanguageButton, type IHeaderLanguageButtonProps } from "./HeaderLanguageButton.js";

const requiredOptions = {
    featureFlags: {},
    currentLanguage: "en-US",
} satisfies IGenerateHeaderAccountMenuItemsOptions;

const requiredProps = {
    onMenuItemClick: () => {},
} satisfies Omit<IHeaderLanguageButtonProps, "items">;

describe("HeaderLanguageButton", () => {
    it("should show language and the language in effect that opens a dialog", () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), {
            ...requiredOptions,
            featureFlags: { enableUserLanguageChange: true },
            currentLanguage: "en-GB",
        });

        render(<HeaderLanguageButton {...requiredProps} items={items} />);

        const language = screen.getByRole("button", { name: /Language/ });
        expect(language).toBeVisible();
        expect(within(language).getByText("English (UK)")).toBeVisible();
        expect(language).toHaveAccessibleName("Language, English (UK)");
        expect(language).toHaveAttribute("aria-haspopup", "dialog");
    });
});
