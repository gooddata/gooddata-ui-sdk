// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type ISelectItem,
    type ISelectItemHeading,
    type ISelectItemOption,
    type ISelectItemSeparator,
} from "./types.js";
import { getSelectableItems } from "./utils.js";

describe("Select utils", () => {
    const optionFirst: ISelectItemOption<string> = { type: "option", value: "first", label: "First" };
    const optionLast: ISelectItemOption<string> = { type: "option", value: "last", label: "Last" };
    const itemSeparator: ISelectItemSeparator = { type: "separator" };
    const itemHeading: ISelectItemHeading = { type: "heading", label: "heading" };

    const sampleItems: Array<ISelectItem<string>> = [optionFirst, itemSeparator, itemHeading, optionLast];

    describe("getSelectableItems", () => {
        it('should filter items and return only items with type "option"', () => {
            expect(getSelectableItems(sampleItems)).toEqual([optionFirst, optionLast]);
        });
    });
});
