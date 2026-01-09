// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockUseBaseHeadline } from "./BaseHeadlineMock.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { PrimarySection } from "../PrimarySection.js";
import * as PrimarySectionCompactContent from "../PrimarySectionCompactContent.js";
import * as PrimarySectionContent from "../PrimarySectionContent.js";

describe("PrimarySection", () => {
    let MockContent: MockInstance;
    let MockCompactContent: MockInstance;

    const renderPrimarySection = () => {
        const props = {
            primaryItem: TEST_BASE_HEADLINE_ITEM,
            isOnlyPrimaryItem: false,
        };
        return render(<PrimarySection {...(props as any)} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        MockContent = vi.spyOn(PrimarySectionContent, "PrimarySectionContent");
        MockCompactContent = vi.spyOn(PrimarySectionCompactContent, "PrimarySectionCompactContent");
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
