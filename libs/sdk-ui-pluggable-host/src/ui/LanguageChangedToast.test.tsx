// (C) 2026 GoodData Corporation

import { useState } from "react";

import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { render } from "../../test/render.js";

import { LanguageChangedToast, rememberLanguageChange } from "./LanguageChangedToast.js";

afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("LanguageChangedToast", () => {
    it("should show a success toast after the page reloads following a language change", () => {
        vi.setSystemTime(new Date("2026-10-26T12:00:00Z"));
        rememberLanguageChange();

        // The page after the reload, which started loading a second later
        vi.spyOn(performance, "timeOrigin", "get").mockReturnValue(Date.parse("2026-10-26T12:00:01Z"));
        render(<LanguageChangedToast />);

        /**
         * Note that we are querying "status" within the region, because the legacy toast provider (we use
         * the new `UiToast`) always shows an empty role "status" too, so it would clash. Once the legacy
         * toast provider is removed, this region nesting here can be removed too.
         */
        expect(within(screen.getByRole("region")).getByRole("status")).toHaveTextContent(
            "Great! We changed the language!",
        );
    });

    it("should show the success toast only once", () => {
        vi.setSystemTime(new Date("2026-10-26T12:00:00Z"));
        rememberLanguageChange();
        // The page after the reload, which started loading a second later
        vi.spyOn(performance, "timeOrigin", "get").mockReturnValue(Date.parse("2026-10-26T12:00:01Z"));
        const { unmount } = render(<LanguageChangedToast />);
        unmount();

        render(<LanguageChangedToast />); // The next page load

        /**
         * Ideally, this should assert on role = "status", but check above why we are asserting on the
         * absence of its parent "region".
         */
        expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("should not show a success toast when the user stays on the page and reloads it much later", () => {
        vi.setSystemTime(new Date("2026-10-26T12:00:00Z"));
        // Saved, but at the browser's "Leave site?" the user chose to stay, e.g. to keep unsaved edits
        rememberLanguageChange();

        // The user reloads the page themselves two minutes later
        vi.spyOn(performance, "timeOrigin", "get").mockReturnValue(Date.parse("2026-10-26T12:02:00Z"));
        render(<LanguageChangedToast />);

        expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("should not show a success toast when the user stays on the page and normally navigates later, e.g workspace change", async () => {
        function HostWithWorkspaces() {
            const [workspace, setWorkspace] = useState("Workspace A");

            return (
                <>
                    {/* A workspace switch mounts the host UI again, like a new key does */}
                    <LanguageChangedToast key={workspace} />
                    <button onClick={() => setWorkspace("Workspace B")}>Switch workspace</button>
                </>
            );
        }
        const { user } = render(<HostWithWorkspaces />);
        // Saved, but at the browser's "Leave site?" the user chose to stay, e.g. to keep unsaved edits
        rememberLanguageChange();

        await user.click(screen.getByRole("button", { name: "Switch workspace" }));

        expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });
});
