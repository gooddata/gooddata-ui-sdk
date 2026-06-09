// (C) 2019-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type Matcher, suppressConsole } from "@gooddata/util";

import {
    newTestAttributeFilterHandler,
    newTestAttributeFilterHandlerWithAttributeFilter,
    positiveAttributeFilterDefaultDF,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";

describe("AttributeFilterHandler", () => {
    const commonErrorOuptput: Matcher[] = [
        {
            type: "startsWith",
            value: "Error while loading attribute:",
        },
        {
            type: "startsWith",
            value: "Error while initializing:",
        },
    ];

    it("init() should trigger onInitStart() callback", async () => {
        const onInitStart = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.onInitStart(onInitStart);
        attributeFilterHandler.init("start");

        await waitForAsync();

        expect(onInitStart).toHaveBeenCalledTimes(1);
        expect(onInitStart.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("init() that was successful should trigger onInitSuccess() callback", async () => {
        const onInitSuccess = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.onInitSuccess(onInitSuccess);
        attributeFilterHandler.init("success");

        await waitForAsync();

        expect(onInitSuccess).toHaveBeenCalledTimes(1);
        expect(onInitSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("init() that failed should trigger onInitError() callback", async () => {
        const onInitError = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.onInitError(onInitError);
        attributeFilterHandler.init("error");

        await suppressConsole(waitForAsync, "error", commonErrorOuptput);

        expect(onInitError).toHaveBeenCalledTimes(1);
        expect(onInitError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("init() that was canceled should trigger onInitCancel() callback", async () => {
        const onInitCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.onInitCancel(onInitCancel);

        attributeFilterHandler.init("cancel");
        attributeFilterHandler.init();

        await waitForAsync();

        expect(onInitCancel).toHaveBeenCalledTimes(1);
        expect(onInitCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("getInitStatus() should return proper status for successful load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("after the load");
    });

    it("getInitStatus() should return proper status for failed load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("during the load");

        await suppressConsole(waitForAsync, "error", commonErrorOuptput);

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("after the load");
    });

    it("getInitError() should return error", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.init();

        await suppressConsole(waitForAsync, "error", commonErrorOuptput);

        expect(attributeFilterHandler.getInitError()).toMatchSnapshot();
    });

    it("getElementsByKey() should return selection elements after successful initialization", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.init();

        await waitForAsync();

        const selection = attributeFilterHandler.getCommittedSelection();
        const elements = attributeFilterHandler.getElementsByKey(selection.keys);
        expect(elements).toMatchSnapshot();
    });

    // Regression tests: switching an attribute filter List -> Text -> List re-inits the handler to
    // load the element options. A plain init re-derives the selection from the filter and overwrites a
    // pending (unapplied) working selection; the preserveWorkingSelection flag avoids that so the
    // restored List selection survives the switch-back.
    describe("init() with preserveWorkingSelection", () => {
        const pendingKeys = ["pending-element-1", "pending-element-2"];

        it("should keep a pending working selection when preserveWorkingSelection is true", async () => {
            const handler = newTestAttributeFilterHandlerWithAttributeFilter(
                positiveAttributeFilterDefaultDF,
            );
            const initialCommitted = handler.getCommittedSelection().keys;
            // The fixture filter carries a selection, so a plain init would have something to re-derive.
            expect(initialCommitted.length).toBeGreaterThan(0);

            // Simulate an unsaved working change (e.g. the user unchecked items) that was NOT applied.
            handler.changeSelection({ keys: pendingKeys, isInverted: false });

            // Switch-back re-init: loads options but must not re-derive the selection from the filter.
            handler.init("switch-back", false, true);
            await waitForAsync();

            expect(handler.getWorkingSelection().keys).toEqual(pendingKeys);
            // The committed (applied) selection is left untouched.
            expect(handler.getCommittedSelection().keys).toEqual(initialCommitted);
        });

        it("should re-derive the working selection from the filter without preserveWorkingSelection", async () => {
            const handler = newTestAttributeFilterHandlerWithAttributeFilter(
                positiveAttributeFilterDefaultDF,
            );
            handler.changeSelection({ keys: pendingKeys, isInverted: false });

            // A plain init re-derives the selection from the filter, discarding the pending change.
            // This is the behavior preserveWorkingSelection guards the switch-back path against.
            handler.init("regular");
            await waitForAsync();

            expect(handler.getWorkingSelection().keys).not.toEqual(pendingKeys);
            expect(handler.getWorkingSelection().keys).toEqual(handler.getCommittedSelection().keys);
        });
    });
});
