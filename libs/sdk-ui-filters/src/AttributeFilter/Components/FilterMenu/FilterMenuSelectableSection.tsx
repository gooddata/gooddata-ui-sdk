// (C) 2007-2026 GoodData Corporation

import { type IUiListboxItem, UiListbox, type UiListboxAriaAttributes } from "@gooddata/sdk-ui-kit";

import { FilterMenuListItem } from "./FilterMenuListItem.js";

export type IFilterMenuSelectableSectionProps<TData> = {
    items: IUiListboxItem<TData, never>[];
    selectedItemId?: string;
    onSelect: (item: IUiListboxItem<TData, never>) => void;
    onClose: () => void;
    ariaAttributes: UiListboxAriaAttributes;
};

export function FilterMenuSelectableSection<TData>({
    items,
    selectedItemId,
    onSelect,
    onClose,
    ariaAttributes,
}: IFilterMenuSelectableSectionProps<TData>) {
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
                <FilterMenuListItem
                    item={item}
                    onSelect={onSelect}
                    isFocused={isFocused}
                    isSelected={isSelected}
                />
            )}
        />
    );
}
