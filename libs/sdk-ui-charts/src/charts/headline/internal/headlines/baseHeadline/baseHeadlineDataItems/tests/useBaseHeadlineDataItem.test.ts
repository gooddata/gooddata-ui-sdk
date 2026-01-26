// (C) 2023-2025 GoodData Corporation
import { renderHook } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { TEST_DATA_ITEM } from "../../../../tests/TestData.fixtures.js";
import { mockUseBaseHeadline } from "../../tests/BaseHeadline.test.helpers.js";
import { useBaseHeadlineDataItem } from "../useBaseHeadlineDataItem.js";

describe("useBaseHeadlineDataItem", () => {
    beforeEach(() => {
        mockUseBaseHeadline();
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("Should snapshot correctly", () => {
        const { result } = renderHook(() => useBaseHeadlineDataItem(TEST_DATA_ITEM));

        expect(result.current.formattedItem).toBeTruthy();
    });
});
