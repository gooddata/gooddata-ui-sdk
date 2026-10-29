// (C) 2026 GoodData Corporation

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../test/render.js";

import { HeaderHelp } from "./HeaderHelp.js";

// Without an href: the entries are real anchors and navigation is left to the browser, so a clicked
// item that points somewhere would send the test environment's window off to that address.
const documentationItem = { key: "docs", label: "Documentation" };

describe("HeaderHelp", () => {
    it("passes the clicked item together with its mouse event to onMenuItemClick", async () => {
        const clickSpy = vi.fn();
        const { user } = render(
            <HeaderHelp className="" items={[documentationItem]} onMenuItemClick={clickSpy} />,
        );

        await user.click(screen.getByRole("button", { name: "Help" }));
        await user.click(await screen.findByRole("option", { name: "Documentation" }));

        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(clickSpy).toHaveBeenCalledWith(documentationItem, expect.objectContaining({ type: "click" }));
    });

    it("forwards a modified click on a real link without cancelling it", async () => {
        // Hash href, no target: a genuine link the test DOM can follow without fetching anything.
        const docsLink = { key: "docs", label: "Documentation", href: "#docs" };
        const clickSpy = vi.fn();
        const { user } = render(<HeaderHelp className="" items={[docsLink]} onMenuItemClick={clickSpy} />);
        const urlBeforeClick = window.location.href;

        await user.click(screen.getByRole("button", { name: "Help" }));
        fireEvent.click(await screen.findByRole("option", { name: "Documentation" }), { metaKey: true });
        // The followed link left #docs in the URL, which later test files in this worker would inherit.
        window.history.replaceState(null, "", urlBeforeClick);

        expect(clickSpy).toHaveBeenCalledWith(
            docsLink,
            expect.objectContaining({ metaKey: true, defaultPrevented: false }),
        );
    });

    it("closes the menu once an item is clicked", async () => {
        const { user } = render(<HeaderHelp className="" items={[documentationItem]} />);

        await user.click(screen.getByRole("button", { name: "Help" }));
        await user.click(await screen.findByRole("option", { name: "Documentation" }));

        expect(screen.queryByRole("option", { name: "Documentation" })).not.toBeInTheDocument();
    });

    it("points aria-controls at the open menu", async () => {
        const { user } = render(<HeaderHelp className="" items={[documentationItem]} />);
        const button = screen.getByRole("button", { name: "Help" });

        await user.click(button);

        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(document.getElementById(button.getAttribute("aria-controls") ?? "")).toBeInTheDocument();
    });

    it("does not announce a popup when the dropdown is disabled", async () => {
        const { user } = render(<HeaderHelp className="" items={[documentationItem]} disableDropdown />);
        const button = screen.getByRole("button", { name: "Help" });

        await user.click(button);

        expect(button).not.toHaveAttribute("aria-expanded");
        expect(button).not.toHaveAttribute("aria-controls");
        expect(button).not.toHaveAttribute("aria-haspopup");
    });
});
