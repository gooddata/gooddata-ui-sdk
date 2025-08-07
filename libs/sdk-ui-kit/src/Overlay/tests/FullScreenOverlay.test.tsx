// (C) 2007-2025 GoodData Corporation
import React, { CSSProperties } from "react";
import { renderIntoDocumentWithUnmount } from "../../test/utils.js";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { suppressConsole } from "@gooddata/util";

import { FullScreenOverlay } from "../FullScreenOverlay.js";

function renderOverlay(options: any) {
    return renderIntoDocumentWithUnmount(<FullScreenOverlay {...options} />);
}

describe("FullScreen Overlay", () => {
    let fullScreenOverlay: any;

    beforeEach(() => {
        fullScreenOverlay = suppressConsole(() => renderOverlay({}), "error", [
            { type: "includes", value: "ReactDOM.render" }, // TODO: Remove this in react 19 upgrade
        ]);
    });

    afterEach(() => {
        fullScreenOverlay.unmount();
    });

    describe("render", () => {
        it("should set fixed position to overlay", () => {
            expect(
                (
                    suppressConsole(fullScreenOverlay.getOverlayStyles, "error", [
                        {
                            type: "includes",
                            value: "ReactDOM.render", // TODO: Remove this in react 19 upgrade
                        },
                    ]) as CSSProperties
                ).position,
            ).toEqual("fixed");
        });

        it("should set proper styles to body", () => {
            expect(getComputedStyle(document.body).overflow).toEqual("hidden");
        });

        it("should scroll body to top", () => {
            expect(document.body.scrollTop).toEqual(0);
        });
    });
});
