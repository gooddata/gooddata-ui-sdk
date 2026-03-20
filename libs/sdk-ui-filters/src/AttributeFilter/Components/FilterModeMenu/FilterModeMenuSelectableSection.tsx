// (C) 2007-2026 GoodData Corporation

import { type IUiListboxItem, UiListbox, type UiListboxAriaAttributes } from "@gooddata/sdk-ui-kit";

import { FilterModeMenuListItem } from "./FilterModeMenuListItem.js";

export type IFilterModeMenuSelectableSectionProps<TData> = {
    items: IUiListboxItem<TData, never>[];
    selectedItemId?: string;
    onSelect: (item: IUiListboxItem<TData, never>) => void;
    onClose: () => void;
    ariaAttributes: UiListboxAriaAttributes;
};

export function FilterModeMenuSelectableSection<TData>({
    items,
    selectedItemId,
    onSelect,
    onClose,
    ariaAttributes,
}: IFilterModeMenuSelectableSectionProps<TData>) {
    return (
        <UiListbox<TData, never>
            shouldKeyboardActionStopPropagation
            shouldKeyboardActionPreventDefault
            items={items}
            selectedItemId={selectedItemId}
            onSelect={onSelect}
            onClose={onClose}
            ariaAttributes={ariaAttributes}
            InteractiveItemComponent={({ item, onSelect, isFocused, isSelected }) => (
                <FilterModeMenuListItem
                    item={item}
                    onSelect={onSelect}
                    isFocused={isFocused}
                    isSelected={isSelected}
                />
            )}
        />
    );
}
