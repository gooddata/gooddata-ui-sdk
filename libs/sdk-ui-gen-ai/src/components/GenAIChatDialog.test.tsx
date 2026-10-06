// (C) 2026 GoodData Corporation

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { type LinkHandlerEvent } from "./ConfigContext.js";
import { GenAIChatDialog } from "./GenAIChatDialog.js";

// `isolate: false` shares one module graph per worker, so a file that ran earlier may already have
// loaded the modules mocked below, which would turn the `vi.mock()` calls into no-ops. Dropping the
// registry from `vi.hoisted()` runs before this file's imports resolve.
const probe = vi.hoisted(() => {
    vi.resetModules();
    return { onLink: undefined as (() => void) | undefined };
});

vi.mock("./GenAIChatOverlay.js", async () => {
    const { useConfig: useChatConfig } = await import("./ConfigContext.js");
    return {
        GenAIChatOverlay: function GenAIChatOverlay() {
            const { linkHandler } = useChatConfig();
            probe.onLink = () => {
                linkHandler?.({ type: "report", itemUrl: "/report" } as LinkHandlerEvent);
            };
            return null;
        },
    };
});

vi.mock("./KeyDriverAnalysis.js", () => ({ KeyDriverAnalysis: () => null }));

vi.mock("../store/sideEffects/loadColorPalette.js", () => ({ loadColorPalette: function* () {} }));

afterAll(() => {
    vi.resetModules();
});

afterEach(() => {
    cleanup();
    probe.onLink = undefined;
});

describe("GenAIChatDialog", () => {
    it("calls the link handler once per link click", async () => {
        const onLinkClick = vi.fn();
        render(
            <GenAIChatDialog
                backend={dummyBackend()}
                workspace="ws"
                isOpen
                onOpen={vi.fn()}
                onClose={vi.fn()}
                onLinkClick={onLinkClick}
            />,
        );
        await waitFor(() => expect(probe.onLink).toBeDefined());

        probe.onLink?.();

        expect(onLinkClick).toHaveBeenCalledTimes(1);
    });
});
