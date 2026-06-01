// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { BackendProvider } from "@gooddata/sdk-ui";
import { PlatformContextProvider, type IClientPlatformContext } from "@gooddata/sdk-ui-pluggable-application";

import { App } from "./App.js";

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
});
