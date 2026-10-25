// (C) 2019-2026 GoodData Corporation

import { type ComponentType, memo, useCallback, useMemo, useRef } from "react";

import { type IntlShape, useIntl } from "react-intl";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, type ListRowProps } from "react-virtualized";

import { simplifyText } from "@gooddata/util";

import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { type IOrganizedCatalogGroup, type IOrganizedCatalogItem } from "../../typings/catalog.js";

import { EmptyCatalogWarning } from "./blocks/EmptyCatalogWarning.js";
import { EmptySearchResult } from "./blocks/EmptySearchResult.js";
import { Spinner } from "./blocks/Spinner.js";
import { CatalogGroup } from "./CatalogGroup.js";
import { CatalogSuggestions } from "./CatalogSuggestion.js";
import { CatalogListItemContainer } from "./item/CatalogListItemContainer.js";

const CATALOG_ITEM_ADDITIONAL_PADDING = 10;
const DEFAULT_CATALOG_ITEM_ROW_HEIGHT = 24;

export interface ICatalogListOwnProps {
    showDateItem: boolean;
    itemGroups: ReadonlyArray<IOrganizedCatalogGroup>;
    relatedItems: ReadonlyArray<IOrganizedCatalogItem>;
    isRelatedLoading: boolean;
    isLoadingGroups: boolean;
    isLoadingItems: boolean;
    onGroupClick: (groupId: string) => void;
    allItems: ReadonlyArray<IOrganizedCatalogItem>;
    searchQuery: string;
    isWorkspaceEmpty: boolean;
    hiddenItemsCount: number;
    selectedTabNames: string;
    canManageProject: boolean;
    isFreemiumEdition: boolean;
    linkToDatasourcePage: string;
}

export type ICatalogListProps = ICatalogListOwnProps;

export function CatalogSeparator() {
    return (
        <div className="adi-catalog-separator">
            <hr />
        </div>
    );
}

export function createDateItem(intl: IntlShape): IOrganizedCatalogItem {
    return {
        type: "date",
        title: intl.formatMessage({
            id: "date",
        }),
        ref: {
            identifier: DATE_DATASET_ATTRIBUTE,
        },
        identifier: DATE_DATASET_ATTRIBUTE,
        uri: DATE_DATASET_ATTRIBUTE,
        summary: intl.formatMessage({
            id: "dashboard.catalog_item.common_date_description.workspace",
        }),
        available: true,
    };
}

interface IVirtualizedListItem {
    /** props are the opaque per-row bag; strictFunctionTypes stays off, so concrete components fit */
    ListItemComponent: ComponentType<Record<string, unknown>>;
    key: string;
    props: Record<string, unknown>;
}

export function rowRenderer(list: IVirtualizedListItem[], cache: CellMeasurerCache) {
    function RowRendererComponent({ index, style, parent }: ListRowProps) {
        const { ListItemComponent, props, key } = list[index];

        const additionalPadding = {
            paddingTop: index === 0 ? CATALOG_ITEM_ADDITIONAL_PADDING : 0,
            paddingBottom: index === list.length - 1 ? CATALOG_ITEM_ADDITIONAL_PADDING : 0,
        };

        return (
            <CellMeasurer
                key={`${key + "_" + index}`}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                <div style={{ ...style, ...additionalPadding }}>
                    <ListItemComponent {...props} />
                </div>
            </CellMeasurer>
        );
    }

    return RowRendererComponent;
}

export function createVirtualizedListItem<P extends object>(
    key: string,
    component: ComponentType<P>,
    props: P = {} as P,
): IVirtualizedListItem {
    return {
        key,
        // the row renderer re-marries each component with exactly the props it was registered with
        ListItemComponent: component as unknown as ComponentType<Record<string, unknown>>,
        props: props as Record<string, unknown>,
    };
}

