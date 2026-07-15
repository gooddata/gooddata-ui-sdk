// (C) 2026 GoodData Corporation

import cx from "classnames";

import {
    DropdownButton,
    type IUiListboxInteractiveItemProps,
    type IUiListboxItem,
    SingleSelectListItem,
    UiDropdown,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

interface ISelectItem<T extends string> {
    value: T;
    title: string;
    icon?: string;
}

interface ICfSelectProps<T extends string> {
    value?: T;
    items: readonly ISelectItem<T>[];
    onSelect: (value: T) => void;
    placeholder?: string;
}

// One listbox option; the iconRenderer sizes the type (attribute/metric) and wide operator glyphs.
function CfListItem({
    item,
    isSelected,
    isFocused,
    onSelect,
}: IUiListboxInteractiveItemProps<ISelectItem<string>>) {
    const { title, icon } = item.data;
    return (
        <div className="gd-cf-select__option">
            <SingleSelectListItem
                title={title}
                icon={icon}
                iconRenderer={(ic) => {
                    if (typeof ic !== "string" || !ic) {
                        return null;
                    }
                    const isTypeIcon = ic === "gd-icon-attribute" || ic === "gd-icon-metric";
                    return (
                        <span
                            aria-hidden="true"
                            className={cx("gd-list-icon", ic, { "gd-cf-type-icon": isTypeIcon })}
                        />
                    );
                }}
                isSelected={isSelected}
                isFocused={isFocused}
                onClick={onSelect}
            />
        </div>
    );
}

export function CfSelect<T extends string>({ value, items, onSelect, placeholder }: ICfSelectProps<T>) {
    const selected = items.find((item) => item.value === value);
    const listItems: IUiListboxItem<ISelectItem<T>, null>[] = items.map((item) => ({
        type: "interactive",
        id: item.value,
        stringTitle: item.title,
        data: item,
    }));
    return (
        <UiDropdown
            width="same-as-anchor"
            fullWidthButton
            closeOnParentScroll
            closeOnMouseDrag
            closeOnEscape
            autofocusOnOpen
            accessibilityConfig={{ triggerRole: "combobox", popupRole: "listbox" }}
            renderButton={({ isOpen, toggleDropdown, ref, dropdownId }) => (
                <DropdownButton
                    value={selected?.title ?? placeholder ?? ""}
                    iconLeft={selected?.icon}
                    isOpen={isOpen}
                    isFullWidth
                    onClick={toggleDropdown}
                    buttonRef={ref}
                    dropdownId={dropdownId}
                    accessibilityConfig={{ popupType: "listbox" }}
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <UiListbox<ISelectItem<T>, null>
                    items={listItems}
                    selectedItemId={value}
                    ariaAttributes={ariaAttributes}
                    InteractiveItemComponent={CfListItem}
                    onClose={closeDropdown}
                    onSelect={(listItem) => onSelect(listItem.data.value)}
                />
            )}
        />
    );
}
