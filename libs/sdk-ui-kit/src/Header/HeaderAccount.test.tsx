// (C) 2007-2026 GoodData Corporation

import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../test/render.js";

import {
    type IGenerateHeaderAccountMenuItemsOptions,
    generateHeaderAccountMenuItems,
} from "./generateHeaderAccountMenuItems.js";
import { makeWorkspacePermissions } from "./Header.test.helpers.js";
import { HeaderAccount } from "./HeaderAccount.js";
import { type IHeaderAccountProps } from "./typings.js";

const requiredOptions = {
    featureFlags: {},
    currentLanguage: "en-US",
} satisfies IGenerateHeaderAccountMenuItemsOptions;

const requiredProps = {
    onMenuItemClick: () => {},
} satisfies IHeaderAccountProps;

describe("HeaderAccount", () => {
    it("should render username", () => {
        const userName = "John Doe";
        render(<HeaderAccount {...requiredProps} userName={userName} />);

        expect(screen.getByRole("button", { name: "John Doe" })).toBeVisible();
    });

    it("should open menu on click", async () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), requiredOptions);
        const clickSpy = vi.fn();
        const userName = "John Doe";
        const { user } = render(
            <HeaderAccount {...requiredProps} items={items} userName={userName} onMenuItemClick={clickSpy} />,
        );

        await user.click(screen.getByRole("button", { name: "John Doe" }));
        await user.click(await screen.findByRole("button", { name: "Logout" }));

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("should show language and the language in effect if `enableUserLanguageChange` is on", async () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), {
            featureFlags: { enableUserLanguageChange: true },
            currentLanguage: "en-GB",
        });
        const userName = "John Doe";
        const { user } = render(<HeaderAccount {...requiredProps} items={items} userName={userName} />);

        await user.click(screen.getByRole("button", { name: "John Doe" }));

        const language = await screen.findByRole("button", { name: /Language/ });
        expect(language).toBeVisible();
        expect(within(language).getByText("English (UK)")).toBeVisible();
        expect(language).toHaveAccessibleName("Language, English (UK)"); // Note the comma here
        expect(language).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("should not show language if the `enableUserLanguageChange` feature flag is off", async () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), {
            ...requiredOptions,
            featureFlags: { enableUserLanguageChange: false },
        });
        const userName = "John Doe";
        const { user } = render(<HeaderAccount {...requiredProps} items={items} userName={userName} />);

        await user.click(screen.getByRole("button", { name: "John Doe" }));

        expect(await screen.findByRole("button", { name: "Logout" })).toBeVisible();
        expect(screen.queryByRole("button", { name: /Language/ })).not.toBeInTheDocument();
    });
});
