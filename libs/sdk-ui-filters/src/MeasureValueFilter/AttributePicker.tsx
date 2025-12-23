// (C) 2025 GoodData Corporation

import { type KeyboardEvent, type ReactNode, memo, useCallback, useId, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { isIdentifierRef, isLocalIdRef, isUriRef, objRefToString } from "@gooddata/sdk-model";
import {
    type IUiListboxInteractiveItem,
    Input,
    Overlay,
    UiButtonSegmentedControl,
    UiIcon,
    UiIconButton,
    UiListbox,
    type UiListboxInteractiveItemProps,
} from "@gooddata/sdk-ui-kit";

import { type IDateDatasetOption, type IDimensionalityItem } from "./typings.js";
import { isDateDimensionalityItem, useAttributePickerItemsData } from "./useAttributePickerItemsData.js";
import {
    type IAttributePickerItemData,
    useAttributePickerListboxItems,
} from "./useAttributePickerListboxItems.js";

function AttributePickerItemComponent({
    item,
    isFocused,
    isCompact,
    onSelect,
}: UiListboxInteractiveItemProps<IAttributePickerItemData>): ReactNode {
    const { dimensionalityItem } = item.data;
    const isDateItem =
        dimensionalityItem.type === "chronologicalDate" || dimensionalityItem.type === "genericDate";
    const iconType = isDateItem ? "date" : "ldmAttribute";
    const iconColor = isDateItem ? "primary" : "warning";

    return (
        <div
            className={`gd-ui-kit-listbox__item gd-mvf-attribute-picker-item${isFocused ? " gd-ui-kit-listbox__item--isFocused" : ""}${isCompact ? " gd-ui-kit-listbox__item--isCompact" : ""}`}
            onClick={onSelect}
            data-object-type={dimensionalityItem.type ?? "attribute"}
        >
            <UiIcon type={iconType} size={18} color={iconColor} ariaHidden />
            <span className="gd-ui-kit-listbox__item-title">{dimensionalityItem.title}</span>
        </div>
    );
}

interface IAttributePickerProps {
    /**
     * Available items from the current visualization (bucket-based dimensionality).
     * These are already filtered to only include items that can be added.
     */
    availableInsightItems: IDimensionalityItem[];
    /**
     * Available items from catalog (validated via computeValidObjects).
     * These are already filtered to only include items that can be added.
     */
    availableCatalogItems: IDimensionalityItem[];
    /**
     * Whether catalog dimensionality is currently being loaded.
     */
    isLoadingCatalogDimensionality?: boolean;
    /**
     * Callback when items are added.
     */
    onAdd: (items: IDimensionalityItem[]) => void;
    /**
     * Callback when the picker is closed without adding.
     */
    onCancel: () => void;
    /**
     * The element to anchor the overlay to.
     */
    anchorElement: HTMLElement;
}

/**
 * @internal
 * AttributePicker dialog for selecting dimensionality items to add to the filter.
 */
export const AttributePicker = memo(function AttributePicker({
    availableInsightItems,
    availableCatalogItems,
    isLoadingCatalogDimensionality,
    onAdd,
    onCancel,
    anchorElement,
}: IAttributePickerProps) {
    const intl = useIntl();
    const listboxId = useId();
    const [searchString, setSearchString] = useState("");
    const [typeFilter, setTypeFilter] = useState<"attribute" | "date">("attribute");
    const [selectedDateDatasetKey, setSelectedDateDatasetKey] = useState<string | undefined>(undefined);
    const [isDateDatasetDropdownOpen, setIsDateDatasetDropdownOpen] = useState(false);

    const availableItems = useMemo(() => {
        return [...availableInsightItems, ...availableCatalogItems];
    }, [availableInsightItems, availableCatalogItems]);

    // While catalog is still loading (and we have not received any catalog items yet),
    // decide which tabs to show purely from insight items.
    const itemsForTypeDetection = useMemo(() => {
        const isCatalogNotLoadedYet =
            (availableCatalogItems?.length ?? 0) === 0 && !!isLoadingCatalogDimensionality;
        return isCatalogNotLoadedYet ? availableInsightItems : availableItems;
    }, [availableCatalogItems, isLoadingCatalogDimensionality, availableInsightItems, availableItems]);

    // Check if we have items of each type
    const { hasAttributes, hasDates } = useMemo(() => {
        let hasAttributes = false;
        let hasDates = false;
        for (const item of itemsForTypeDetection) {
            const isDateItem = item.type === "chronologicalDate" || item.type === "genericDate";
            if (isDateItem) {
                hasDates = true;
            } else {
                hasAttributes = true;
            }
            if (hasAttributes && hasDates) break;
        }
        return { hasAttributes, hasDates };
    }, [itemsForTypeDetection]);

    // Show type filter only when both tabs would be meaningful.
    // In particular, hide the Date tab when there are no date attributes available.
    const showTypeFilter = hasAttributes && hasDates;

    // When only one type exists, avoid filtering out everything by forcing the effective type.
    const effectiveTypeFilter: "attribute" | "date" = showTypeFilter
        ? typeFilter
        : hasDates
          ? "date"
          : "attribute";

    const handleSearch = useCallback((value: string | number) => {
        setSearchString(String(value));
    }, []);

    const handleSearchEscKeyPress = useCallback(
        (e: KeyboardEvent) => {
            if (searchString.length > 0) {
                e.stopPropagation();
            }
        },
        [searchString],
    );

    const getItemId = useCallback((item: IDimensionalityItem): string => {
        const ref = item.identifier;
        if (isLocalIdRef(ref)) {
            return ref.localIdentifier;
        }
        if (isIdentifierRef(ref)) {
            return ref.identifier;
        }
        if (isUriRef(ref)) {
            return ref.uri;
        }
        return String(ref);
    }, []);

    const handleItemSelect = useCallback(
        (item: IUiListboxInteractiveItem<IAttributePickerItemData>) => {
            const selectedItem = item.data.dimensionalityItem;
            onAdd([selectedItem]);
        },
        [onAdd],
    );

    const dateDatasetOptions = useMemo((): IDateDatasetOption[] => {
        const optionsMap = new Map<string, string>();

        // Build options from all date items (ignoring search) so the dataset selector is stable while typing.
        [...availableInsightItems, ...availableCatalogItems]
            .filter(isDateDimensionalityItem)
            .forEach((item) => {
                if (!item.dataset) {
                    return;
                }
                const key = objRefToString(item.dataset.identifier);
                optionsMap.set(key, item.dataset.title);
            });

        return Array.from(optionsMap.entries())
            .map(([key, title]) => ({ key, title }))
            .sort((a, b) => a.title.localeCompare(b.title));
    }, [availableInsightItems, availableCatalogItems]);

    const effectiveSelectedDateDatasetKey = useMemo(() => {
        if (dateDatasetOptions.length === 0) {
            return undefined;
        }
        return dateDatasetOptions.some((o) => o.key === selectedDateDatasetKey)
            ? selectedDateDatasetKey
            : dateDatasetOptions[0].key;
    }, [dateDatasetOptions, selectedDateDatasetKey]);

    const shouldShowDateDatasetSelector = effectiveTypeFilter === "date" && dateDatasetOptions.length > 1;

    const { filteredInsightItems, catalogItemsByDataset, filteredCatalogItems } = useAttributePickerItemsData(
        {
            availableInsightItems,
            availableCatalogItems,
            searchString,
            effectiveTypeFilter,
            effectiveSelectedDateDatasetKey,
        },
    );

    // Build listbox items with sections
    const listboxItems = useAttributePickerListboxItems({
        filteredInsightItems,
        filteredCatalogItems,
        catalogItemsByDataset,
        getItemId,
        intl,
        effectiveTypeFilter,
        shouldShowDateDatasetSelector,
        dateDatasetOptions,
        effectiveSelectedDateDatasetKey,
        isDateDatasetDropdownOpen,
        setSelectedDateDatasetKey,
        setIsDateDatasetDropdownOpen,
        listboxId,
        isLoadingCatalogDimensionality,
    });

    const hasSelectableItems = filteredInsightItems.length > 0 || filteredCatalogItems.length > 0;
    const shouldShowEmptyStateMessage = !isLoadingCatalogDimensionality && !hasSelectableItems;

    return (
        <Overlay
            alignTo={anchorElement}
            alignPoints={[{ align: "tr tl" }, { align: "tl tr" }, { align: "br bl" }, { align: "bl br" }]}
            positionType="sameAsTarget"
            closeOnOutsideClick
            closeOnEscape
            onClose={onCancel}
        >
            <div className="gd-dropdown overlay">
                <div
                    className="gd-mvf-attribute-picker-body s-mvf-attribute-picker"
                    data-testid="mvf-attribute-picker"
                >
                    <div className="gd-mvf-attribute-picker-header">
                        <div className="gd-mvf-attribute-picker-header-title">
                            {intl.formatMessage({ id: "mvf.attributePicker.title" })}
                        </div>
                        <UiIconButton
                            icon="close"
                            variant="bare"
                            size="small"
                            onClick={onCancel}
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage({ id: "cancel" }),
                            }}
                            dataTestId="s-mvf-attribute-picker-close"
                        />
                    </div>
                    <div
                        className="gd-mvf-attribute-picker-search-bar"
                        data-testid="s-mvf-attribute-picker-search-bar"
                    >
                        <Input
                            className="gd-mvf-attribute-picker-search-input"
                            value={searchString}
                            onChange={handleSearch}
                            onEscKeyPress={handleSearchEscKeyPress}
                            placeholder={intl.formatMessage({ id: "gs.list.search.placeholder" })}
                            autofocus
                            clearOnEsc
                            isSearch
                            isSmall
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage({ id: "gs.list.acessibility.search.label" }),
                            }}
                        />
                    </div>
                    {showTypeFilter ? (
                        <div
                            className="gd-mvf-attribute-picker-type-filter"
                            data-testid="mvf-attribute-picker-type-filter"
                        >
                            <UiButtonSegmentedControl layout="fill">
                                <UiIconButton
                                    icon="ldmAttribute"
                                    iconColor="warning"
                                    size="small"
                                    variant="secondary"
                                    isActive={typeFilter === "attribute"}
                                    onClick={() => setTypeFilter("attribute")}
                                    accessibilityConfig={{
                                        ariaLabel: intl.formatMessage({
                                            id: "mvf.attributePicker.filter.attributes",
                                        }),
                                    }}
                                    dataTestId="s-mvf-attribute-picker-filter-attributes"
                                />
                                <UiIconButton
                                    icon="date"
                                    iconColor="primary"
                                    size="small"
                                    variant="secondary"
                                    isActive={typeFilter === "date"}
                                    onClick={() => setTypeFilter("date")}
                                    accessibilityConfig={{
                                        ariaLabel: intl.formatMessage({
                                            id: "mvf.attributePicker.filter.dates",
                                        }),
                                    }}
                                    dataTestId="s-mvf-attribute-picker-filter-dates"
                                />
                            </UiButtonSegmentedControl>
                        </div>
                    ) : null}
                    <div className="gd-mvf-attribute-picker-content">
                        {shouldShowEmptyStateMessage ? (
                            <div className="gd-mvf-attribute-picker-no-results">
                                {searchString.trim()
                                    ? intl.formatMessage({
                                          id: "mvf.attributePicker.noResults",
                                      })
                                    : intl.formatMessage({
                                          id: "mvf.attributePicker.noItems",
                                      })}
                            </div>
                        ) : (
                            <UiListbox
                                items={listboxItems}
                                onSelect={handleItemSelect}
                                shouldCloseOnSelect={false}
                                isCompact
                                InteractiveItemComponent={AttributePickerItemComponent}
                                ariaAttributes={{
                                    id: listboxId,
                                    "aria-label": intl.formatMessage({
                                        id: "mvf.attributePicker.title",
                                    }),
                                }}
                                dataTestId="s-mvf-attribute-picker-list"
                            />
                        )}
                    </div>
                </div>
            </div>
        </Overlay>
    );
});
