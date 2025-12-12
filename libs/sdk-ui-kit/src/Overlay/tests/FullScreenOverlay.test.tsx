// (C) 2007-2025 GoodData Corporation

import { type RefObject, createRef } from "react";

import { flushSync } from "react-dom";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FullScreenOverlay } from "../FullScreenOverlay.js";

describe("FullScreen Overlay", () => {
    let root: Root;
    let container: HTMLDivElement;
    let overlayRef: RefObject<FullScreenOverlay | null>;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        overlayRef = createRef<FullScreenOverlay | null>();

        root = createRoot(container);
        flushSync(() => {
            root.render(<FullScreenOverlay ref={overlayRef}>Content</FullScreenOverlay>);
        });
    });

    afterEach(() => {
        if (root) {
            root.unmount();
        }
        if (container && document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    describe("render", () => {
        it("should set fixed position to overlay", () => {
            const styles = overlayRef.current?.getOverlayStyles();
            expect(styles?.position).toEqual("fixed");
        });

        it("should set proper styles to body", () => {
            expect(getComputedStyle(document.body).overflow).toEqual("hidden");
        });

        it("should scroll body to top", () => {
            expect(document.body.scrollTop).toEqual(0);
        });
    });
});
