// (C) 2007-2020 GoodData Corporation
import React from "react";
import { renderIntoDocumentWithUnmount } from "../../test/utils.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { FullScreenOverlay } from "../FullScreenOverlay.js";

function renderOverlay(options: any) {
    return renderIntoDocumentWithUnmount(<FullScreenOverlay {...options} />);
}

describe("FullScreen Overlay", () => {
    let fullScreenOverlay: any;

    beforeEach(() => {
        fullScreenOverlay = renderOverlay({});
    });

    afterEach(() => {
        fullScreenOverlay.unmount();
    });

    describe("render", () => {
        it("should set fixed position to overlay", () => {
            expect(fullScreenOverlay.getOverlayStyles().position).toEqual("fixed");
        });

        it("should set proper styles to body", () => {
            expect(getComputedStyle(document.body).overflow).toEqual("hidden");
        });

        it("should scroll body to top", () => {
            expect(document.body.scrollTop).toEqual(0);
        });
    });
});
