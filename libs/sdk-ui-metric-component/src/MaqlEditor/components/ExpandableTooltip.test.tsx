// (C) 2026 GoodData Corporation

import { type MutableRefObject, createRef } from "react";

import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FLOATING_ELEMENT_DATA_ATTR, Overlay, isClickInsideOwnSubtree } from "@gooddata/sdk-ui-kit";

import { type IRootRef, destroyTooltip, renderTooltip } from "./ExpandableTooltip.js";

/**
 * A hovered MAQL token as Monaco renders it: a span inside the editor's container node. happy-dom
 * lays nothing out, so the span gets a real rectangle for the tooltip's element validation.
 */
function createEditor(parent: HTMLElement): { editor: HTMLElement; hovered: HTMLElement } {
    const editor = document.createElement("div");
    const hovered = document.createElement("span");
    hovered.getBoundingClientRect = () =>
        ({ top: 10, left: 10, width: 50, height: 20, right: 60, bottom: 30, x: 10, y: 10 }) as DOMRect;
    editor.appendChild(hovered);
    parent.appendChild(editor);
    return { editor, hovered };
}

async function openTooltip(
    ref: MutableRefObject<IRootRef | null>,
    settings: { elements: HTMLElement[]; anchor?: HTMLElement; onOpen?: () => void },
): Promise<HTMLElement> {
    await act(async () => {
        renderTooltip(ref, { onOpen: () => {}, ...settings }, <div>metric detail</div>);
    });
    const editIcon = document.querySelector<HTMLElement>(".s-maql_tooltip-open");
    expect(editIcon).not.toBeNull();
    return editIcon!;
}

describe("ExpandableTooltip outside-click attribution", () => {
    const ref: MutableRefObject<IRootRef | null> = { current: null };

    afterEach(() => {
        destroyTooltip(ref);
        document.body.innerHTML = "";
    });

    it("marks the tooltip as a floating element owned by the anchor's subtree", async () => {
        const owner = document.createElement("div");
        document.body.appendChild(owner);
        const { editor, hovered } = createEditor(owner);
        const stranger = document.createElement("div");
        document.body.appendChild(stranger);

        const editIcon = await openTooltip(ref, { elements: [hovered], anchor: editor });

        // the tooltip lives in its own React root on <body>, so DOM containment alone cannot see it
        expect(owner.contains(editIcon)).toBe(false);
        expect(editIcon.closest(`[${FLOATING_ELEMENT_DATA_ATTR}]`)).not.toBeNull();
        // ...but the anchor chain resolves it to the editor's owner, and only to that owner
        expect(isClickInsideOwnSubtree(editIcon, owner)).toBe(true);
        expect(isClickInsideOwnSubtree(editIcon, stranger)).toBe(false);
    });

    it("falls back to the first hovered element as the anchor", async () => {
        const owner = document.createElement("div");
        document.body.appendChild(owner);
        const { hovered } = createEditor(owner);

        const editIcon = await openTooltip(ref, { elements: [hovered] });

        expect(isClickInsideOwnSubtree(editIcon, owner)).toBe(true);
    });

    it("keeps the edit click attributable after the click tore the tooltip down", async () => {
        const owner = document.createElement("div");
        document.body.appendChild(owner);
        const { editor, hovered } = createEditor(owner);
        const onOpen = vi.fn();

        const editIcon = await openTooltip(ref, { elements: [hovered], anchor: editor, onOpen });
        await act(async () => {
            fireEvent.click(editIcon);
        });

        expect(onOpen).toHaveBeenCalledTimes(1);
        expect(ref.current).toBeNull();
        expect(document.querySelector(".s-maql_tooltip-open")).toBeNull();
        // the click handler unmounts the tooltip before document-level listeners run, so they see
        // a detached target — it must still resolve to the owner through the anchor chain
        expect(isClickInsideOwnSubtree(editIcon, owner)).toBe(true);
    });

    it("does not close an enclosing outside-click overlay when the edit icon is clicked", async () => {
        const onClose = vi.fn();
        const overlayRef = createRef<Overlay>();
        const editorHost = createRef<HTMLDivElement>();
        render(
            <Overlay ref={overlayRef} closeOnOutsideClick onClose={onClose}>
                <div ref={editorHost} />
            </Overlay>,
        );
        const { editor, hovered } = createEditor(editorHost.current!);
        const outside = document.createElement("div");
        document.body.appendChild(outside);
        await act(async () => {
            overlayRef.current!.align();
            await new Promise((resolve) => setTimeout(resolve, 20));
        });

        const editIcon = await openTooltip(ref, { elements: [hovered], anchor: editor });
        fireEvent.mouseDown(editIcon);
        await act(async () => {
            fireEvent.click(editIcon);
        });
        expect(onClose).not.toHaveBeenCalled();

        // the overlay still closes on a genuine outside click
        fireEvent.mouseDown(outside);
        fireEvent.click(outside);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
