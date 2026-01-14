// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";

import {
    emptyPositiveAttributeFilterDefaultDF,
    limitingAttributeFilters,
    limitingDateFilters,
    limitingMeasures,
    newTestAttributeFilterHandlerWithAttributeFilter,
    staticElements,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";

describe("AttributeFilterHandler", () => {
    it("staticElements option should replace loaded elements on init", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimit(5);
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements option should work properly with loadNextElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimit(5);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.loadNextElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements option with setLimitingAttributeFilters() option should throw error on init() call", () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);
        expect(attributeFilterHandler.init).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingMeasures() option should throw error on init() call", () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimitingMeasures(limitingMeasures);
        expect(attributeFilterHandler.init).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingValidationItems() option should throw error on init() call", () => {
        const metricRefs = [ReferenceMd.Amount.measure.definition.measureDefinition.item];
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimitingValidationItems(metricRefs);
        expect(attributeFilterHandler.init).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingDateFilters() option should throw error on init() call", () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);
        expect(attributeFilterHandler.init).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingAttributeFilters() option should throw error on loadInitialElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);
        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingMeasures() option should throw error on loadInitialElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingMeasures(limitingMeasures);
        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingValidationItems() option should throw error on loadInitialElementsPage() call", async () => {
        const metricRefs = [ReferenceMd.Amount.measure.definition.measureDefinition.item];
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingValidationItems(metricRefs);
        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("staticElements option with setLimitingDateFilters() option should throw error on loadInitialElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);
        expect(attributeFilterHandler.loadInitialElementsPage).toThrowErrorMatchingSnapshot();
    });

    it("staticElements should be filtered by order()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimit(5);
        attributeFilterHandler.setOrder("desc");
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements should be filtered by limit()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setLimit(3);
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("staticElements should be filtered by search()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            emptyPositiveAttributeFilterDefaultDF,
            { staticElements },
        );

        attributeFilterHandler.setSearch("Element 0");
        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });
});
