// (C) 2023-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { TEST_DATA_ITEM } from "../../../tests/TestData.test.helpers.js";
import { createBaseHeadlineTestContext } from "../BaseHeadline.test.helpers.js";

import { useBaseHeadlineDataItem } from "./useBaseHeadlineDataItem.js";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

describe("useBaseHeadlineDataItem", () => {
    beforeEach(() => {
        setBaseHeadline();
    });

    it("Should snapshot correctly", () => {
        const { result } = renderHook(() => useBaseHeadlineDataItem(TEST_DATA_ITEM), { wrapper });

        expect(result.current.formattedItem).toBeTruthy();
    });
});
