// (C) 2019-2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    catalogAttributes,
    catalogItems,
    catalogMeasures,
} from "../../../tests/catalog_components.test.helpers.js";
import { TabIconGroups, TabIcons } from "../model/catalogFilter.js";

import { useTabs } from "./TabsHook.js";

describe("useTabs", () => {
    describe("Tab Names", () => {
        const filteredCatalogItems = [catalogMeasures[0], catalogMeasures[2], catalogAttributes[0]];
        it("should have default tab selected", () => {
            const { result } = renderHook(() => useTabs(filteredCatalogItems, catalogItems, false, false));
            expect(result.current.tabSelectionStates).toEqual([true, false, false]);
        });

        it('should return all items and show date when "all" tab is selected', () => {
            const { result } = renderHook(() => useTabs(filteredCatalogItems, catalogItems, false, false));
            act(() => result.current.onTabChanged(0));
            expect(result.current.tabAvailableItems).toEqual(filteredCatalogItems);
            expect(result.current.tabAllItems).toEqual(catalogItems);
            expect(result.current.tabShowDateItem).toEqual(true);
        });

        it('should return metrics and facts when "measures" tab is selected', () => {
            const { result } = renderHook(() => useTabs(filteredCatalogItems, catalogItems, false, false));
            act(() => result.current.onTabChanged(1));
            expect(result.current.tabAvailableItems).toEqual([catalogMeasures[0], catalogMeasures[2]]);
            expect(result.current.tabAllItems).toEqual(catalogMeasures);
            expect(result.current.tabShowDateItem).toEqual(false);
        });

        it('should return attributes and show date when "attributes" tab is selected', () => {
            const { result } = renderHook(() => useTabs(filteredCatalogItems, catalogItems, false, false));
            act(() => result.current.onTabChanged(2));
            expect(result.current.tabAvailableItems).toEqual([catalogAttributes[0]]);
            expect(result.current.tabAllItems).toEqual(catalogAttributes);
            expect(result.current.tabShowDateItem).toEqual(true);
        });

        it("should update the active tab index when callback is called", () => {
            const { result } = renderHook(() => useTabs(filteredCatalogItems, catalogItems, false, false));
            act(() => result.current.onTabChanged(1));
            expect(result.current.tabSelectionStates).toEqual([false, true, false]);
        });
    });

    describe("Tab Icons", () => {
        const metricTab = {
            name: TabIcons.METRICS,
            label: "catalog.filter.metrics",
            group: TabIconGroups.METRIC_FACT,
        };

        const factTab = {
            name: TabIcons.FACTS,
            label: "catalog.filter.facts",
            group: TabIconGroups.METRIC_FACT,
        };

        const attributeTab = {
            name: TabIcons.ATTRIBUTES,
            label: "catalog.filter.attributes",
            group: TabIconGroups.ATTRIBUTE,
        };

        const metricItem = catalogMeasures[0];
        const factItem = catalogMeasures[2];
        const attributeItem = catalogAttributes[0];
        const availableItems = [metricItem, factItem, attributeItem];

        it("should return no tab when dataset is empty", () => {
            const { result } = renderHook(() => useTabs([], [], true, false));

            expect(result.current.tabs).toEqual([]);
        });

        it("should return 3 tabs (Metrics, Facts, Attributes when dataset has metric type, fact type and attribute type", () => {
            const { result } = renderHook(() => useTabs(availableItems, catalogItems, true, false));

            expect(result.current.tabs).toEqual([metricTab, factTab, attributeTab]);
        });

        it("should return 2 tabs (Facts, Attributes) when dataset has fact type and attribute type", () => {
            const { result } = renderHook(() =>
                useTabs([factItem, attributeItem], catalogItems, true, false),
            );
            expect(result.current.tabs).toEqual([factTab, attributeTab]);
        });

        it("should return all items and show date when there are is no tab selected", () => {
            const { result } = renderHook(() => useTabs(availableItems, catalogItems, true, false));

            expect(result.current.tabSelectionStates).toEqual([false, false, false]);
            expect(result.current.tabs).toEqual([metricTab, factTab, attributeTab]);
            expect(result.current.tabAvailableItems).toEqual(availableItems);
            expect(result.current.tabAllItems).toEqual(catalogItems);
            expect(result.current.tabShowDateItem).toEqual(true);
        });

        it("should return metric and fact items and no show date when Metrics ans Facts tab is selected", () => {
            const { result } = renderHook(() => useTabs(availableItems, catalogItems, true, false));

            act(() => result.current.onTabChanged(0, TabIconGroups.METRIC_FACT));
            act(() => result.current.onTabChanged(1, TabIconGroups.METRIC_FACT));

            expect(result.current.tabSelectionStates).toEqual([true, true, false]);
            expect(result.current.tabs).toEqual([metricTab, factTab, attributeTab]);
            expect(result.current.tabAvailableItems).toEqual([metricItem, factItem]);
            expect(result.current.tabAllItems).toEqual(catalogMeasures);
            expect(result.current.tabShowDateItem).toEqual(false);
        });

        it("should return attribute items and show date when Metrics tab is selected first then Attribute tab is selected", () => {
            const { result } = renderHook(() => useTabs(availableItems, catalogItems, true, false));

            act(() => result.current.onTabChanged(0, TabIconGroups.METRIC_FACT));
            act(() => result.current.onTabChanged(2, TabIconGroups.ATTRIBUTE));

            expect(result.current.tabSelectionStates).toEqual([false, false, true]);
            expect(result.current.tabAvailableItems).toEqual([attributeItem]);
            expect(result.current.tabAllItems).toEqual(catalogAttributes);
            expect(result.current.tabShowDateItem).toEqual(true);
        });
    });
});
