// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type IAttributeMetadataObject,
    filterAttributeElements,
    getAttributeElementsItems,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import { Dropdown, DropdownList, FilterGroupItem, type IAlignPoint, UiIcon } from "@gooddata/sdk-ui-kit";

import { useFilterGroupStatus } from "./useFilterGroupStatus.js";
import {
    AttributeFilterButton,
    type IAttributeFilterButtonProps,
} from "../AttributeFilter/AttributeFilterButton.js";
import { AttributeFilterDropdownButton } from "../AttributeFilter/Components/DropdownButton/AttributeFilterDropdownButton.js";

/**
 * @public
 */
export interface IFilterGroupProps {
    title: string;
    filters: IAttributeFilterButtonProps[];
}

const GROUP_ALIGN_POINTS: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 0, y: 0 } },
    { align: "br tr", offset: { x: 0, y: 0 } },
    { align: "tr tl", offset: { x: 0, y: 0 } },
    { align: "tl tr", offset: { x: 0, y: 0 } },
];

const ITEM_ALIGN_POINTS: IAlignPoint[] = [
    { align: "tr tl", offset: { x: -1, y: -1 } },
    { align: "br bl", offset: { x: -1, y: 0 } },
    { align: "bl tl", offset: { x: 0, y: 0 } },
    { align: "tl bl", offset: { x: 0, y: 0 } },
];

/**
 * FilterGroup is a component that renders a dropdown button with multiple attribute filters
 *
 * @public
 */
export function FilterGroup(props: IFilterGroupProps) {
    const { title, filters } = props;
    const { isAnyFilterLoading, isAnyFilterError, getFilterStatus, setFilterStatus } =
        useFilterGroupStatus(filters);
    const intl = useIntl();

    const subtitle = useMemo(() => {
        if (isAnyFilterLoading) {
            return intl.formatMessage({ id: "loading" });
        }
        if (isAnyFilterError) {
            return intl.formatMessage({ id: "gs.list.notAvailableAbbreviation" });
        }
        const activeFilters = filters.filter((filter) => {
            if (!filter.filter) {
                return false;
            }
            const elements = getAttributeElementsItems(filterAttributeElements(filter.filter));
            return elements.length > 0;
        });
        const activeFiltersCount = activeFilters.length;
        if (activeFiltersCount === 0) {
            return intl.formatMessage({ id: "gs.list.allAndCount" }, { count: filters.length });
        } else {
            const listOfTitles = activeFilters
                .map((filter) => {
                    if (filter.title) {
                        return filter.title;
                    }
                    if (!filter.filter) {
                        return undefined;
                    }
                    return getFilterStatus(filter.filter)?.attribute?.title;
                })
                .filter((title) => !!title)
                .join(", ");
            return `${listOfTitles} (${activeFiltersCount}/${filters.length})`;
        }
    }, [filters, isAnyFilterError, isAnyFilterLoading, getFilterStatus, intl]);

    const { selectedItemsCount, totalItemsCount } = useMemo((): {
        selectedItemsCount?: number;
        totalItemsCount?: number;
    } => {
        if (isAnyFilterLoading) {
            return {};
        }
        if (isAnyFilterError) {
            return {};
        }
        const activeFilters = filters.filter((filter) => {
            if (!filter.filter) {
                return false;
            }
            const elements = getAttributeElementsItems(filterAttributeElements(filter.filter));
            return elements.length > 0;
        });
        const activeFiltersCount = activeFilters.length;
        if (activeFiltersCount === 0) {
            return { totalItemsCount: filters.length };
        } else {
            return { selectedItemsCount: activeFiltersCount, totalItemsCount: filters.length };
        }
    }, [filters, isAnyFilterError, isAnyFilterLoading]);

    const errorHandler = (item: IAttributeFilterButtonProps) => (error: GoodDataSdkError) => {
        setFilterStatus(item.filter, { error });
        item.onError?.(error);
    };

    const initLoadingChangedHandler =
        (item: IAttributeFilterButtonProps) => (loading: boolean, attribute?: IAttributeMetadataObject) => {
            setFilterStatus(item.filter, {
                loading,
                error: loading ? null : undefined,
                attribute,
            });
            item.onInitLoadingChanged?.(loading, attribute);
        };

    return (
        <Dropdown
            className="gd-filter-group"
            closeOnParentScroll
            closeOnMouseDrag
            closeOnOutsideClick
            enableEventPropagation
            alignPoints={GROUP_ALIGN_POINTS}
            fullscreenOnMobile
            autofocusOnOpen
            renderButton={({ toggleDropdown, isOpen, buttonRef, dropdownId }) => (
                <AttributeFilterDropdownButton
                    title={title}
                    subtitle={subtitle}
                    isLoaded={!isAnyFilterLoading && !isAnyFilterError}
                    isOpen={isOpen}
                    selectedItemsCount={selectedItemsCount}
                    totalItemsCount={totalItemsCount}
                    showSelectionCount={selectedItemsCount !== undefined || totalItemsCount !== undefined}
                    icon={<UiIcon type="folder" size={12} color="currentColor" />}
                    dropdownId={dropdownId}
                    buttonRef={buttonRef}
                    onClick={toggleDropdown}
                    isError={isAnyFilterError}
                    isLoading={isAnyFilterLoading}
                />
            )}
            renderBody={() => (
                <DropdownList
                    className="gd-filter-group-body"
                    items={filters}
                    itemHeight={53}
                    renderItem={({ item }) => (
                        <AttributeFilterButton
                            {...item}
                            resetOnParentFilterChange={item.resetOnParentFilterChange ?? false}
                            fullscreenOnMobile={item.fullscreenOnMobile ?? false}
                            selectFirst={item.selectFirst ?? false}
                            alignPoints={item.alignPoints ?? ITEM_ALIGN_POINTS}
                            onError={errorHandler(item)}
                            onInitLoadingChanged={initLoadingChangedHandler(item)}
                            DropdownButtonComponent={item.DropdownButtonComponent ?? FilterGroupItem}
                            LoadingComponent={item.LoadingComponent ?? (() => <FilterGroupItem isLoading />)}
                            ErrorComponent={item.ErrorComponent ?? (() => <FilterGroupItem isError />)}
                        />
                    )}
                />
            )}
        />
    );
}
