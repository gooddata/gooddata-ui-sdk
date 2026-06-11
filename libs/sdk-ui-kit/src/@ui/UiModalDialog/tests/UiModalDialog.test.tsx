// (C) 2026 GoodData Corporation

import { FloatingPortal } from "@floating-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UiModalDialog } from "../UiModalDialog.js";

describe("UiModalDialog", () => {
    it("does not render when isOpen is false", () => {
        render(
            <UiModalDialog isOpen={false} onClose={() => {}}>
                <div>content</div>
            </UiModalDialog>,
        );
        expect(screen.queryByText("content")).not.toBeInTheDocument();
    });

    it("renders its content when open", () => {
        render(
            <UiModalDialog isOpen onClose={() => {}}>
                <div>content</div>
            </UiModalDialog>,
        );
        expect(screen.getByText("content")).toBeInTheDocument();
    });

    it("portals the content out of the caller's DOM subtree", () => {
        const { container } = render(
            <UiModalDialog isOpen onClose={() => {}}>
                <div>content</div>
            </UiModalDialog>,
        );
        expect(container.textContent).toBe("");
    });

    it("calls onClose when Escape is pressed inside the dialog", () => {
        const onClose = vi.fn();
        render(
            <UiModalDialog isOpen onClose={onClose}>
                <button>content</button>
            </UiModalDialog>,
        );
        fireEvent.keyDown(screen.getByText("content"), { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when Escape comes from a nested floating-ui portal", () => {
        const onClose = vi.fn();
        render(
            <UiModalDialog isOpen onClose={onClose}>
                <div>content</div>
                <FloatingPortal>
                    <button>popup-option</button>
                </FloatingPortal>
            </UiModalDialog>,
        );
        // React-bubbles through the modal's card onKeyDown, but DOM target sits
        // in a sibling [data-floating-ui-portal]; the card's contains check
        // must keep onClose silent so the inner popover handles its own dismiss.
        fireEvent.keyDown(screen.getByText("popup-option"), { key: "Escape" });
        expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when the backdrop is clicked", () => {
        const onClose = vi.fn();
        render(
            <UiModalDialog isOpen onClose={onClose} dataTestId="modal">
                <div>content</div>
            </UiModalDialog>,
        );
        fireEvent.mouseDown(screen.getByTestId("modal"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("focuses the autofocus target when present", async () => {
        render(
            <UiModalDialog isOpen onClose={() => {}}>
                <button>first</button>
                <button autoFocus>second</button>
            </UiModalDialog>,
        );
        await waitFor(() => expect(screen.getByText("second")).toHaveFocus());
    });

    it("focuses the first focusable element without an autofocus target", async () => {
        render(
            <UiModalDialog isOpen onClose={() => {}}>
                <button>first</button>
                <button>second</button>
            </UiModalDialog>,
        );
        await waitFor(() => expect(screen.getByText("first")).toHaveFocus());
    });
});
