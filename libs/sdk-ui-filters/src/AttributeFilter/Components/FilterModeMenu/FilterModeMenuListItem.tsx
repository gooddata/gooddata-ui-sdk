// (C) 2007-2026 GoodData Corporation

import {
    type IUiListboxInteractiveItem,
    type IUiListboxInteractiveItemProps,
    SingleSelectListItem,
    UiIcon,
} from "@gooddata/sdk-ui-kit";

type IFilterModeMenuListItemProps<TData> = {
    item: IUiListboxInteractiveItem<TData>;
    onSelect: IUiListboxInteractiveItemProps<TData>["onSelect"];
    isFocused: boolean;
    isSelected: boolean;
};

export function FilterModeMenuListItem<TData>({
    item,
    onSelect,
    isFocused,
    isSelected,
}: IFilterModeMenuListItemProps<TData>) {
    return (
        <SingleSelectListItem
            className="gd-filter-mode-menu__item"
            title={item.stringTitle}
            isSelected={isSelected}
            isFocused={isFocused}
            onClick={onSelect}
            info={isSelected ? "selected" : undefined}
            infoRenderer={() =>
                isSelected ? (
                    <span className="gd-filter-mode-menu__item-check">
                        <UiIcon type="check" color="primary" size={14} />
                    </span>
                ) : null
            }
        />
    );
}
