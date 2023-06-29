// (C) 2019-2022 GoodData Corporation
import {
    limitingAttributeFilters,
    limitingDateFilters,
    limitingMeasures,
    newTestAttributeFilterHandler,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";
import * as elements from "../internal/redux/elements/loadElements.js";
import { BadRequestSdkError } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

describe("AttributeFilterHandler", () => {
    it("loadNextElementsPage() should trigger onLoadNextElementsPageStart() callback", async () => {
        const onLoadNextElementsPageStart = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimit(2);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadNextElementsPageStart(onLoadNextElementsPageStart);
        attributeFilterHandler.loadNextElementsPage("start");

        await waitForAsync();

        expect(onLoadNextElementsPageStart).toHaveBeenCalledTimes(1);
        expect(onLoadNextElementsPageStart.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadNextElementsPage() should not trigger onLoadNextElementsPageStart() callback, when all elements are loaded", async () => {
        const onLoadNextElementsPageStart = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadNextElementsPageStart(onLoadNextElementsPageStart);
        attributeFilterHandler.loadNextElementsPage();

        await waitForAsync();

        expect(onLoadNextElementsPageStart).toHaveBeenCalledTimes(0);
    });

    it("loadNextElementsPage() that was successful should trigger onLoadNextElementsPageSuccess() callback", async () => {
        const onLoadNextElementsPageSuccess = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimit(2);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadNextElementsPageSuccess(onLoadNextElementsPageSuccess);
        attributeFilterHandler.loadNextElementsPage("success");

        await waitForAsync();

        expect(onLoadNextElementsPageSuccess).toHaveBeenCalledTimes(1);
        expect(onLoadNextElementsPageSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadNextElementsPage() that failed should trigger onLoadNextElementsPageError() callback", async () => {
        const onLoadNextElementsPageError = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimit(2);
        attributeFilterHandler.init();
        await waitForAsync();

        vi.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.onLoadNextElementsPageError(onLoadNextElementsPageError);
        attributeFilterHandler.loadNextElementsPage("error");

        await waitForAsync();

        expect(onLoadNextElementsPageError).toHaveBeenCalledTimes(1);
        expect(onLoadNextElementsPageError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadNextElementsPage() that was canceled by another loadNextElementsPage() call should trigger onLoadNextElementsPageCancel() callback", async () => {
        const onLoadNextElementsPageCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimit(2);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadNextElementsPageCancel(onLoadNextElementsPageCancel);
        attributeFilterHandler.loadNextElementsPage("cancel");
        attributeFilterHandler.loadNextElementsPage();

        await waitForAsync();

        expect(onLoadNextElementsPageCancel).toHaveBeenCalledTimes(1);
        expect(onLoadNextElementsPageCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadNextElementsPage() that was canceled by cancelLoadNextElementsLoad() call should trigger onLoadNextElementsPageCancel() callback", async () => {
        const onLoadNextElementsPageCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimit(2);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadNextElementsPageCancel(onLoadNextElementsPageCancel);
        attributeFilterHandler.loadNextElementsPage("cancel");
        attributeFilterHandler.cancelNextElementsPageLoad();
        await waitForAsync();

        expect(onLoadNextElementsPageCancel).toHaveBeenCalledTimes(1);
        expect(onLoadNextElementsPageCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadNextElementsPage() should throw error if it's called before the initialization", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("loadNextElementsPage() should throw error if it's called and there is still running loadInitialElementsPage()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.loadInitialElementsPage();

        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("loadNextElementsPage() should throw error if order() was set before the load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setOrder("desc");

        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("loadNextElementsPage() should throw error if limit() was set before the load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimit(3);
        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("loadNextElementsPage() should throw error if search() was set before the load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setSearch("wonder");
        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("loadNextElementsPage() should throw error if setLimitingAttributeFilters() was set before the load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);
        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("loadNextElementsPage() should throw error if setLimitingMeasures() was set before the load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingMeasures(limitingMeasures);
        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("loadNextElementsPage() should throw error if setLimitingDateFilters() was set before the load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);
        expect(attributeFilterHandler.loadNextElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("getNextElementsPageStatus() should return proper status for successful load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        expect(attributeFilterHandler.getNextElementsPageStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getNextElementsPageStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getNextElementsPageStatus()).toMatchSnapshot("after the load");
    });

    it("getNextElementsPageStatus() should return proper status for failed load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        expect(attributeFilterHandler.getNextElementsPageStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getNextElementsPageStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getNextElementsPageStatus()).toMatchSnapshot("after the load");
    });

    it("getNextElementsPageError() should return error", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimit(2);
        attributeFilterHandler.init();
        await waitForAsync();

        vi.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.loadNextElementsPage();

        await waitForAsync();

        expect(attributeFilterHandler.getNextElementsPageError()).toMatchSnapshot();
    });
});
