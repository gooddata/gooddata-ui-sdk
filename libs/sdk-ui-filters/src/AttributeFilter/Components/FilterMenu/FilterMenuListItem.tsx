// (C) 2007-2026 GoodData Corporation

import {
    type IUiListboxInteractiveItem,
    type IUiListboxInteractiveItemProps,
    SingleSelectListItem,
    UiIcon,
} from "@gooddata/sdk-ui-kit";

import { type ISelectionTypeItemData } from "./types.js";

type IFilterMenuListItemProps<TData> = {
    item: IUiListboxInteractiveItem<TData>;
    onSelect: IUiListboxInteractiveItemProps<TData>["onSelect"];
    isFocused: boolean;
    isSelected: boolean;
};

export function FilterMenuListItem<TData>({
    item,
    onSelect,
    isFocused,
    isSelected,
}: IFilterMenuListItemProps<TData>) {
    const selectionTypeData = item.data as unknown as ISelectionTypeItemData | undefined;
    const selectionTypeTestId =
        selectionTypeData && "selectionType" in selectionTypeData
            ? `selection-type-${selectionTypeData.selectionType}`
            : undefined;

    return (
        <SingleSelectListItem
            className="gd-filter-menu__item"
            dataTestId={selectionTypeTestId}
            title={item.stringTitle}
            isSelected={isSelected}
            isFocused={isFocused}
            onClick={onSelect}
            info={isSelected ? "selected" : undefined}
            infoRenderer={() =>
                isSelected ? (
                    <span className="gd-filter-menu__item-check">
                        <UiIcon type="check" color="primary" size={14} />
                    </span>
                ) : null
            }
        />
    );
}
