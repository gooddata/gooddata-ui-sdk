// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AttributeListItem } from "../AttributeListItem.js";
import { AttributeListItemTooltip } from "../attributeListItemTooltip/AttributeListItemTooltip.js";

vi.mock("../attributeListItemTooltip/AttributeListItemTooltip.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        AttributeListItemTooltip: vi.fn(),
    };
});

describe("AttributeListItem", () => {
    const renderAttributeListItem = (attribute: any, isLocationIconEnabled: boolean) => {
        return render(
            <AttributeListItem
                item={attribute}
                isLocationIconEnabled={isLocationIconEnabled}
                onClick={vi.fn()}
            />,
        );
    };

    describe("Item icon", () => {
        beforeEach(() => {
            vi.mocked(AttributeListItemTooltip).mockImplementation(() => null);
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        const mockAttribute = {
            type: "attribute",
            attribute: {
                id: "attribute_id",
                title: "Attribute title",
                ref: "attribute_ref",
            },
            defaultDisplayForm: { ref: "attribute_ref" },
            displayForms: [],
            geoPinDisplayForms: [],
            groups: [],
        };

        it("should render attribute icon when location icon is disabled", () => {
            const { container } = renderAttributeListItem(mockAttribute, false);
            expect(container.querySelector(".type-attribute")).toBeTruthy();
            expect(container.querySelector(".type-geo_attribute")).toBeFalsy();
        });

        it("should render attribute icon when location icon is enabled and geoPinDisplayForms is empty", () => {
            const { container } = renderAttributeListItem(mockAttribute, true);
            expect(container.querySelector(".type-attribute")).toBeTruthy();
            expect(container.querySelector(".type-geo_attribute")).toBeFalsy();
        });

        it("should render attribute icon when location icon is disabled and geoPinDisplayForms is not empty", () => {
            const { container } = renderAttributeListItem(
                {
                    ...mockAttribute,
                    geoPinDisplayForms: [{}],
                },
                false,
            );
            expect(container.querySelector(".type-attribute")).toBeTruthy();
            expect(container.querySelector(".type-geo_attribute")).toBeFalsy();
        });

        it("should render geo icon when location icon is enabled and geoPinDisplayForms is not empty", () => {
            const { container } = renderAttributeListItem(
                {
                    ...mockAttribute,
                    geoPinDisplayForms: [{}],
                },
                true,
            );
            expect(container.querySelector(".type-attribute")).toBeFalsy();
            expect(container.querySelector(".type-geo_attribute")).toBeTruthy();
        });
    });
});
