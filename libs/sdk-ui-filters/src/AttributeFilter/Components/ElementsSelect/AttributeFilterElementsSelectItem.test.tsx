// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAttributeElement } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { AttributeFilterElementsSelectItem } from "./AttributeFilterElementsSelectItem.js";
import { type IAttributeFilterElementsSelectItemProps } from "./types.js";

const Wrapped = withIntlForTest(AttributeFilterElementsSelectItem);

function renderItem(item: IAttributeElement, props: Partial<IAttributeFilterElementsSelectItemProps> = {}) {
    return render(
        <Wrapped
            item={item}
            isSelected={false}
            onSelect={vi.fn()}
            onSelectOnly={vi.fn()}
            onDeselect={vi.fn()}
            primaryLabelTitle="Amount"
            {...props}
        />,
    );
}

describe("AttributeFilterElementsSelectItem", () => {
    it("shows the raw value in the tooltip of a number-formatted element", async () => {
        renderItem({ title: "1.2349", uri: "1.2349", formattedTitle: "1.23" }, { rawValueTitle: "1.2349" });

        expect(screen.getByText("1.23")).toBeInTheDocument();
        const cells = screen.getAllByRole("gridcell");
        expect(cells).toHaveLength(3);

        fireEvent.mouseEnter(cells[2].firstElementChild!);

        await waitFor(() => {
            expect(screen.getAllByText("1.2349").length).toBeGreaterThan(0);
        });
        expect(screen.getAllByText("Amount").length).toBeGreaterThan(0);
    });

    it("has no tooltip when the element has neither another primary value nor a raw value to show", () => {
        renderItem({ title: "1234.5", uri: "1234.5", formattedTitle: "1,234.5" });

        expect(screen.getAllByRole("gridcell")).toHaveLength(2);
        expect(screen.queryByText("1234.5")).not.toBeInTheDocument();
    });
});
