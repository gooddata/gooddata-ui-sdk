// (C) 2026 GoodData Corporation

import { useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UiModalOwnerProvider, modalOwnerAttributes } from "../UiFocusManager/UiModalOwner.js";

import { UiDrawer } from "./UiDrawer.js";

function Drawer({ showCloseButton, refocusKey }: { showCloseButton: boolean; refocusKey: number }) {
    return (
        <UiDrawer
            open
            transition={{ duration: 0 }}
            showCloseButton={showCloseButton}
            refocusKey={refocusKey}
            header={<button type="button">Header action</button>}
        >
            <p>Text only</p>
        </UiDrawer>
    );
}

describe("UiDrawer", () => {
    it("refocuses the drawer content, header included, after the close button is hidden", async () => {
        const { rerender } = render(<Drawer showCloseButton refocusKey={0} />);
        await waitFor(() => expect(screen.getByRole("button", { name: "Close" })).toHaveFocus());

        rerender(<Drawer showCloseButton={false} refocusKey={1} />);

        await waitFor(() => expect(screen.getByRole("button", { name: "Header action" })).toHaveFocus());
    });

    it("takes focus when opened from a modal that owns it", async () => {
        function ModalWithDrawer({ drawer }: { drawer: boolean }) {
            const [modal, setModal] = useState<HTMLDivElement | null>(null);
            return (
                <div
                    ref={setModal}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Dialog"
                    {...modalOwnerAttributes}
                >
                    <UiModalOwnerProvider modal={modal}>
                        <button type="button">Open drawer</button>
                        <UiDrawer open={drawer} transition={{ duration: 0 }}>
                            <p>Text only</p>
                        </UiDrawer>
                    </UiModalOwnerProvider>
                </div>
            );
        }
        const { rerender } = render(<ModalWithDrawer drawer={false} />);
        screen.getByRole("button", { name: "Open drawer" }).focus();

        rerender(<ModalWithDrawer drawer />);

        await waitFor(() => expect(screen.getByRole("button", { name: "Close" })).toHaveFocus());
    });
});
