// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
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
    it("should show language that opens a dialog, announcing the language in effect", () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), {
            ...requiredOptions,
            featureFlags: { enableUserLanguageChange: true },
            currentLanguage: "en-GB",
        });

        render(<HeaderLanguageButton {...requiredProps} items={items} />);

        const language = screen.getByRole("button", { name: /Language/ });
        expect(language).toBeVisible();
        // The language value should not be displayed on mobile (not much space there), but should be announced by screen readers
        expect(screen.queryByText("English (UK)")).not.toBeInTheDocument();
        expect(language).toHaveAccessibleName("Language, English (UK)");
        expect(language).toHaveAttribute("aria-haspopup", "dialog");
    });
});
