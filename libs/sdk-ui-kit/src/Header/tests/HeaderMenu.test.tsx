// (C) 2007-2025 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { ITranslations, withIntlForTest } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { HeaderMenu } from "../HeaderMenu.js";
import { IHeaderMenuItem } from "../typings.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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

        expect(screen.getByText(mockTranslation.account)).toBeInTheDocument();
        expect(screen.getByText(mockTranslation.dic)).toBeInTheDocument();
        expect(screen.getByText(mockTranslation.logout)).toBeInTheDocument();

        expect(screen.getByText(mockTranslation.dic).closest("a")).toHaveAttribute(
            "href",
            "https://example.com",
        );
    });

    it("should call click handler on menu item", async () => {
        const clickSpy = vi.fn();
        render(<Wrapped sections={sections} onMenuItemClick={clickSpy} />);

        await userEvent.click(screen.getByText(mockTranslation.dic));

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    });
});
