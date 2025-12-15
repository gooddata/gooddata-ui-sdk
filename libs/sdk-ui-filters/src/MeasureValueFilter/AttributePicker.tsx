// (C) 2025 GoodData Corporation

import { type KeyboardEvent, type ReactNode, memo, useCallback, useId, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { isIdentifierRef, isLocalIdRef, isUriRef } from "@gooddata/sdk-model";
import {
    type IUiListboxInteractiveItem,
    Input,
    Overlay,
    UiButton,
    UiButtonSegmentedControl,
    UiCheckbox,
    UiIcon,
    UiIconButton,
    UiListbox,
    type UiListboxInteractiveItemProps,
} from "@gooddata/sdk-ui-kit";

import { type IDimensionalityItem } from "./typings.js";

interface IAttributePickerItemData {
    dimensionalityItem: IDimensionalityItem;
    isChecked: boolean;
}

function AttributePickerItemComponent({
    item,
    isFocused,
    isCompact,
    onSelect,
}: UiListboxInteractiveItemProps<IAttributePickerItemData>): ReactNode {
    const { dimensionalityItem, isChecked } = item.data;
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
            <UiCheckbox checked={isChecked} preventDefault />
            <UiIcon type={iconType} size={20} color={iconColor} ariaHidden />
            <span className="gd-ui-kit-listbox__item-title">{dimensionalityItem.title}</span>
        </div>
    );
}

interface IAttributePickerProps {
    /**
     * Available items that can be added (items from insight that are not in filter dimensionality).
     */
    availableItems: IDimensionalityItem[];
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
    availableItems,
    onAdd,
    onCancel,
    anchorElement,
}: IAttributePickerProps) {
    const intl = useIntl();
    const listboxId = useId();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchString, setSearchString] = useState("");
    const [typeFilter, setTypeFilter] = useState<"attribute" | "date">("attribute");

    // Check if we have items of each type
    const { hasAttributes, hasDates } = useMemo(() => {
        let hasAttributes = false;
        let hasDates = false;
        for (const item of availableItems) {
            const isDateItem = item.type === "chronologicalDate" || item.type === "genericDate";
            if (isDateItem) {
                hasDates = true;
            } else {
                hasAttributes = true;
            }
            if (hasAttributes && hasDates) break;
        }
        return { hasAttributes, hasDates };
    }, [availableItems]);

    // Only show type filter when both types exist
    const showTypeFilter = hasAttributes && hasDates;

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

    const handleItemToggle = useCallback((item: IUiListboxInteractiveItem<IAttributePickerItemData>) => {
        const itemId = item.id;
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    }, []);

    const handleAdd = useCallback(() => {
        const itemsToAdd = availableItems.filter((item) => selectedIds.has(getItemId(item)));
        onAdd(itemsToAdd);
    }, [availableItems, selectedIds, getItemId, onAdd]);

    const isAddDisabled = selectedIds.size === 0;

    const filteredItems = useMemo(() => {
        let items = availableItems;

        // Filter by type when both types exist
        if (showTypeFilter) {
            items = items.filter((item) => {
                const isDateItem = item.type === "chronologicalDate" || item.type === "genericDate";
                return typeFilter === "date" ? isDateItem : !isDateItem;
            });
        }

        // Filter by search string
        if (searchString.trim()) {
            const lowerSearch = searchString.toLowerCase();
            items = items.filter((item) => item.title.toLowerCase().includes(lowerSearch));
        }

        return items;
    }, [availableItems, searchString, showTypeFilter, typeFilter]);

    const listboxItems = useMemo((): IUiListboxInteractiveItem<IAttributePickerItemData>[] => {
        return filteredItems.map((item) => {
            const itemId = getItemId(item);
            const isChecked = selectedIds.has(itemId);
            return {
                type: "interactive",
                id: itemId,
                stringTitle: item.title,
                data: {
                    dimensionalityItem: item,
                    isChecked,
                },
            };
        });
    }, [filteredItems, getItemId, selectedIds]);

    return (
        <Overlay
            alignTo={anchorElement}
            alignPoints={[
                { align: "br tr", offset: { x: 4, y: 0 } },
                { align: "bl tl", offset: { x: -4, y: 0 } },
                { align: "tr br", offset: { x: 4, y: 0 } },
                { align: "tl bl", offset: { x: -4, y: 0 } },
            ]}
            positionType="sameAsTarget"
            closeOnOutsideClick
            closeOnEscape
            onClose={onCancel}
        >
            <div className="gd-dropdown overlay">
                <div className="gd-mvf-attribute-picker-body s-mvf-attribute-picker">
                    <div className="gd-mvf-attribute-picker-header">
                        <div className="gd-mvf-attribute-picker-header-title">
                            <UiIcon type="navigateLeft" size={12} color="complementary-7" ariaHidden />
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
                    <div className="gd-mvf-attribute-picker-search-bar">
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
                        <div className="gd-mvf-attribute-picker-type-filter">
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
                        {listboxItems.length === 0 ? (
                            <div className="gd-mvf-attribute-picker-no-results">
                                {intl.formatMessage({ id: "mvf.attributePicker.noResults" })}
                            </div>
                        ) : (
                            <>
                                {showTypeFilter ? (
                                    <div className="gd-mvf-attribute-picker-list-header">
                                        {intl.formatMessage({ id: "mvf.attributePicker.header.fromInsight" })}
                                    </div>
                                ) : null}
                                <UiListbox
                                    items={listboxItems}
                                    onSelect={handleItemToggle}
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
                            </>
                        )}
                    </div>
                    <div className="gd-mvf-attribute-picker-footer">
                        <UiButton
                            variant="secondary"
                            size="small"
                            onClick={onCancel}
                            label={intl.formatMessage({ id: "cancel" })}
                        />
                        <UiButton
                            variant="primary"
                            size="small"
                            onClick={handleAdd}
                            label={intl.formatMessage({ id: "mvf.attributePicker.add" })}
                            isDisabled={isAddDisabled}
                        />
                    </div>
                </div>
            </div>
        </Overlay>
    );
});
