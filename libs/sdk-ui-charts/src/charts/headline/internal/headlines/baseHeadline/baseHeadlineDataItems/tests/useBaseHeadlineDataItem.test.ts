// (C) 2023 GoodData Corporation
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useBaseHeadlineDataItem } from "../useBaseHeadlineDataItem.js";
import { mockUseBaseHeadline } from "../../tests/BaseHeadlineMock.js";
import { TEST_DATA_ITEM } from "../../../../tests/TestData.fixtures.js";

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
