// (C) 2023-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { TEST_DATA_ITEM } from "../../../../tests/TestData.fixtures.js";
import { createMockUseBaseHeadline } from "../../tests/BaseHeadline.test.helpers.js";
import { useBaseHeadlineDataItem } from "../useBaseHeadlineDataItem.js";

const useBaseHeadlineMock = vi.hoisted(() => vi.fn());

vi.mock("../../BaseHeadlineContext.js", () => ({
    useBaseHeadline: useBaseHeadlineMock,
}));

const mockUseBaseHeadline = createMockUseBaseHeadline(useBaseHeadlineMock);

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
