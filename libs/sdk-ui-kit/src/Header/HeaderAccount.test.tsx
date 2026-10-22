// (C) 2007-2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../test/render.js";

import { generateHeaderAccountMenuItems } from "./generateHeaderAccountMenuItems.js";
import { makeFullWorkspacePermissions, makeWorkspacePermissions } from "./Header.test.helpers.js";
import { HeaderAccount } from "./HeaderAccount.js";
import { type IHeaderAccountProps } from "./typings.js";

const menuItems = generateHeaderAccountMenuItems(makeFullWorkspacePermissions(), {
    workspaceId: "test-workspace-id",
});

const requiredProps = {
    onMenuItemClick: () => {},
} satisfies IHeaderAccountProps;

describe("HeaderAccount", () => {
    it("should render username", () => {
        const userName = "John Doe";
        render(
            <HeaderAccount
                {...requiredProps}
                items={menuItems}
                onMenuItemClick={() => {}}
                userName={userName}
            />,
        );

        expect(screen.getByRole("button", { name: "John Doe" })).toBeVisible();
    });

    it("should open menu on click", async () => {
        // Clicked without an href: the items are real anchors, and the component deliberately leaves
        // navigation to the browser, so clicking one that points somewhere would send the test
        // environment's window off to that address — where every later test would then find itself.
        const clickSpy = vi.fn();
        const userName = "John Doe";
        const { user } = render(
            <HeaderAccount
                {...requiredProps}
                items={menuItems}
                userName={userName}
                onMenuItemClick={clickSpy}
            />,
        );

        await user.click(screen.getByRole("button", { name: "John Doe" }));
        await user.click(await screen.findByRole("button", { name: "Logout" }));

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("should show language if the `enableUserLanguageChange` feature flag is on", async () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), {
            featureFlags: { enableUserLanguageChange: true },
        });
        const userName = "John Doe";
        const { user } = render(<HeaderAccount {...requiredProps} items={items} userName={userName} />);

        await user.click(screen.getByRole("button", { name: "John Doe" }));

        expect(await screen.findByRole("button", { name: "Language" })).toBeVisible();
    });

    it("should not show language if the `enableUserLanguageChange` feature flag is off", async () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), {
            featureFlags: { enableUserLanguageChange: false },
        });
        const userName = "John Doe";
        const { user } = render(<HeaderAccount {...requiredProps} items={items} userName={userName} />);

        await user.click(screen.getByRole("button", { name: "John Doe" }));

        expect(await screen.findByRole("button", { name: "Logout" })).toBeVisible();
        expect(screen.queryByRole("button", { name: "Language" })).not.toBeInTheDocument();
    });
});
