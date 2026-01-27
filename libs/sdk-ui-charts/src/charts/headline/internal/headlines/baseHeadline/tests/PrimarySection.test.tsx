// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMockUseBaseHeadline } from "./BaseHeadline.test.helpers.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { PrimarySection } from "../PrimarySection.js";
import { PrimarySectionCompactContent } from "../PrimarySectionCompactContent.js";
import { PrimarySectionContent } from "../PrimarySectionContent.js";

const useBaseHeadlineMock = vi.hoisted(() => vi.fn());

vi.mock("../BaseHeadlineContext.js", () => ({
    useBaseHeadline: useBaseHeadlineMock,
}));

vi.mock("../PrimarySectionCompactContent.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        PrimarySectionCompactContent: vi.fn(
            (original as { PrimarySectionCompactContent: () => void }).PrimarySectionCompactContent,
        ),
    };
});

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

describe("PrimarySection", () => {
    const MockContent = vi.mocked(PrimarySectionContent);
    const MockCompactContent = vi.mocked(PrimarySectionCompactContent);

    const renderPrimarySection = () => {
        const props = {
            primaryItem: TEST_BASE_HEADLINE_ITEM,
            isOnlyPrimaryItem: false,
        };
        return render(<PrimarySection {...(props as any)} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Should render primary compact content while enable compact size", () => {
        mockUseBaseHeadline({
            config: {
                enableCompactSize: true,
            },
        });

        renderPrimarySection();

        expect(MockContent).not.toHaveBeenCalled();
        expect(MockCompactContent).toHaveBeenCalledWith(
            expect.objectContaining({
                primaryItem: TEST_BASE_HEADLINE_ITEM,
                isOnlyPrimaryItem: false,
            }),
            undefined,
        );
    });

    it("Should render primary content while do not enable compact size", () => {
        mockUseBaseHeadline({
            config: {
                enableCompactSize: false,
            },
        });

        renderPrimarySection();

        expect(MockContent).toHaveBeenCalledWith(
            expect.objectContaining({
                primaryItem: TEST_BASE_HEADLINE_ITEM,
            }),
            undefined,
        );
        expect(MockCompactContent).not.toHaveBeenCalled();
    });
});
