// (C) 2007-2026 GoodData Corporation

import {
    type IUiListboxInteractiveItem,
    type IUiListboxInteractiveItemProps,
    SingleSelectListItem,
    UiIcon,
} from "@gooddata/sdk-ui-kit";

import { type IModeItemData } from "./types.js";

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
    const modeData = item.data as unknown as IModeItemData | undefined;
    const filterModeTestId = modeData && "mode" in modeData ? `filter-mode-${modeData.mode}` : undefined;

    return (
        <SingleSelectListItem
            className="gd-filter-mode-menu__item"
            dataTestId={filterModeTestId}
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
