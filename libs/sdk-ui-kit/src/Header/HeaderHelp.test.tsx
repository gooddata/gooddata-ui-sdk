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

        await user.click(screen.getByRole("button", { name: "Help" }));
        fireEvent.click(await screen.findByRole("option", { name: "Documentation" }), { metaKey: true });

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
});
