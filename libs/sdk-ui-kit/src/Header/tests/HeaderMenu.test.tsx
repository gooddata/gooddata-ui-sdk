// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ITranslations, withIntlForTest } from "@gooddata/sdk-ui";
import { suppressConsole } from "@gooddata/util";

import { HeaderMenu } from "../HeaderMenu.js";
import { IHeaderMenuItem } from "../typings.js";

const sections: IHeaderMenuItem[][] = [
    [
        { isActive: true, key: "dic", href: "https://example.com" },
        { isActive: false, key: "account", href: "" },
        { isActive: false, key: "logout", href: "" },
    ],
];

const mockTranslation: ITranslations = {
    account: "Account",
    dic: "Dictionary",
    logout: "Logout",
};

const Wrapped = withIntlForTest(HeaderMenu, "en-US", mockTranslation);

describe("ReactHeaderMenu", () => {
    it("should render menu items", () => {
        render(<Wrapped sections={sections} />);

        expect(screen.getByText(mockTranslation["account"])).toBeInTheDocument();
        expect(screen.getByText(mockTranslation["dic"])).toBeInTheDocument();
        expect(screen.getByText(mockTranslation["logout"])).toBeInTheDocument();

        expect(screen.getByText(mockTranslation["dic"]).closest("a")).toHaveAttribute(
            "href",
            "https://example.com",
        );
    });

    it("should call click handler on menu item", async () => {
        const clickSpy = vi.fn();
        render(<Wrapped sections={sections} onMenuItemClick={clickSpy} />);

        await suppressConsole(() => userEvent.click(screen.getByText(mockTranslation["dic"])), "error", [
            {
                type: "startsWith",
                value: "Error: Not implemented: navigation",
            },
        ]);

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    });
});
