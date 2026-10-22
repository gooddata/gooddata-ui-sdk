// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUserSettings, idRef } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { render } from "../../test/render.js";

import { HostChrome } from "./HostChrome.js";

// the header reads the organization, and the language dialog its default language
vi.mock("../platformContext/backend.js", () => ({
    getBackend: () => ({
        organizations: () => ({
            getCurrentOrganization: () =>
                Promise.resolve({
                    settings: () => ({ getSettings: () => Promise.resolve({ locale: "en-US" }) }),
                }),
        }),
    }),
}));

const userSettings: IUserSettings = {
    userId: "jane.doe",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enableUserLanguageChange: true,
};

const ctx: IPlatformContext = {
    version: "1.0",
    embeddingMode: "none",
    auth: { type: "contextDeferred" },
    user: { ref: idRef("jane.doe"), login: "jane.doe", fullName: "Jane Doe" },
    userSettings,
    settings: userSettings,
    whiteLabeling: undefined,
    organization: { id: "org1", title: "Acme Corp" },
    preferredLocale: "en-US",
};

const requiredProps = {
    ctx,
    resolvedApplications: [],
    pathname: "/organization",
    onNavigate: () => {},
    onReplace: () => {},
};

describe("HostChrome", () => {
    it("should open the change language dialog from the user menu", async () => {
        const { user } = render(<HostChrome {...requiredProps} />);

        await user.click(await screen.findByRole("button", { name: "Jane Doe" }));
        await user.click(await screen.findByRole("button", { name: "Language" }));

        expect(await screen.findByRole("dialog", { name: "Change language" })).toBeVisible();
    });
});
