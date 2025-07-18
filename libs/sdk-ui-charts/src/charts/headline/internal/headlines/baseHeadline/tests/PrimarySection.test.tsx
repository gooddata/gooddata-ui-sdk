// (C) 2023-2025 GoodData Corporation
import { afterAll, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";
import { render } from "@testing-library/react";
import { mockUseBaseHeadline } from "./BaseHeadlineMock.js";
import PrimarySection from "../PrimarySection.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import * as PrimarySectionContent from "../PrimarySectionContent.js";
import * as PrimarySectionCompactContent from "../PrimarySectionCompactContent.js";

describe("PrimarySection", () => {
    let MockContent: MockInstance;
    let MockCompactContent: MockInstance;

    const renderPrimarySection = () => {
        const props = {
            primaryItem: TEST_BASE_HEADLINE_ITEM,
            isOnlyPrimaryItem: false,
        };
        return render(<PrimarySection {...props} />);
    };

    beforeEach(() => {
        MockContent = vi.spyOn(PrimarySectionContent, "default");
        MockCompactContent = vi.spyOn(PrimarySectionCompactContent, "default");
    });

    afterAll(() => {
        vi.clearAllMocks();
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
            expect.anything(),
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
            expect.anything(),
        );
        expect(MockCompactContent).not.toHaveBeenCalled();
    });
});
