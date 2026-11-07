// (C) 2026 GoodData Corporation

import { useState } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import { createPortal } from "react-dom";
import { describe, expect, it } from "vitest";

import { UiAutofocus } from "./UiAutofocus.js";
import { UiModalOwnerProvider, modalOwnerAttributes } from "./UiModalOwner.js";

interface IHarnessProps {
    active: boolean;
    area?: boolean;
    modal?: boolean;
    modalFirst?: boolean;
}

function Harness({ active, area = true, modal = false, modalFirst = false }: IHarnessProps) {
    return (
        <>
            {modal && modalFirst ? (
                <div role="dialog" aria-modal="true" aria-label="Dialog">
                    <button type="button">in dialog</button>
                </div>
            ) : null}
            <button type="button">outside</button>
            {area ? (
                <UiAutofocus active={active}>
                    <button type="button">inside</button>
                </UiAutofocus>
            ) : null}
            {modal && !modalFirst ? (
                <div role="dialog" aria-modal="true" aria-label="Dialog">
                    <button type="button">in dialog</button>
                </div>
            ) : null}
        </>
    );
}

const settle = () =>
    act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
    });

describe("UiAutofocus", () => {
    it("focuses the first focusable element once it is active", async () => {
        render(<Harness active />);

        await waitFor(() => expect(screen.getByText("inside")).toHaveFocus());
    });

    it("takes focus from an element outside it", async () => {
        const { rerender } = render(<Harness active={false} />);
        screen.getByText("outside").focus();

        rerender(<Harness active />);

        await waitFor(() => expect(screen.getByText("inside")).toHaveFocus());
    });

    it("does not take focus back from a modal dialog that opened before it became active", async () => {
        const { rerender } = render(<Harness active={false} />);
        rerender(<Harness active={false} modal />);
        screen.getByText("in dialog").focus();

        rerender(<Harness active modal />);
        await settle();

        expect(screen.getByText("in dialog")).toHaveFocus();
    });

    it("does not take focus from a modal dialog that mounted together with it", async () => {
        const { rerender } = render(<Harness active={false} modal />);
        screen.getByText("in dialog").focus();

        rerender(<Harness active modal />);
        await settle();

        expect(screen.getByText("in dialog")).toHaveFocus();
    });

    it("takes focus from a trigger inside a modal when it is opened from that modal, such as a dropdown", async () => {
        const { rerender } = render(<Harness active={false} area={false} modal modalFirst />);
        screen.getByText("in dialog").focus();

        rerender(<Harness active modal modalFirst />);

        await waitFor(() => expect(screen.getByText("inside")).toHaveFocus());
    });

    it("does not take focus from a modal dialog that it precedes and that was open before it mounted, such as a background panel", async () => {
        const { rerender } = render(<Harness active={false} area={false} modal />);
        screen.getByText("in dialog").focus();

        rerender(<Harness active modal />);
        await settle();

        expect(screen.getByText("in dialog")).toHaveFocus();
    });

    describe("with a modal that owns what it renders", () => {
        interface IOwnedHarnessProps {
            menu?: boolean;
            panel?: boolean;
            portalTarget?: Element;
        }

        function OwnedHarness({ menu = false, panel = false, portalTarget }: IOwnedHarnessProps) {
            const [modal, setModal] = useState<HTMLDivElement | null>(null);
            const menuArea = (
                <UiAutofocus>
                    <button type="button">in menu</button>
                </UiAutofocus>
            );
            return (
                <>
                    {panel ? (
                        <UiAutofocus>
                            <button type="button">in panel</button>
                        </UiAutofocus>
                    ) : null}
                    <div
                        ref={setModal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Dialog"
                        {...modalOwnerAttributes}
                    >
                        <UiModalOwnerProvider modal={modal}>
                            <button type="button">in dialog</button>
                            {menu && portalTarget ? createPortal(menuArea, portalTarget) : null}
                        </UiModalOwnerProvider>
                    </div>
                </>
            );
        }

        it("does not take focus from it when mounted outside it later, such as a background panel", async () => {
            const { rerender } = render(<OwnedHarness />);
            screen.getByText("in dialog").focus();

            rerender(<OwnedHarness panel />);
            await settle();

            expect(screen.getByText("in dialog")).toHaveFocus();
        });

        it("does not take focus from it when mounted outside it in the same render", async () => {
            render(<OwnedHarness panel />);
            screen.getByText("in dialog").focus();
            await settle();

            expect(screen.getByText("in dialog")).toHaveFocus();
        });

        it("takes focus when opened from it into an earlier portal target", async () => {
            const portalTarget = document.createElement("div");
            document.body.prepend(portalTarget);
            const { rerender } = render(<OwnedHarness portalTarget={portalTarget} />);
            screen.getByText("in dialog").focus();

            rerender(<OwnedHarness menu portalTarget={portalTarget} />);

            await waitFor(() => expect(screen.getByText("in menu")).toHaveFocus());
            portalTarget.remove();
        });

        function NestedHarness({ nested = false }: { nested?: boolean }) {
            const [outer, setOuter] = useState<HTMLDivElement | null>(null);
            const [inner, setInner] = useState<HTMLDivElement | null>(null);
            return (
                <div
                    ref={setOuter}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Outer"
                    {...modalOwnerAttributes}
                >
                    <UiModalOwnerProvider modal={outer}>
                        <button type="button">in outer</button>
                        {nested
                            ? createPortal(
                                  <div
                                      ref={setInner}
                                      role="dialog"
                                      aria-modal="true"
                                      aria-label="Inner"
                                      {...modalOwnerAttributes}
                                  >
                                      <UiModalOwnerProvider modal={inner}>
                                          <UiAutofocus>
                                              <button type="button">in nested menu</button>
                                          </UiAutofocus>
                                      </UiModalOwnerProvider>
                                  </div>,
                                  document.body,
                              )
                            : null}
                    </UiModalOwnerProvider>
                </div>
            );
        }

        it("takes focus from an outer modal when it sits in a modal opened from that modal, such as a menu in a drawer opened from a dialog", async () => {
            const { rerender } = render(<NestedHarness />);
            screen.getByText("in outer").focus();

            rerender(<NestedHarness nested />);

            await waitFor(() => expect(screen.getByText("in nested menu")).toHaveFocus());
        });
    });
});
