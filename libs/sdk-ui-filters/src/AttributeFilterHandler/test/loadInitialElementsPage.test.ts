// (C) 2019-2025 GoodData Corporation
import { describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { type ObjRef } from "@gooddata/sdk-model";
import { BadRequestSdkError } from "@gooddata/sdk-ui";
import { suppressConsole } from "@gooddata/util";

import {
    limitingAttributeFilters,
    limitingDateFilters,
    limitingMeasures,
    newTestAttributeFilterHandler,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";
import * as elements from "../internal/redux/elements/loadElements.js";

describe("AttributeFilterHandler", () => {
    it("loadInitialElementsPage() should trigger onLoadInitialElementsPageStart() callback", async () => {
        const onLoadInitialElementsPageStart = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadInitialElementsPageStart(onLoadInitialElementsPageStart);
        attributeFilterHandler.loadInitialElementsPage("start");

        await waitForAsync();

        expect(onLoadInitialElementsPageStart).toHaveBeenCalledTimes(1);
        expect(onLoadInitialElementsPageStart.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadInitialElementsPage() that was successful should trigger onLoadInitialElementsPageSuccess() callback", async () => {
        const onLoadInitialElementsPageSuccess = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadInitialElementsPageSuccess(onLoadInitialElementsPageSuccess);
        attributeFilterHandler.loadInitialElementsPage("success");

        await waitForAsync();

        expect(onLoadInitialElementsPageSuccess).toHaveBeenCalledTimes(1);
        expect(onLoadInitialElementsPageSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadInitialElementsPage() that failed should trigger onLoadInitialElementsPageError() callback", async () => {
        const onLoadInitialElementsPageError = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        vi.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.onLoadInitialElementsPageError(onLoadInitialElementsPageError);
        attributeFilterHandler.loadInitialElementsPage("error");

        await suppressConsole(waitForAsync, "error", [
            {
                type: "exact",
                value: "Error while loading initial elements page: Elements error",
            },
        ]);

        expect(onLoadInitialElementsPageError).toHaveBeenCalledTimes(1);
        expect(onLoadInitialElementsPageError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadInitialElementsPage() that was canceled by another loadInitialElementsPage() call should trigger onLoadInitialElementsPageCancel() callback", async () => {
        const onLoadInitialElementsPageCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadInitialElementsPageCancel(onLoadInitialElementsPageCancel);
        attributeFilterHandler.loadInitialElementsPage("cancel");
        attributeFilterHandler.loadInitialElementsPage();

        await waitForAsync();

        expect(onLoadInitialElementsPageCancel).toHaveBeenCalledTimes(1);
        expect(onLoadInitialElementsPageCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadInitialElementsPage() that was canceled by cancelInitialElementsPageLoad() call should trigger onLoadInitialElementsPageCancel() callback", async () => {
        const onLoadInitialElementsPageCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadInitialElementsPageCancel(onLoadInitialElementsPageCancel);
        attributeFilterHandler.loadInitialElementsPage("cancel");
        attributeFilterHandler.cancelInitialElementsPageLoad();
        await waitForAsync();

        expect(onLoadInitialElementsPageCancel).toHaveBeenCalledTimes(1);
        expect(onLoadInitialElementsPageCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadInitialElementsPage() should throw error if it's called before the initialization", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("getInitialElementsPageStatus() should return proper status for successful load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        expect(attributeFilterHandler.getInitialElementsPageStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getInitialElementsPageStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getInitialElementsPageStatus()).toMatchSnapshot("after the load");
    });

    it("getInitialElementsPageStatus() should return proper status for failed load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        expect(attributeFilterHandler.getInitialElementsPageStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getInitialElementsPageStatus()).toMatchSnapshot("during the load");

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

        expect(attributeFilterHandler.getInitialElementsPageStatus()).toMatchSnapshot("after the load");
    });

    it("getInitialElementsPageError() should return error", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        vi.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.loadInitialElementsPage();

        await suppressConsole(waitForAsync, "error", [
            { type: "exact", value: "Error while loading initial elements page: Elements error" },
        ]);

        expect(attributeFilterHandler.getInitialElementsPageError()).toMatchSnapshot();
    });

    it("loadInitialElementsPage() should be filtered by order()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setOrder("desc");
        attributeFilterHandler.loadInitialElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("loadInitialElementsPage() should be filtered by limit()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimit(3);
        attributeFilterHandler.loadInitialElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("loadInitialElementsPage() should be filtered by search()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setSearch("wonder");
        attributeFilterHandler.loadInitialElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("loadInitialElementsPage() should be filtered by setLimitingAttributeFilters()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);
        attributeFilterHandler.loadInitialElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("loadInitialElementsPage() should be filtered by setLimitingMeasures()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingMeasures(limitingMeasures);
        attributeFilterHandler.loadInitialElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("loadInitialElementsPage() should be filtered by setLimitingValidationItems()", async () => {
        const validationItems: ObjRef[] = [ReferenceMd.Amount.measure.definition.measureDefinition.item];
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingValidationItems(validationItems);
        attributeFilterHandler.loadInitialElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("loadInitialElementsPage() should be filtered by setLimitingDateFilters()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);
        attributeFilterHandler.loadInitialElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });
});
