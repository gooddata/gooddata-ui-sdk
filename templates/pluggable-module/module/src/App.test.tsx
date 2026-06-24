// (C) 2026 GoodData Corporation

import { version as reactVersion } from "react";

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import {
    type IPluggableAppTelemetryCallbacks,
    LIB_VERSION as sdkVersion,
} from "@gooddata/sdk-pluggable-application-model";
import { BackendProvider } from "@gooddata/sdk-ui";
import { type IClientPlatformContext, PlatformContextProvider } from "@gooddata/sdk-ui-pluggable-application";

import { App } from "./App.js";
import { reportPageView } from "./pluggableApp.js";

function createMockCtx(): IClientPlatformContext {
    return {
        version: "1.0",
        auth: { type: "contextDeferred" },
        user: { login: "test@example.com" },
        organization: { id: "org-1", title: "Test Org" },
        userSettings: {} as IClientPlatformContext["userSettings"],
        whiteLabeling: undefined,
        embeddingMode: "none",
        backend: {
            // Minimal mock — extend as needed for your tests
        } as IClientPlatformContext["backend"],
    } as IClientPlatformContext;
}

function renderWithProviders(ui: React.ReactElement) {
    const ctx = createMockCtx();
    return render(
        <PlatformContextProvider value={ctx}>
            <BackendProvider backend={ctx.backend}>
                <IntlProvider
                    locale="en-US"
                    messages={{ "gdc-app-template-name.title": "{applicationTemplateTitle}" }}
                >
                    {ui}
                </IntlProvider>
            </BackendProvider>
        </PlatformContextProvider>,
    );
}

describe("App", () => {
    it("renders the application title", () => {
        renderWithProviders(<App />);
        expect(screen.getByText("{applicationTemplateTitle}")).toBeTruthy();
    });

    it("renders user information from context", () => {
        renderWithProviders(<App />);
        expect(screen.getByText(/test@example.com/)).toBeTruthy();
    });

    it("reports one page view carrying the module React / SDK versions and the workspace id", () => {
        const trackPageView = vi.fn();
        const onTelemetryEvent: IPluggableAppTelemetryCallbacks = {
            trackEvent: vi.fn(),
            trackPageView,
            trackTiming: vi.fn(),
        };

        reportPageView(onTelemetryEvent, "ws-1");

        expect(trackPageView).toHaveBeenCalledTimes(1);
        expect(trackPageView).toHaveBeenCalledWith("gdc-app-template-name", {
            moduleReactVersion: reactVersion,
            moduleSdkVersion: sdkVersion,
            identifiers: { workspaceId: "ws-1" },
        });
    });

    it("reports a page view without identifiers for an organization-scoped app", () => {
        const trackPageView = vi.fn();
        const onTelemetryEvent: IPluggableAppTelemetryCallbacks = {
            trackEvent: vi.fn(),
            trackPageView,
            trackTiming: vi.fn(),
        };

        reportPageView(onTelemetryEvent, undefined);

        expect(trackPageView).toHaveBeenCalledTimes(1);
        expect(trackPageView).toHaveBeenCalledWith("gdc-app-template-name", {
            moduleReactVersion: reactVersion,
            moduleSdkVersion: sdkVersion,
        });
    });

    it("no-ops when the host supplies no telemetry callbacks (standalone run)", () => {
        expect(() => reportPageView(undefined, "ws-1")).not.toThrow();
    });
});