export function useVirtualizedCatalogList({
    showDateItem,
    itemGroups,
    isLoadingItems,
    onGroupClick,
    allItems,
    isRelatedLoading,
    relatedItems,
}: ICatalogListProps) {
    const intl = useIntl();

    const cache = useRef(null);

    return useMemo(() => {
        const list: IVirtualizedListItem[] = [];

        if (showDateItem) {
            list.push(
                createVirtualizedListItem("date_item", CatalogListItemContainer, {
                    item: createDateItem(intl),
                }),
            );
        }

        itemGroups.forEach((itemGroup: IOrganizedCatalogGroup) => {
            list.push(
                createVirtualizedListItem(itemGroup.id, CatalogGroup, {
                    ...itemGroup,
                    onClick: onGroupClick,
                    isLoading: isLoadingItems,
                }),
            );
            if (itemGroup.isExpanded) {
                itemGroup.items.forEach((item: IOrganizedCatalogItem) => {
                    list.push(
                        createVirtualizedListItem(
                            `${itemGroup.id}_${item.identifier}`,
                            CatalogListItemContainer,
                            {
                                item,
                                className: `s-catalog-${simplifyText(itemGroup.id)}-group-item`,
                            },
                        ),
                    );
                });
            }
        });

        const showSeparator = allItems.length > 0 && itemGroups.length > 0;
        if (showSeparator) {
            list.push(createVirtualizedListItem("catalog_separator", CatalogSeparator));
        }

        allItems.forEach((item: IOrganizedCatalogItem) => {
            list.push(
                createVirtualizedListItem(item.identifier, CatalogListItemContainer, {
                    item,
                    className: "s-catalog-flat-item",
                }),
            );
        });

        if (isRelatedLoading || relatedItems.length > 0) {
            const group = {
                name: intl.formatMessage({
                    id: "catalog.group_title.suggestion",
                }),
                id: "suggestions",
                items: relatedItems,
                onClick: onGroupClick,
                isLoading: isRelatedLoading,
            };

            list.push(createVirtualizedListItem(group.id, CatalogSuggestions, group));
            if (!isRelatedLoading && relatedItems.length > 0) {
                relatedItems.forEach((item: IOrganizedCatalogItem) => {
                    list.push(
                        createVirtualizedListItem(
                            `${group.id}_${item.identifier}`,
                            CatalogListItemContainer,
                            {
                                item,
                                className: `s-catalog-${simplifyText(group.id)}-group-item`,
                            },
                        ),
                    );
                });
            }
        }

        cache.current = new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: DEFAULT_CATALOG_ITEM_ROW_HEIGHT,
            keyMapper: (rowIndex) => list[rowIndex].key,
        });

        return { list, cache };
    }, [
        showDateItem,
        itemGroups,
        isLoadingItems,
        onGroupClick,
        allItems,
        intl,
        isRelatedLoading,
        relatedItems,
    ]);
}

export const CatalogList = memo(function CatalogList(props: ICatalogListProps) {
    const {
        showDateItem,
        itemGroups,
        isLoadingGroups,
        isLoadingItems,
        isRelatedLoading,
        relatedItems,
        allItems,
        searchQuery,
        isWorkspaceEmpty,
        hiddenItemsCount,
        selectedTabNames,
        canManageProject,
        isFreemiumEdition,
        linkToDatasourcePage,
    } = props;

    const {
        list,
        cache: { current: currentCache },
    } = useVirtualizedCatalogList(props);

    const noLocalItemsFound = !showDateItem && itemGroups.length === 0 && allItems.length === 0;
    const noItemsFound = noLocalItemsFound && !isRelatedLoading && relatedItems.length === 0;
    const isSearch = searchQuery && searchQuery.length !== 0;
    const showGlobalLoading = isLoadingGroups || (isLoadingItems && itemGroups.length === 0);

    const getRowHeight = useCallback(
        (info: { index: number }) => {
            return (
                currentCache.rowHeight(info) ||
                (info.index === 0
                    ? DEFAULT_CATALOG_ITEM_ROW_HEIGHT + CATALOG_ITEM_ADDITIONAL_PADDING
                    : DEFAULT_CATALOG_ITEM_ROW_HEIGHT)
            );
        },
        [currentCache],
    );

    return (
        <div className="adi-catalog-list">
            {showGlobalLoading ? (
                <div className="adi-catalog-loading-group">
                    <Spinner />
                </div>
            ) : null}
            {!showGlobalLoading && noLocalItemsFound ? (
                isSearch ? (
                    <EmptySearchResult searchPhrase={searchQuery} />
                ) : (
                    <EmptyCatalogWarning
                        selectedTabNames={selectedTabNames}
                        isWorkspaceEmpty={isWorkspaceEmpty}
                        hiddenItemsCount={hiddenItemsCount}
                        canManageProject={canManageProject}
                        isFreemiumEdition={isFreemiumEdition}
                        linkToDatasourcePage={linkToDatasourcePage}
                    />
                )
            ) : null}
            {!showGlobalLoading && !noItemsFound && (
                <AutoSizer>
                    {({ width, height }) => (
                        <List
                            height={height}
                            width={width}
                            rowCount={list.length}
                            rowRenderer={rowRenderer(list, currentCache)}
                            deferredMeasurementCache={currentCache}
                            rowHeight={getRowHeight}
                            style={{ paddingBottom: "29px" }}
                        />
                    )}
                </AutoSizer>
            )}
        </div>
    );
});
