// (C) 2020-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { useLoadPlatformContext } from "../../platformContext/useLoadPlatformContext.js";
import { Root } from "../Root.js";
import { type RedirectTargetState, useRedirectTarget } from "../useRedirectTarget.js";

vi.mock("../../platformContext/useLoadPlatformContext.js", () => ({
    useLoadPlatformContext: vi.fn(),
}));

vi.mock("../useRedirectTarget.js", () => ({
    useRedirectTarget: vi.fn().mockReturnValue({ state: "render" }),
}));

vi.mock("../../ui/resolveHostUiModule.js", () => ({
    resolveHostUiModule: vi.fn(() => new Promise(() => {})),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const userSettings = {} as IPlatformContext["userSettings"];
const ctx: IPlatformContext = {
    version: "1.0",
    embeddingMode: "none",
    auth: { type: "contextDeferred" as const },
    user: {
        login: "john.doe",
    } as IPlatformContext["user"],
    userSettings,
    settings: userSettings,
    whiteLabeling: undefined,
    organization: { id: "org1", title: "Acme Corp" },
    preferredLocale: "en-US",
};

function setupReadyContext(): void {
    vi.mocked(useLoadPlatformContext).mockReturnValue({ state: "ready", ctx });
}

describe("Root", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupReadyContext();
    });

    it("renders the host UI container when context is ready and redirect resolves", () => {
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "render" });

        const { container } = render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        // HostUiContainer renders a bare container div for the host UI module to mount into
        expect(container.querySelector(".gd-host-root__loading")).toBeNull();
        expect(screen.queryByRole("heading")).toBeNull();
    });

    it("shows loading indicator while platform context is loading", () => {
        vi.mocked(useLoadPlatformContext).mockReturnValue({
            state: "loading",
        });

        const { container } = render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(container.querySelector(".gd-host-root__loading")).toBeInTheDocument();
    });

    it("shows error heading when platform context fails to load", () => {
        vi.mocked(useLoadPlatformContext).mockReturnValue({
            state: "error",
            error: "Something went wrong",
        });

        render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(screen.getByRole("heading")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("shows loading indicator while redirect target is being resolved", () => {
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "loading" });

        const { container } = render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(container.querySelector(".gd-host-root__loading")).toBeInTheDocument();
    });

    it("shows loading indicator during redirect navigation", () => {
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "redirect", url: "/org/dashboards" });

        const { container } = render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(container.querySelector(".gd-host-root__loading")).toBeInTheDocument();
    });

    it("shows not-found heading when redirect state is 'not-found'", () => {
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "not-found" });

        render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("shows error message when redirect encounters an error", () => {
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "error", error: "Redirect failed" });

        render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(screen.getByRole("heading")).toBeInTheDocument();
        expect(screen.getByText("Redirect failed")).toBeInTheDocument();
    });

    it("calls navigate exactly once when redirect state is 'redirect'", () => {
        vi.mocked(useRedirectTarget).mockReturnValue({
            state: "redirect",
            url: "/workspace/ws-123/dashboards",
        });

        render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/workspace/ws-123/dashboards", { replace: true });
    });

    it("does not call navigate twice when the same redirect URL appears on consecutive renders", () => {
        const redirectState: RedirectTargetState = {
            state: "redirect",
            url: "/workspace/ws-123/dashboards",
        };
        vi.mocked(useRedirectTarget).mockReturnValue(redirectState);

        const { rerender } = render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        // Re-render with the same redirect state (simulates the stale-state frame)
        rerender(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("navigates again after the redirect cycle resets and the same URL is produced", () => {
        const redirectUrl = "/workspace/ws-123/dashboards";

        // First: redirect state
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "redirect", url: redirectUrl });

        const { rerender } = render(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(mockNavigate).toHaveBeenCalledTimes(1);

        // Resolution cycle resets (e.g. user navigated back to workspace root)
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "loading" });
        rerender(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        // Same redirect URL produced again
        vi.mocked(useRedirectTarget).mockReturnValue({ state: "redirect", url: redirectUrl });
        rerender(
            <MemoryRouter>
                <Root />
            </MemoryRouter>,
        );

        expect(mockNavigate).toHaveBeenCalledTimes(2);
        expect(mockNavigate).toHaveBeenLastCalledWith(redirectUrl, { replace: true });
    });
});
