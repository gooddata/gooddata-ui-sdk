// (C) 2019-2022 GoodData Corporation
import {
    limitingAttributeFilters,
    limitingDateFilters,
    limitingMeasures,
    newTestAttributeFilterHandler,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";
import { describe, it, expect } from "vitest";

describe("AttributeFilterHandler", () => {
    it("staticElements option should replace loaded elements on init", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setLimit(5);
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements option should work properly with loadNextElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setLimit(5);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.loadNextElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements option with setLimitingAttributeFilters() option should throw error on init() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);
        expect(attributeFilterHandler.init).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingMeasures() option should throw error on init() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setLimitingMeasures(limitingMeasures);
        expect(attributeFilterHandler.init).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingDateFilters() option should throw error on init() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);
        expect(attributeFilterHandler.init).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingAttributeFilters() option should throw error on loadInitialElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);
        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingMeasures() option should throw error on loadInitialElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingMeasures(limitingMeasures);
        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingDateFilters() option should throw error on loadInitialElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);
        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("staticElements should be filtered by order()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setLimit(5);
        attributeFilterHandler.setOrder("desc");
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements should be filtered by limit()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setLimit(3);
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements should be filtered by search()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("static");

        attributeFilterHandler.setSearch("Element 0");
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });
});
