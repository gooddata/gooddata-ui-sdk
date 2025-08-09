// (C) 2023-2025 GoodData Corporation
import React from "react";
import { afterAll, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";
import { render } from "@testing-library/react";
import { mockUseBaseHeadline } from "./BaseHeadlineMock.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { PrimarySectionCompactContent } from "../PrimarySectionCompactContent.js";
import * as PrimarySectionContent from "../PrimarySectionContent.js";

describe("PrimarySectionCompactContent", () => {
    let MockContent: MockInstance;
    const renderPrimarySectionCompactContent = () => {
        const props = {
            primaryItem: TEST_BASE_HEADLINE_ITEM,
            isOnlyPrimaryItem: false,
        };

        return render(<PrimarySectionCompactContent {...props} />);
    };

    beforeEach(() => {
        MockContent = vi.spyOn(PrimarySectionContent, "PrimarySectionContent");
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("Should render primary section content with correctly properties", () => {
        mockUseBaseHeadline({ clientHeight: 100 });
        renderPrimarySectionCompactContent();

        expect(MockContent).toHaveBeenCalledWith(
            expect.objectContaining({
                primaryItem: TEST_BASE_HEADLINE_ITEM,
            }),
            expect.anything(),
        );
    });

    it("Should not be call primary section content in cases client height is 0", () => {
        mockUseBaseHeadline({ clientHeight: 0 });
        renderPrimarySectionCompactContent();

        expect(MockContent).not.toHaveBeenCalled();
    });
});
