// (C) 2023-2025 GoodData Corporation

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReactElement } from "react";
import { render } from "@testing-library/react";
import AttributeListItem from "../AttributeListItem.js";
import * as Tooltip from "../attributeListItemTooltip/AttributeListItemTooltip.js";

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
            vi.spyOn(Tooltip, "AttributeListItemTooltip").mockImplementation(
                () => null as unknown as ReactElement,
            );
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
