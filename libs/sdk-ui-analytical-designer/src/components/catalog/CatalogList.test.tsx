// (C) 2019-2026 GoodData Corporation

import { type ReactNode } from "react";

import { render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { type IOrganizedCatalogGroup, type IOrganizedCatalogItem } from "../../typings/catalog.js";
import { getIntlOptions, mockIntlProp, withIntl } from "../../utils/with_intl.js";

import {
    CatalogList,
    CatalogSeparator,
    type ICatalogListProps,
    createDateItem,
    createVirtualizedListItem,
    useVirtualizedCatalogList,
} from "./CatalogList.js";
import { CatalogListItemContainer } from "./item/CatalogListItemContainer.js";
import { TabNames } from "./model/catalogFilter.js";

const customTranslations = {
    date: "Translated date title",
    "dashboard.catalog_item.common_date_description": "Translated date summary",
};

describe("CatalogList", () => {
    const renderComponent = (props = {}) => {
        const Wrapped = withIntl(CatalogList, getIntlOptions(customTranslations));
        return render(<Wrapped {...testCatalogProps} {...props} />);
    };

    const testCatalogProps: ICatalogListProps = {
        showDateItem: false,
        itemGroups: [],
        allItems: [],
        isLoadingGroups: false,
        isLoadingItems: false,
        searchQuery: "",
        onGroupClick: (v) => v,
        isRelatedLoading: false,
        relatedItems: [],
        isWorkspaceEmpty: false,
        hiddenItemsCount: 0,
        canManageProject: true,
        isFreemiumEdition: false,
        linkToDatasourcePage: "/data",
        selectedTabNames: TabNames.ALL_TAB_NAME,
    };

    const testGroup1: IOrganizedCatalogGroup = {
        name: "Group1",
        id: "group 1",
        tag: {
            identifier: "group 1",
        },
        items: [],
        isExpanded: true,
    };
    const testGroup2: IOrganizedCatalogGroup = {
        name: "Group2",
        id: "group 2",
        tag: {
            identifier: "group 2",
        },
        items: [],
        isExpanded: false,
    };
    const testGroups: IOrganizedCatalogGroup[] = [testGroup1, testGroup2];
    const testItems: IOrganizedCatalogItem[] = [
        {
            type: "metric",
            ref: {
                identifier: "metric.identifier",
            },
            identifier: "metric.identifier",
            title: "measure title",
        },
        {
            type: "fact",
            ref: {
                identifier: "fact.identifier",
            },
            identifier: "fact.identifier",
            title: "fact title",
        },
        {
            type: "attribute",
            ref: {
                identifier: "attribute.identifier",
            },
            identifier: "attribute.identifier",
            title: "attribute title",
        },
    ];
    const expectedDateItem: IOrganizedCatalogItem = {
        type: "date",
        title: "Translated date title",
        ref: {
            identifier: DATE_DATASET_ATTRIBUTE,
        },
        identifier: DATE_DATASET_ATTRIBUTE,
        summary: "Represents all your dates in workspace. Can group by Day, Week, Month, Quarter & Year.",
        available: true,
        uri: "attr.datedataset",
    };

    const mockIntl = mockIntlProp(customTranslations);
    const separatorListItem = createVirtualizedListItem("catalog_separator", CatalogSeparator);
    const dateListItem = createVirtualizedListItem("date_item", CatalogListItemContainer, {
        item: createDateItem(mockIntl),
    });

    it("should render only EmptyCatalogWarning component if there is no date item nor group nor item", () => {
        const { container } = renderComponent();

        const nothingFound = container.querySelectorAll(".s-no-objects-found");
        const catalogEmpty = container.querySelectorAll(".s-adi-no-items");
        expect(nothingFound).toHaveLength(1);
        expect(catalogEmpty).toHaveLength(0);
    });

    it(
        "should render only CatalogEmpty component if there is no date item nor group nor item" +
            "and search phrase is not empty",
        () => {
            const { container } = renderComponent({ searchQuery: "search query" });

            const nothingFound = container.querySelectorAll(".s-no-objects-found");
            const catalogEmpty = container.querySelectorAll(".s-adi-no-items");
            expect(nothingFound).toHaveLength(0);
            expect(catalogEmpty).toHaveLength(1);
        },
    );

    describe("loading", () => {
        it("should not render when isLoadingGroups and isLoadingItems props are falsy", () => {
            const { container } = renderComponent({ isLoadingGroups: false, isLoadingItems: false });

            const loadingElement = container.querySelectorAll(".adi-catalog-loading-group");

            expect(loadingElement).toHaveLength(0);
        });

        it("should render when isLoadingGroups prop is truthy", () => {
            const { container } = renderComponent({ isLoadingGroups: true });

            const loadingElement = container.querySelectorAll(".adi-catalog-loading-group");

            expect(loadingElement).toHaveLength(1);
        });

        it("should render when isLoadingItems prop is truthy and there are no groups", () => {
            const { container } = renderComponent({ isLoadingItems: true });

            const loadingElement = container.querySelectorAll(".adi-catalog-loading-group");

            expect(loadingElement).toHaveLength(1);
        });

        it("should not render when isLoadingItems prop is truthy and there are some groups", () => {
            const { container } = renderComponent({ isLoadingItems: true, itemGroups: [testGroup1] });

            const loadingElement = container.querySelectorAll(".adi-catalog-loading-group");

            expect(loadingElement).toHaveLength(0);
        });
    });

    describe("useVirtualizedCatalogList", () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            const IntlWrapper = withIntl(
                ({ children }: { children: ReactNode }) => <>{children}</>,
                getIntlOptions(customTranslations),
            );
            return <IntlWrapper>{children}</IntlWrapper>;
        };

        it("should not render the date item when the showDateItem is false", () => {
            const { result } = renderHook(
                () => useVirtualizedCatalogList({ ...testCatalogProps, showDateItem: false }),
                { wrapper },
            );
            expect(result.current.list).not.toContainEqual(dateListItem);
        });

        it("should render the date item with the workspace tooltip description", () => {
            const { result } = renderHook(
                () =>
                    useVirtualizedCatalogList({
                        ...testCatalogProps,
                        showDateItem: true,
                    }),
                { wrapper },
            );
            const dateListItemHasWorkspace = createVirtualizedListItem(
                "date_item",
                CatalogListItemContainer,
                {
                    item: createDateItem(mockIntl),
                },
            );
            expect(result.current.list).toContainEqual(dateListItemHasWorkspace);
        });

        it("should render the date item when the showDateItem property is true", () => {
            const { result } = renderHook(
                () => useVirtualizedCatalogList({ ...testCatalogProps, showDateItem: true }),
                { wrapper },
            );
            expect(result.current.list[0].key).toEqual(dateListItem.key);
            expect(result.current.list[0].props["item"]).toEqual(expectedDateItem);
        });

        it("should render groups", () => {
            const { result } = renderHook(
                () => useVirtualizedCatalogList({ ...testCatalogProps, itemGroups: testGroups }),
                { wrapper },
            );
            expect(result.current.list).toHaveLength(testGroups.length);
            expect(result.current.list[0].key).toEqual(testGroup1.id);
            expect(result.current.list[1].key).toEqual(testGroup2.id);
        });

        it("should render allItems outside of groups", () => {
            const { result } = renderHook(
                () => useVirtualizedCatalogList({ ...testCatalogProps, allItems: testItems }),
                { wrapper },
            );
            expect(result.current.list).toHaveLength(testItems.length);
            expect(result.current.list[0].key).toEqual(testItems[0].identifier);
            expect(result.current.list[1].key).toEqual(testItems[1].identifier);
            expect(result.current.list[2].key).toEqual(testItems[2].identifier);
        });

        it("should not render separator if there are only groups", () => {
            const { result } = renderHook(
                () => useVirtualizedCatalogList({ ...testCatalogProps, itemGroups: testGroups }),
                { wrapper },
            );
            expect(result.current.list).not.toContainEqual(separatorListItem);
        });

        it("should not render separator if there are only allItems outside groups", () => {
            const { result } = renderHook(
                () => useVirtualizedCatalogList({ ...testCatalogProps, allItems: testItems }),
                { wrapper },
            );
            expect(result.current.list).not.toContainEqual(separatorListItem);
        });

        it("should render separator if there are both groups and allItems", () => {
            const { result } = renderHook(
                () =>
                    useVirtualizedCatalogList({
                        ...testCatalogProps,
                        itemGroups: testGroups,
                        allItems: testItems,
                    }),
                { wrapper },
            );
            expect(result.current.list).toContainEqual(separatorListItem);
        });

        it("should render items in group when group is expanded", () => {
            const { result } = renderHook(
                () =>
                    useVirtualizedCatalogList({
                        ...testCatalogProps,
                        itemGroups: [
                            {
                                ...testGroup1,
                                isExpanded: true,
                                items: testItems,
                            },
                            testGroup2,
                        ],
                    }),
                { wrapper },
            );

            expect(result.current.list[0].key).toEqual(testGroup1.id);
            expect(result.current.list[1].key).toEqual(`${testGroup1.id}_${testItems[0].identifier}`);
            expect(result.current.list[2].key).toEqual(`${testGroup1.id}_${testItems[1].identifier}`);
            expect(result.current.list[3].key).toEqual(`${testGroup1.id}_${testItems[2].identifier}`);
            expect(result.current.list[4].key).toEqual(testGroup2.id);
        });

        it("should not render items in group when group is not expanded", () => {
            const { result } = renderHook(
                () =>
                    useVirtualizedCatalogList({
                        ...testCatalogProps,
                        itemGroups: [
                            {
                                ...testGroup1,
                                isExpanded: false,
                                items: testItems,
                            },
                            testGroup2,
                        ],
                    }),
                { wrapper },
            );

            expect(result.current.list[0].key).toEqual(testGroup1.id);
            expect(result.current.list[1].key).toEqual(testGroup2.id);
        });
    });
});
