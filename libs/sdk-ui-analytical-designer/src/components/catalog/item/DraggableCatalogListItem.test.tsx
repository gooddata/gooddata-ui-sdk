// (C) 2007-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withDragDrop } from "../../../utils/with_drag_drop_context.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { DraggableCatalogListItem } from "./DraggableCatalogListItem.js";

describe("DraggableCatalogListItem", () => {
    describe("Component", () => {
        const Wrapped = withDragDrop(withRedux(withIntl(DraggableCatalogListItem)));

        function renderComponent(item: ComponentProps<typeof DraggableCatalogListItem>["item"]) {
            const dispatch = vi.fn();
            return render(<Wrapped item={item} dispatch={dispatch} />);
        }

        const dateItem = {
            identifier: "sample_date",
            title: "Some title",
            type: "date",
            isAvailable: true,
            summary: "Some interesting summary",
        };

        it("should render catalogItem if date item is supplied", () => {
            const { container } = renderComponent(dateItem);
            expect(container.querySelectorAll(".s-catalog-item")).toHaveLength(1);
        });
    });
});
