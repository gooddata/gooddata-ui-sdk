// (C) 2026 GoodData Corporation

import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserSettings, idRef } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { render } from "../../test/render.js";
import { registerAppLifecycleCallbacks } from "../loader/pluggableApplicationsLoader.js";

import { HostChrome } from "./HostChrome.js";

const { setLocale, organizationSettings } = vi.hoisted(() => ({
    setLocale: vi.fn<(locale: string) => Promise<void>>(),
    organizationSettings: { locale: "en-US" },
}));

// the header reads the organization, and the language dialog its default language
vi.mock("../platformContext/backend.js", () => ({
    getBackend: () => ({
        currentUser: () => ({ settings: () => ({ setLocale }) }),
        // a workspace without a LOCALE of its own resolves to the organization's one
        workspace: () => ({ settings: () => ({ getSettings: () => Promise.resolve(organizationSettings) }) }),
        organizations: () => ({
            getCurrentOrganization: () =>
                Promise.resolve({
                    settings: () => ({ getSettings: () => Promise.resolve(organizationSettings) }),
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

    describe("language telemetry", () => {
        const trackEvent = vi.fn();
        const reload = vi.fn();

        beforeEach(() => {
            trackEvent.mockClear();
            setLocale.mockReset();
            organizationSettings.locale = "en-US";
            registerAppLifecycleCallbacks({
                createTelemetryCallbacks: () => ({
                    trackEvent,
                    trackPageView: vi.fn(),
                    trackTiming: vi.fn(),
                }),
            });
            vi.stubGlobal("location", { ...window.location, reload });
        });

        afterEach(() => {
            registerAppLifecycleCallbacks({});
            vi.unstubAllGlobals();
        });

        async function applyGerman() {
            const { user } = render(<HostChrome {...requiredProps} />);
            await user.click(await screen.findByRole("button", { name: "Jane Doe" }));
            await user.click(await screen.findByRole("button", { name: "Language" }));
            await user.click(
                await screen.findByRole("button", { name: "Default (English US) Change language" }),
            );
            await user.click(screen.getByRole("option", { name: "Deutsch" }));
            await user.click(screen.getByRole("button", { name: "Apply" }));
        }

        // The interface stays in English in every case, so the menu item keeps its English name.
        it.each<[string, IPlatformContext, string, string]>([
            ["an organization route", ctx, "en-US", "en-US:orgRoute"],
            ["a workspace route", { ...ctx, currentWorkspaceId: "ws1" }, "en-US", "en-US:workspaceRoute"],
            ["the user's own language", ctx, "de-DE", "en-US:own"],
        ])(
            "should track the opened settings on %s",
            async (_case, platformContext, organizationLocale, label) => {
                organizationSettings.locale = organizationLocale;
                const { user } = render(<HostChrome {...requiredProps} ctx={platformContext} />);

                await user.click(await screen.findByRole("button", { name: "Jane Doe" }));
                await user.click(await screen.findByRole("button", { name: "Language" }));

                await waitFor(() =>
                    expect(trackEvent).toHaveBeenCalledWith("user_settings_open", {
                        category: "localization",
                        action: "user_settings_open",
                        label,
                        stats: { entry: "userMenu" },
                    }),
                );
            },
        );

        it("should track a saved language before the page reloads", async () => {
            setLocale.mockResolvedValue(undefined);

            await applyGerman();

            await waitFor(() => expect(reload).toHaveBeenCalled());
            expect(trackEvent).toHaveBeenCalledWith("own_language_save", {
                category: "localization",
                action: "own_language_save",
                label: "inherit→de-DE",
                stats: { outcome: "success" },
            });
            const saveCall = trackEvent.mock.calls.findIndex(([event]) => event === "own_language_save");
            expect(trackEvent.mock.invocationCallOrder[saveCall]).toBeLessThan(
                reload.mock.invocationCallOrder[0],
            );
        });

        it("should track a failed save as an error", async () => {
            setLocale.mockRejectedValue(new Error("failed"));

            await applyGerman();

            await waitFor(() =>
                expect(trackEvent).toHaveBeenCalledWith(
                    "own_language_save",
                    expect.objectContaining({ label: "inherit→de-DE", stats: { outcome: "error" } }),
                ),
            );
            expect(reload).not.toHaveBeenCalled();
            expect(screen.getByRole("dialog", { name: "Change language" })).toBeVisible();
        });
    });
});
