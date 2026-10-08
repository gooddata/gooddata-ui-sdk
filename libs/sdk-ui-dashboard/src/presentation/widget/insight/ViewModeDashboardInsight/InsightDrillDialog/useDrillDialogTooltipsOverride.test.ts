// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
    DRILL_DIALOG_OPENED_CLASSNAME,
    DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE,
    useDrillDialogTooltipsOverride,
} from "./useDrillDialogTooltipsOverride.js";

function isBodyMarked() {
    return document.body.classList.contains(DRILL_DIALOG_OPENED_CLASSNAME);
}

describe("useDrillDialogTooltipsOverride", () => {
    afterEach(() => {
        document.body.removeAttribute(DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE);
        document.body.classList.remove(DRILL_DIALOG_OPENED_CLASSNAME);
    });

    it("adds the drill dialog class to the body while mounted and removes it on unmount", () => {
        const { unmount } = renderHook(() => useDrillDialogTooltipsOverride());

        expect(isBodyMarked()).toBe(true);

        unmount();

        expect(isBodyMarked()).toBe(false);
        expect(document.body.hasAttribute(DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE)).toBe(false);
    });

    it("keeps the drill dialog class until the last open drill dialog unmounts", () => {
        const first = renderHook(() => useDrillDialogTooltipsOverride());
        const second = renderHook(() => useDrillDialogTooltipsOverride());

        first.unmount();

        expect(isBodyMarked()).toBe(true);

        second.unmount();

        expect(isBodyMarked()).toBe(false);
    });

    it("recovers from an invalid open count on the body", () => {
        document.body.setAttribute(DRILL_DIALOG_OPEN_COUNT_ATTRIBUTE, "invalid");
        const { unmount } = renderHook(() => useDrillDialogTooltipsOverride());

        expect(isBodyMarked()).toBe(true);

        unmount();

        expect(isBodyMarked()).toBe(false);
    });
});
