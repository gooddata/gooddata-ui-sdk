// (C) 2019-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type CatalogItem, type ICatalogGroup } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { type GeoLabelType } from "../../constants/geo.js";
import { getLinkToDatasourcePage } from "../../selectors/data_page_selector.js";
import {
    enableCatalogSmartSearchResults,
    enableEnhancedInsightPicker,
    getCatalogGroupsExpanded,
    isFreemiumEdition,
} from "../../selectors/feature_flag_selector.js";
import { canManageProject } from "../../selectors/permissions_selector.js";
import { getActiveGeoLabelType, isLocationIconEnabled } from "../../services/reference_point_service.js";
import {
    getAvailableItems,
    getHLLFilteredCatalogItems,
    getSortedCatalogGroups,
    getUpdatedItemsCount,
    isDateItemAvailable,
    isLoadingGroups,
    isLoadingItems,
    isWorkspaceEmpty,
    shouldUnavailableItemsBeVisible,
} from "../../store/catalog/catalog_selector.js";
import { catalogAttribute, catalogFact, catalogMeasure } from "../../tests/catalog.test.helpers.js";
import { type IOrganizedCatalogGroup } from "../../typings/catalog.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { Catalog } from "./Catalog.js";
import { TabIconGroups, TabIcons } from "./model/catalogFilter.js";

// The shape of the store-backed values the component reads; each field is served by one stubbed selector.
interface ICatalogStateProps {
    items: ReadonlyArray<CatalogItem>;
    allItems: ReadonlyArray<CatalogItem>;
    groups: ReadonlyArray<ICatalogGroup>;
    defaultExpandedState: boolean;
    showDateItem: boolean;
    isLoadingGroups: boolean;
    isLoadingItems: boolean;
    isLocationIconEnabled: boolean;
    geoLabelType?: GeoLabelType;
    updatedItemsCount: number;
    isWorkspaceEmpty: boolean;
    canManageProject: boolean;
    isFreemiumEdition: boolean;
    linkToDatasourcePage: string;
    shouldUnavailableItemsBeVisible: boolean;
    enableCatalogSmartSearchResults: boolean;
    isEnhancedInsightPickerEnabled: boolean;
}

vi.hoisted(() => {
    vi.resetModules();
});

// `Catalog` reads everything from the store, so the tests stub `useSelector` per selector
// instead of passing props. `useDispatch` stays real and is served by the `withRedux` provider.
const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

vi.mock("./CatalogVisual", () => ({
    __esModule: true,
    CatalogVisual: vi.fn((props) => <div className="s-catalog-visual">{JSON.stringify(props)}</div>),
}));

