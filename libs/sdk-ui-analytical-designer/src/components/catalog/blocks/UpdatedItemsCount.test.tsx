// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { type IUpdatedItemsCountOwnProps, UpdatedItemsCount } from "./UpdatedItemsCount.js";

const mockedTranslations = {
    ["catalog.refresh.no_items_updated"]: "no-items",
    ["catalog.refresh.n_items_updated"]: "{count}-items-updated",
};

describe("UpdatedItemsCount", () => {
    const renderComponent = (customProps: Partial<IUpdatedItemsCountOwnProps> = {}) => {
        return render(
            <IntlProvider locale="en-US" messages={mockedTranslations}>
                <UpdatedItemsCount count={0} {...customProps} />
            </IntlProvider>,
        );
    };

    it("should display message when count of updated items is 0", () => {
        const { container } = renderComponent();
        expect(container.querySelector(".s-catalog-updated-items").textContent).toEqual("no-items");
    });

    it("should display message when count of updated items is not 0", () => {
        const { container } = renderComponent({ count: 123 });
        expect(container.querySelector(".s-catalog-updated-items").textContent).toEqual("123-items-updated");
    });

    it("should add is-visible className to panel when count is defined", () => {
        const { container } = renderComponent();
        expect(container.querySelector(".s-catalog-info-panel")).toHaveClass("is-visible");
    });

    it("should not add is-visible className to panel when count null", () => {
        const { container } = renderComponent({ count: null });
        expect(container.querySelector(".s-catalog-info-panel")).not.toHaveClass("is-visible");
    });
});
