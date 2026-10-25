// (C) 2019-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GOODSTRAP_SCROLLED_EVENT } from "@gooddata/sdk-ui-kit";

import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { CatalogVisual, type ICatalogVisualProps } from "./CatalogVisual.js";
import { TabIconGroups, TabIcons } from "./model/catalogFilter.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./blocks/AvailableItemsStatus", () => ({
    __esModule: true,
    AvailableItemsStatusPure: vi.fn((props) => (
        <div className="s-available-items-status">{JSON.stringify(props)}</div>
    )),
}));

vi.mock("./blocks/CatalogSearch", () => ({
    __esModule: true,
    CatalogSearch: vi.fn((props) => <div className="s-catalog-search">{JSON.stringify(props)}</div>),
}));

vi.mock("./blocks/CatalogFilterTabIcons", () => ({
    __esModule: true,
    CatalogFilterTabIcons: vi.fn((props) => <div className="s-catalog-tabs">{JSON.stringify(props)}</div>),
}));

describe("CatalogVisual", () => {
    const testCatalogProps: ICatalogVisualProps = {
        searchState: {
            query: "search query",
            debouncedQuery: "search query",
            state: "idle",
        },
        tabs: [],
        showDateItem: true,
        itemGroups: [],
        allItems: [],
        relatedItems: [],
        isRelatedLoading: false,
        isLoadingGroups: false,
        isLoadingItems: false,
        hiddenItemsCount: 0,
        onSearchQueryChange: (v) => v,
        onTabChanged: (v) => v,
        onGroupClick: (v) => v,
        requestCatalogRefresh: () => {},
        updatedItemsCount: 0,
        isWorkspaceEmpty: false,
        canManageProject: true,
        isFreemiumEdition: false,
        linkToDatasourcePage: "/data",
        tabSelectionStates: [true, false, false],
        isEnhancedInsightPickerEnabled: false,
    };

    const mountComponent = (props: Partial<ICatalogVisualProps> = {}) => {
        const Wrapped = withRedux(withIntl(CatalogVisual));
        return render(<Wrapped {...testCatalogProps} {...props} />);
    };

    it("should render search and pass down the value, translated placeholder and callback", () => {
        const { container } = mountComponent();

        const search = JSON.parse(container.querySelector(".s-catalog-search").textContent);

        expect(search).toMatchObject({
            placeholder: "Search data…",
            value: testCatalogProps.searchState.query,
        });
    });

    it("should render tabIcons and pass down the definition of tabIcons, active tabs index and callback", () => {
        const availableTabs = [
            {
                name: TabIcons.FACTS,
                label: "catalog.filter.facts",
                group: TabIconGroups.METRIC_FACT,
            },
            {
                name: TabIcons.ATTRIBUTES,
                label: "catalog.filter.attributes",
                group: TabIconGroups.ATTRIBUTE,
            },
        ];
        const customProps: Partial<ICatalogVisualProps> = {
            tabs: availableTabs,
            tabSelectionStates: [false, false],
        };
        const { container } = mountComponent(customProps);

        const search = JSON.parse(container.querySelector(".s-catalog-tabs").textContent);

        expect(search).toMatchObject({
            availableTabs: availableTabs,
            activeTabs: customProps.tabSelectionStates,
        });
    });

    it("should dispatch GOODSTRAP_SCROLLED_EVENT when scrolling started", () => {
        const { container } = mountComponent();
        const listener = vi.fn();
        container.addEventListener(GOODSTRAP_SCROLLED_EVENT, listener);

        const list = container.querySelector(".adi-catalog-items");
        fireEvent.scroll(list);
        expect(listener).toHaveBeenCalledTimes(1);

        fireEvent.scroll(list);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    describe("Footer panels", () => {
        describe("refresh button", () => {
            it("should display and hide the button on mouse enter and leave", () => {
                const { container } = mountComponent();

                expect(container.querySelector(".s-catalog-refresh-button")).not.toHaveClass("is-visible");

                fireEvent.mouseEnter(container.querySelector(".s-catalog-items"));
                expect(container.querySelector(".s-catalog-refresh-button")).toHaveClass("is-visible");

                fireEvent.mouseLeave(container.querySelector(".s-catalog-items"));
                expect(container.querySelector(".s-catalog-refresh-button")).not.toHaveClass("is-visible");
            });

            it("should invoke refresh of the catalog and hide the button on mouse click", () => {
                const requestCatalogRefresh = vi.fn();
                const { container } = mountComponent({ requestCatalogRefresh });

                fireEvent.mouseEnter(container.querySelector(".s-catalog-items"));
                expect(container.querySelector(".s-catalog-refresh-button")).toHaveClass("is-visible");

                fireEvent.click(container.querySelector(".s-catalog-refresh-button"));
                expect(container.querySelector(".s-catalog-refresh-button")).not.toHaveClass("is-visible");
                expect(requestCatalogRefresh).toHaveBeenCalled();
            });
        });
    });
});