describe("Catalog", () => {
    const backend = dummyBackend();
    const workspace = "test-workspace";

    const allItems: ReadonlyArray<CatalogItem> = [
        { ...catalogMeasure, groups: [{ identifier: "col" }] },
        { ...catalogAttribute, groups: [{ identifier: "exp" }] },
    ];

    const defaultState: ICatalogStateProps = {
        showDateItem: true,
        isLoadingGroups: false,
        isLoadingItems: false,
        isLocationIconEnabled: false,
        items: [allItems[0]],
        allItems,
        groups: [
            {
                title: "Collapsed group",
                tag: {
                    identifier: "col",
                },
            },
            {
                title: "Expanded group",
                tag: {
                    identifier: "exp",
                },
            },
            {
                title: "A very long group that needs to be shortened",
                tag: {
                    identifier: "long",
                },
            },
        ],
        defaultExpandedState: false,
        updatedItemsCount: 0,
        isWorkspaceEmpty: false,
        canManageProject: true,
        isFreemiumEdition: false,
        linkToDatasourcePage: "/data",
        shouldUnavailableItemsBeVisible: false,
        enableCatalogSmartSearchResults: false,
        isEnhancedInsightPickerEnabled: false,
    };

    const Wrapper = withRedux(withIntl(Catalog));

    const renderWithProviders = (customState: Partial<ICatalogStateProps> = {}) => {
        const state: ICatalogStateProps = { ...defaultState, ...customState };

        const selectorResults = new Map<unknown, unknown>([
            [isDateItemAvailable, state.showDateItem],
            [isLoadingGroups, state.isLoadingGroups],
            [isLoadingItems, state.isLoadingItems],
            [getAvailableItems, state.items],
            [getHLLFilteredCatalogItems, state.allItems],
            [getSortedCatalogGroups, state.groups],
            [getCatalogGroupsExpanded, state.defaultExpandedState],
            [isLocationIconEnabled, state.isLocationIconEnabled],
            [getActiveGeoLabelType, state.geoLabelType],
            [getUpdatedItemsCount, state.updatedItemsCount],
            [isWorkspaceEmpty, state.isWorkspaceEmpty],
            [canManageProject, state.canManageProject],
            [isFreemiumEdition, state.isFreemiumEdition],
            [getLinkToDatasourcePage, state.linkToDatasourcePage],
            [shouldUnavailableItemsBeVisible, state.shouldUnavailableItemsBeVisible],
            [enableCatalogSmartSearchResults, state.enableCatalogSmartSearchResults],
            [enableEnhancedInsightPicker, state.isEnhancedInsightPickerEnabled],
        ]);

        useSelectorMock.mockImplementation((selector: unknown) => selectorResults.get(selector));

        return render(
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <Wrapper />
                </WorkspaceProvider>
            </BackendProvider>,
        );
    };

    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    describe("expand and collapse", () => {
        it("should pass down all groups having items collapsed by default", () => {
            const wrapper = renderWithProviders();
            const itemGroups: ReadonlyArray<IOrganizedCatalogGroup> = JSON.parse(
                wrapper.container.querySelector(".s-catalog-visual").textContent,
            ).itemGroups;
            const areAllGroupsCollapsed = itemGroups.every((group) => !group.isExpanded);

            expect(itemGroups.length).toEqual(1);
            expect(areAllGroupsCollapsed).toEqual(true);
        });
    });

    describe("tabs", () => {
        it("should have 2 tab Icons (Metrics, Facts) unselected by default and pass down all the groups having items", () => {
            const metricTab = {
                name: TabIcons.METRICS,
                label: "catalog.filter.metrics",
                group: TabIconGroups.METRIC_FACT,
            };

            const factTab = {
                name: TabIcons.FACTS,
                label: "catalog.filter.facts",
                group: TabIconGroups.METRIC_FACT,
            };

            const wrapper = renderWithProviders({
                allItems: [...allItems, catalogFact],
                items: [...defaultState.items, catalogFact],
            });
            const childProps = JSON.parse(wrapper.container.querySelector(".s-catalog-visual").textContent);

            expect(childProps.itemGroups.length).toEqual(2);
            expect(childProps.tabs).toEqual([metricTab, factTab]);
            expect(childProps.tabSelectionStates).toEqual([false, false]);
        });
    });

    describe("search", () => {
        it("should have search query empty and have allItems empty", () => {
            const wrapper = renderWithProviders();
            const childProps = JSON.parse(wrapper.container.querySelector(".s-catalog-visual").textContent);

            expect(childProps.searchState.query).toEqual("");
            expect(childProps.allItems).toEqual([]);
        });
    });

    describe("unavailable items", () => {
        it("should have zero unavailable items count when all items are available", () => {
            const wrapper = renderWithProviders({ items: allItems });
            const childProps = JSON.parse(wrapper.container.querySelector(".s-catalog-visual").textContent);

            expect(childProps.hiddenItemsCount).toEqual(0);
        });

        it("should have unavailable items count set as expected when not all items are available", () => {
            const wrapper = renderWithProviders();
            const childProps = JSON.parse(wrapper.container.querySelector(".s-catalog-visual").textContent);

            expect(childProps.hiddenItemsCount).toEqual(1);
        });
    });
});
