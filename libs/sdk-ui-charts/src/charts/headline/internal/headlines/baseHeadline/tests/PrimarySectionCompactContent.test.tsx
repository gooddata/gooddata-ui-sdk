// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMockUseBaseHeadline } from "./BaseHeadline.test.helpers.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { PrimarySectionCompactContent } from "../PrimarySectionCompactContent.js";
import { PrimarySectionContent } from "../PrimarySectionContent.js";

const useBaseHeadlineMock = vi.hoisted(() => vi.fn());

vi.mock("../BaseHeadlineContext.js", () => ({
    useBaseHeadline: useBaseHeadlineMock,
}));

vi.mock("../PrimarySectionContent.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        PrimarySectionContent: vi.fn(
            (original as { PrimarySectionContent: () => void }).PrimarySectionContent,
        ),
    };
});

const mockUseBaseHeadline = createMockUseBaseHeadline(useBaseHeadlineMock);

describe("PrimarySectionCompactContent", () => {
    const MockContent = vi.mocked(PrimarySectionContent);
    const renderPrimarySectionCompactContent = () => {
        const props = {
            primaryItem: TEST_BASE_HEADLINE_ITEM,
            isOnlyPrimaryItem: false,
        };

        return render(<PrimarySectionCompactContent {...(props as any)} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Should render primary section content with correctly properties", () => {
        mockUseBaseHeadline({ clientHeight: 100 });
        renderPrimarySectionCompactContent();

        expect(MockContent).toHaveBeenCalledWith(
            expect.objectContaining({
                primaryItem: TEST_BASE_HEADLINE_ITEM,
            }),
            undefined,
        );
    });

    it("Should not be call primary section content in cases client height is 0", () => {
        mockUseBaseHeadline({ clientHeight: 0 });
        renderPrimarySectionCompactContent();

        expect(MockContent).not.toHaveBeenCalled();
    });
});
