// (C) 2026 GoodData Corporation

import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";

import { FEATURE_FLAG_OVERRIDES_STORAGE_KEY, LocalFeatureFlagOverrides } from "@gooddata/sdk-backend-tiger";
import { type IUserSettings, idRef } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { render } from "../../test/render.js";
import { registerHostTelemetryServices } from "../loader/pluggableApplicationsLoader.js";

import { HostChrome } from "./HostChrome.js";
import { setHostPricingExtension } from "./useHostChromePricing.js";

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
        await user.click(await screen.findByRole("button", { name: "Language, English (US)" }));

        expect(await screen.findByRole("dialog", { name: "Change language" })).toBeVisible();
    });

    describe("pricing dialog open request", () => {
        const onUpsellButtonClick = vi.fn();

        afterEach(() => {
            setHostPricingExtension(undefined);
            onUpsellButtonClick.mockClear();
        });

        it.each([
            ["opens the pricing dialog in a trial organization", true, 1],
            ["does nothing outside a trial organization", false, 0],
        ])("%s", (_case, isTrial, expectedCalls) => {
            setHostPricingExtension(() => ({
                element: null,
                isTrial,
                expiredDate: "",
                onUpsellButtonClick,
            }));
            const openPricingDialogRef: { current: (() => void) | undefined } = { current: undefined };
            render(<HostChrome {...requiredProps} openPricingDialogRef={openPricingDialogRef} />);

            openPricingDialogRef.current?.();

            expect(onUpsellButtonClick).toHaveBeenCalledTimes(expectedCalls);
        });

        it("releases the handler on unmount", () => {
            const openPricingDialogRef: { current: (() => void) | undefined } = { current: undefined };
            const { unmount } = render(
                <HostChrome {...requiredProps} openPricingDialogRef={openPricingDialogRef} />,
            );

            unmount();

            expect(openPricingDialogRef.current).toBeUndefined();
        });
    });

    describe("language telemetry", () => {
        const trackEvent = vi.fn();
        const reload = vi.fn();

        beforeEach(() => {
            trackEvent.mockClear();
            setLocale.mockReset();
            organizationSettings.locale = "en-US";
            registerHostTelemetryServices({
                createTelemetryCallbacks: () => ({
                    trackEvent,
                    trackPageView: vi.fn(),
                    trackTiming: vi.fn(),
                }),
            });
            vi.stubGlobal("location", { ...window.location, reload });
        });

        afterEach(() => {
            registerHostTelemetryServices({});
            vi.unstubAllGlobals();
        });

        async function applyGerman() {
            const { user } = render(<HostChrome {...requiredProps} />);
            await user.click(await screen.findByRole("button", { name: "Jane Doe" }));
            await user.click(await screen.findByRole("button", { name: /Language/ }));
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
                await user.click(await screen.findByRole("button", { name: /Language/ }));

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

        it("should track a saved language and reload the page", async () => {
            setLocale.mockResolvedValue(undefined);

            await applyGerman();

            await waitFor(() => expect(reload).toHaveBeenCalled());
            expect(trackEvent).toHaveBeenCalledWith("own_language_save", {
                category: "localization",
                action: "own_language_save",
                label: "inherit→de-DE",
                stats: { outcome: "success" },
            });
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

    it("should close the change language dialog when the workspace changes", async () => {
        const { user, rerender } = render(
            <HostChrome {...requiredProps} ctx={{ ...ctx, currentWorkspaceId: "ws1" }} />,
        );

        await user.click(await screen.findByRole("button", { name: "Jane Doe" }));
        await user.click(await screen.findByRole("button", { name: /Language/ }));

        expect(await screen.findByRole("dialog", { name: "Change language" })).toBeVisible();

        rerender(<HostChrome {...requiredProps} />);
        // Flush promises
        await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

        expect(screen.queryByRole("dialog", { name: "Change language" })).not.toBeInTheDocument();
    });

    describe("feature flag overrides", () => {
        const gateSettings: IUserSettings = { ...userSettings, enableFeatureFlagOverrides: true };
        const gateCtx: IPlatformContext = { ...ctx, userSettings: gateSettings, settings: gateSettings };
        const menuItemName = "Feature flag overrides";

        afterEach(() => {
            localStorage.clear();
        });

        const openAccountMenu = async (user: ReturnType<typeof render>["user"]) => {
            await user.click(await screen.findByRole("button", { name: "Jane Doe" }));
        };

        it("offers no menu item and no badge without the gate flag", async () => {
            const { user } = render(<HostChrome {...requiredProps} />);

            await openAccountMenu(user);

            expect(await screen.findByRole("button", { name: /Log ?out/i })).toBeVisible();
            expect(screen.queryByRole("button", { name: menuItemName })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /flag override/ })).not.toBeInTheDocument();
        });

        it("shows no badge in export mode", async () => {
            localStorage.setItem(
                FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
                JSON.stringify({ version: 1, rules: [{ flag: "enableRadarChart", value: true }] }),
            );
            render(<HostChrome {...requiredProps} ctx={{ ...gateCtx, isExportMode: true }} />);

            expect(screen.queryByRole("button", { name: /flag override/ })).not.toBeInTheDocument();
        });

        it("opens the panel from the account menu, with no badge when no override applies", async () => {
            const { user } = render(<HostChrome {...requiredProps} ctx={gateCtx} />);

            expect(screen.queryByRole("button", { name: /flag override/ })).not.toBeInTheDocument();
            await openAccountMenu(user);
            await user.click(await screen.findByRole("button", { name: menuItemName }));

            expect(await screen.findByRole("dialog", { name: "Feature flag overrides" })).toBeVisible();
        });

        it("shows no badge for a stored rule of a flag set in code", async () => {
            LocalFeatureFlagOverrides.enableRadarChart = true;
            onTestFinished(() => {
                delete LocalFeatureFlagOverrides.enableRadarChart;
            });
            localStorage.setItem(
                FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
                JSON.stringify({ version: 1, rules: [{ flag: "enableRadarChart", value: false }] }),
            );
            const { user } = render(<HostChrome {...requiredProps} ctx={gateCtx} />);

            await openAccountMenu(user);
            expect(await screen.findByRole("button", { name: menuItemName })).toBeVisible();
            expect(screen.queryByRole("button", { name: /^\d+ flag override/ })).not.toBeInTheDocument();
        });

        it("puts the menu item just before logging out", async () => {
            const { user } = render(<HostChrome {...requiredProps} ctx={gateCtx} />);

            await openAccountMenu(user);
            const menuItem = await screen.findByRole("button", { name: menuItemName });
            const logout = screen.getByRole("button", { name: /Log ?out/i });

            expect(menuItem.nextElementSibling).toBe(logout);
        });

        it("names the user by login when the profile has no name or e-mail", async () => {
            localStorage.setItem(
                FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
                JSON.stringify({
                    version: 1,
                    rules: [{ flag: "enableRadarChart", value: true, userId: "jane.doe" }],
                }),
            );
            const { user } = render(
                <HostChrome
                    {...requiredProps}
                    ctx={{ ...gateCtx, user: { ref: idRef("jane"), login: "jane", fullName: "", email: "" } }}
                />,
            );

            await user.click(await screen.findByRole("button", { name: "1 flag override" }));

            expect(
                await screen.findByRole("button", { name: "Only when signed in as jane" }),
            ).toHaveAttribute("aria-pressed", "true");
        });

        it("shows a badge with the count that opens the same panel", async () => {
            localStorage.setItem(
                FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
                JSON.stringify({
                    version: 1,
                    rules: [
                        { flag: "enableRadarChart", value: true },
                        { flag: "enableMekkoChart", value: true, organizationId: "other" },
                    ],
                }),
            );
            const { user } = render(<HostChrome {...requiredProps} ctx={gateCtx} />);

            await user.click(await screen.findByRole("button", { name: "1 flag override" }));
            expect(await screen.findByRole("dialog", { name: "Feature flag overrides" })).toBeVisible();

            await user.click(screen.getByRole("button", { name: "Cancel" }));
            await openAccountMenu(user);
            await user.click(await screen.findByRole("button", { name: menuItemName }));

            expect(await screen.findAllByRole("dialog", { name: "Feature flag overrides" })).toHaveLength(1);
        });

        it("starts with only overridden flags from the badge and all flags from the menu", async () => {
            localStorage.setItem(
                FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
                JSON.stringify({ version: 1, rules: [{ flag: "enableRadarChart", value: true }] }),
            );
            const { user } = render(<HostChrome {...requiredProps} ctx={gateCtx} />);

            await user.click(await screen.findByRole("button", { name: "1 flag override" }));
            expect(await screen.findByRole("button", { name: /^Overridden/ })).toHaveAttribute(
                "aria-pressed",
                "true",
            );
            expect(screen.getByText("enableRadarChart")).toBeVisible();
            expect(screen.queryByText("enableMekkoChart")).not.toBeInTheDocument();

            await user.click(screen.getByRole("button", { name: "Cancel" }));
            await openAccountMenu(user);
            await user.click(await screen.findByRole("button", { name: menuItemName }));
            expect(await screen.findByRole("button", { name: /^Overridden/ })).toHaveAttribute(
                "aria-pressed",
                "false",
            );
            expect(screen.getByText("enableMekkoChart")).toBeVisible();
        });

        it("returns focus to the badge when the panel closes", async () => {
            localStorage.setItem(
                FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
                JSON.stringify({ version: 1, rules: [{ flag: "enableRadarChart", value: true }] }),
            );
            const { user } = render(<HostChrome {...requiredProps} ctx={gateCtx} />);
            const badge = await screen.findByRole("button", { name: "1 flag override" });

            await user.click(badge);
            await user.click(await screen.findByRole("button", { name: "Cancel" }));

            await waitFor(() => expect(badge).toHaveFocus());
        });

        it("returns focus to the account menu button when the panel closes", async () => {
            const { user } = render(<HostChrome {...requiredProps} ctx={gateCtx} />);

            await openAccountMenu(user);
            await user.click(await screen.findByRole("button", { name: menuItemName }));
            await user.click(await screen.findByRole("button", { name: "Cancel" }));

            await waitFor(() => expect(screen.getByRole("button", { name: "Jane Doe" })).toHaveFocus());
        });
    });
});
