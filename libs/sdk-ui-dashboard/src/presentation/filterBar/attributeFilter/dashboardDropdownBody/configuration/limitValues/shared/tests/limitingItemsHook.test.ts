// (C) 2024 GoodData Corporation

import { describe, it, expect } from "vitest";

import { sortByTypeAndTitle, IValuesLimitingItemWithTitle } from "../limitingItemsHook.js";
import { idRef } from "@gooddata/sdk-model";

import { IDashboardAttributeFilterParentItem } from "../../../../../../../../model/index.js";

const buildFilter = (localIdentifier: string, labelId: string): IDashboardAttributeFilterParentItem => ({
    localIdentifier,
    displayForm: idRef(labelId),
    isSelected: false,
    selectedConnectingAttribute: undefined,
});

describe("limitingItemsHook", () => {
    describe("sortByTypeAndTitle", () => {
        it("should sort array of items as expected", () => {
            const items: IValuesLimitingItemWithTitle[] = [
                { item: idRef("a3", "attribute"), title: "Attribute 1" },
                { item: buildFilter("filter2", "label2"), title: "Filter 2" },
                { item: idRef("m0", "measure"), title: undefined },
                { item: buildFilter("filter1", "label1"), title: "Filter 1" },
                { item: idRef("f0", "fact"), title: "Fact 1" },
                { item: idRef("m1", "measure"), title: "Measure 1" },
                { item: idRef("f2", "fact"), title: "Fact 2" },
                { item: idRef("f1", "fact"), title: undefined },
                { item: idRef("a2", "attribute"), title: undefined },
                { item: idRef("m2", "measure"), title: "Measure 2" },
                { item: buildFilter("filter3", "label3"), title: undefined },
                { item: idRef("a1", "attribute"), title: "Attribute 2" },
            ];
            expect(items.sort(sortByTypeAndTitle)).toMatchSnapshot();
        });
    });
});
