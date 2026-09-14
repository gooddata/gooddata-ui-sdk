// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HostErrorBoundary } from "./HostErrorBoundary.js";

function Bomb(): never {
    throw new Error("boom");
}

describe("HostErrorBoundary", () => {
    it("renders children when nothing throws", () => {
        render(
            <HostErrorBoundary>
                <div data-testid="content" />
            </HostErrorBoundary>,
        );

        expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("renders the error screen instead of unmounting the tree when a child throws", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        const { container } = render(
            <HostErrorBoundary>
                <Bomb />
            </HostErrorBoundary>,
        );

        expect(container.querySelector(".gd-host-root__error")).not.toBeNull();
        expect(screen.getByRole("heading")).toBeInTheDocument();
        expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
    });

    it("clears a caught error when resetKey changes", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        const { container, rerender } = render(
            <HostErrorBoundary resetKey="/route-a">
                <Bomb />
            </HostErrorBoundary>,
        );
        expect(container.querySelector(".gd-host-root__error")).not.toBeNull();

        rerender(
            <HostErrorBoundary resetKey="/route-b">
                <div data-testid="recovered" />
            </HostErrorBoundary>,
        );

        expect(screen.getByTestId("recovered")).toBeInTheDocument();
        expect(container.querySelector(".gd-host-root__error")).toBeNull();
    });

    it("reports the caught error via onError", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const onError = vi.fn();

        render(
            <HostErrorBoundary onError={onError}>
                <Bomb />
            </HostErrorBoundary>,
        );

        expect(onError).toHaveBeenCalledWith(expect.stringContaining("boom"), expect.any(String));
    });
});
