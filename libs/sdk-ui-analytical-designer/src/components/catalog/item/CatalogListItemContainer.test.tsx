// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withDragDrop } from "../../../utils/with_drag_drop_context.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { CatalogListItemContainer } from "./CatalogListItemContainer.js";

describe("CatalogListItemContainer", () => {
    describe("Component", () => {
        const Wrapped = withRedux(withDragDrop(withIntl(CatalogListItemContainer)));
        const defaultProps = {
            item: {
                type: "fact",
                identifier: "myIdentifier",
            },
        };

        it("should render draggable catalog list item", () => {
            const { container } = render(<Wrapped {...defaultProps} />);
            expect(container.querySelectorAll(".s-adi-catalog-item-wrapper")).toHaveLength(1);
        });
    });
});
