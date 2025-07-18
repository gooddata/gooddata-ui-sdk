// (C) 2007-2025 GoodData Corporation
import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { FullScreenOverlay } from "../FullScreenOverlay.js";

describe("FullScreen Overlay", () => {
    let unmount: () => void;
    let originalBodyOverflow: string;
    let originalBodyScrollTop: number;

    beforeEach(() => {
        // Store original body styles
        originalBodyOverflow = document.body.style.overflow;
        originalBodyScrollTop = document.body.scrollTop;

        const result = render(
            <FullScreenOverlay>
                <div data-testid="overlay-content">Test Content</div>
            </FullScreenOverlay>,
        );
        unmount = result.unmount;
    });

    afterEach(() => {
        unmount();
        // Restore original body styles
        document.body.style.overflow = originalBodyOverflow;
        document.body.scrollTop = originalBodyScrollTop;
    });

    describe("render", () => {
        it("should set fixed position to overlay", () => {
            // Find the overlay wrapper element
            const overlayWrapper = document.querySelector(".overlay-wrapper");
            expect(overlayWrapper).toBeTruthy();

            const styles = window.getComputedStyle(overlayWrapper as Element);
            expect(styles.position).toEqual("fixed");
        });

        it("should set proper styles to body", () => {
            expect(document.body.style.overflow).toEqual("hidden");
        });

        it("should scroll body to top", () => {
            expect(document.body.scrollTop).toEqual(0);
        });
    });
});
