// (C) 2019-2025 GoodData Corporation
import { describe, expect, it, vi } from "vitest";

import { suppressConsole } from "@gooddata/util";

import {
    newTestAttributeFilterHandler,
    newTestAttributeFilterHandlerWithAttributeFilter,
    positiveAttributeFilterDefaultDF,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";

describe("AttributeFilterHandler", () => {
    it("getAttribute() should return the attribute after successful initialization", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.init();

        await waitForAsync();

        expect(attributeFilterHandler.getAttribute()).toMatchSnapshot();
    });

    it("getAttribute() should return the attribute after successful loadAttribute() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.init();
        await waitForAsync();
        attributeFilterHandler.loadAttribute();
        await waitForAsync();

        expect(attributeFilterHandler.getAttribute()).toMatchSnapshot();
    });

    it("loadAttribute() should trigger onLoadAttributeStart() callback", async () => {
        const onLoadAttributeStart = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeStart(onLoadAttributeStart);
        attributeFilterHandler.loadAttribute("start");

        await waitForAsync();

        expect(onLoadAttributeStart).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeStart.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that was successful should trigger onLoadAttributeSuccess() callback", async () => {
        const onLoadAttributeSuccess = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeSuccess(onLoadAttributeSuccess);
        attributeFilterHandler.loadAttribute("success");

        await waitForAsync();

        expect(onLoadAttributeSuccess).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that failed should trigger onLoadAttributeError() callback", async () => {
        const onLoadAttributeError = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.init();
        await suppressConsole(waitForAsync, "error", [
            {
                type: "startsWith",
                value: "Error while loading attribute:",
            },
            {
                type: "startsWith",
                value: "Error while initializing:",
            },
        ]);

        attributeFilterHandler.onLoadAttributeError(onLoadAttributeError);
        attributeFilterHandler.loadAttribute("error");

        await suppressConsole(waitForAsync, "error", [
            {
                type: "startsWith",
                value: "Error while loading attribute:",
            },
        ]);

        expect(onLoadAttributeError).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that was canceled by another loadAttribute() call should trigger onLoadAttributeCancel() callback", async () => {
        const onLoadAttributeCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeCancel(onLoadAttributeCancel);
        attributeFilterHandler.loadAttribute("cancel");
        attributeFilterHandler.loadAttribute();

        await waitForAsync();

        expect(onLoadAttributeCancel).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that was canceled by cancelAttributeLoad() call should trigger onLoadAttributeCancel() callback", async () => {
        const onLoadAttributeCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeCancel(onLoadAttributeCancel);
        attributeFilterHandler.loadAttribute("cancel");
        attributeFilterHandler.cancelAttributeLoad();
        await waitForAsync();

        expect(onLoadAttributeCancel).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("getAttributeStatus() should return proper status for successful load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
        );

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("after the load");
    });

    it("getAttributeStatus() should return proper status for failed load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("during the load");

        await suppressConsole(waitForAsync, "error", [
            {
                type: "startsWith",
                value: "Error while loading attribute:",
            },
            {
                type: "startsWith",
                value: "Error while initializing:",
            },
        ]);

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("after the load");
    });

    it("getAttributeError() should return error", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.init();

        await suppressConsole(waitForAsync, "error", [
            {
                type: "startsWith",
                value: "Error while loading attribute:",
            },
            {
                type: "startsWith",
                value: "Error while initializing:",
            },
        ]);

        expect(attributeFilterHandler.getAttributeError()).toMatchSnapshot();
    });
});
