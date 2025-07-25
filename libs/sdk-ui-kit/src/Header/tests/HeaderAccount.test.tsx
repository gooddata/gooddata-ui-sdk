// (C) 2007-2025 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import noop from "lodash/noop.js";
import { withIntlForTest, ITranslations } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

import { HeaderAccount } from "../HeaderAccount.js";
import { IHeaderMenuItem } from "../typings.js";

const menuItems: IHeaderMenuItem[] = [
    { isActive: true, key: "gs.header.account", href: "https://example.com" },
    { isActive: false, key: "gs.header.dic", href: "" },
    { isActive: false, key: "gs.header.logout", href: "" },
];

const mockTranslation: ITranslations = {
    "gs.header.account": "Account",
    "gs.header.dic": "Dictionary",
    "gs.header.logout": "Logout",
};

const Wrapper = withIntlForTest(HeaderAccount, "en-US", mockTranslation);

describe("HeaderAccount", () => {
    it("should render username", () => {
        const userName = "John Doe";
        render(<Wrapper items={menuItems} onMenuItemClick={noop} userName={userName} />);
        expect(screen.getByText(`${userName}`)).toBeInTheDocument();
    });

    it("should open menu on click", async () => {
        const clickSpy = vi.fn();
        render(<Wrapper items={menuItems} onMenuItemClick={clickSpy} />);
        await userEvent.click(document.querySelector(".gd-header-account"));
        await userEvent.click(screen.getByText("Account"));

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    });
});
