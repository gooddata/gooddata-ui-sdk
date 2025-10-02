// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { useDebouncedState } from "@gooddata/sdk-ui";

import { FILTER_CHIP_MAX_WIDTH, FILTER_OPTION_ALL_VALUE } from "./constants.js";
import UiAsyncTableDropdownItem from "./UiAsyncTableDropdownItem.js";
import { getFilterOptionsMap } from "./utils.js";
import { ContentDivider } from "../../../Dialog/ContentDivider.js";
import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { DropdownList } from "../../../Dropdown/DropdownList.js";
import { Message } from "../../../Messages/index.js";
import { UiButton } from "../../UiButton/UiButton.js";
import { UiChip } from "../../UiChip/UiChip.js";
import { UiAutofocus } from "../../UiFocusManager/UiAutofocus.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { UiAsyncTableFilterOption, UiAsyncTableFilterProps } from "../types.js";

/**
 * @internal
 */
export function UiAsyncTableFilter(props: UiAsyncTableFilterProps) {
    const intl = useIntl();
    const {
        filteredOptions,
        searchValue,
        isApplyButtonEnabled,
        labelWithSelected,
        setSearchValue,
        onItemClick,
        isItemSelected,
        onApplyFactory,
        onCancelFactory,
    } = useAsyncTableFilterState(props);

    const { isMultiSelect, isFiltersTooLarge, isSmall } = props;

    return (
        <div className={e("filter")}>
            <Dropdown
                renderButton={({ toggleDropdown, isOpen }) => (
                    <UiChip
                        label={labelWithSelected}
                        maxWidth={isSmall ? FILTER_CHIP_MAX_WIDTH : undefined}
                        onClick={() => toggleDropdown()}
                        isActive={isOpen}
                    />
                )}
                alignPoints={[{ align: "bl tl" }]}
                renderBody={({ closeDropdown }) => (
                    <UiAutofocus>
                        <>
                            <DropdownList<UiAsyncTableFilterOption>
                                items={filteredOptions}
                                renderItem={({ item }) => (
                                    <UiAsyncTableDropdownItem
                                        label={item.label ?? String(item.value)}
                                        secondaryLabel={item.secondaryLabel}
                                        onClick={() => onItemClick(item, closeDropdown)}
                                        isSelected={isItemSelected(item)}
                                        isMultiSelect={isMultiSelect}
                                    />
                                )}
                                showSearch={true}
                                searchPlaceholder={intl.formatMessage(messages["filterSearchPlaceholder"])}
                                searchString={searchValue}
                                onSearch={setSearchValue}
                                renderVirtualisedList
                                onKeyDownSelect={(item) => onItemClick(item, closeDropdown)}
                            />
                            {isMultiSelect ? (
                                <div className={e("filter-bottom")}>
                                    <ContentDivider />
                                    <div className={e("filter-buttons")}>
                                        <UiButton
                                            label="Cancel"
                                            onClick={onCancelFactory(closeDropdown)}
                                            variant="secondary"
                                            size="small"
                                        />
                                        <UiButton
                                            label="Apply"
                                            onClick={onApplyFactory(closeDropdown)}
                                            variant="primary"
                                            size="small"
                                            isDisabled={!isApplyButtonEnabled}
                                        />
                                    </div>
                                </div>
                            ) : null}
                            {isFiltersTooLarge ? (
                                <div className={e("filter-error")}>
                                    <Message type="error">
                                        <FormattedMessage
                                            id={messages["filterTooLarge"].id}
                                            values={{
                                                strong: (chunks) => <strong>{chunks}</strong>,
                                            }}
                                        />
                                    </Message>
                                </div>
                            ) : null}
                        </>
                    </UiAutofocus>
                )}
            />
        </div>
    );
}

function useAsyncTableFilterState({
    options,
    selected,
    onItemsSelect,
    isMultiSelect,
    label,
}: UiAsyncTableFilterProps) {
    const intl = useIntl();
    const [checkedItems, setCheckedItems] = useState<Map<string, UiAsyncTableFilterOption>>(
        getFilterOptionsMap(selected),
    );
    const [searchValue, setSearchValue, debouncedSearchValue] = useDebouncedState("", 300);

    useEffect(() => {
        setCheckedItems(getFilterOptionsMap(selected));
    }, [selected]);

    const filteredOptions = useMemo(() => {
        const searchLowerCased = debouncedSearchValue.toLowerCase();
        const filteredOptions = options.filter((option) =>
            option.label.toLowerCase().includes(searchLowerCased),
        );
        if (isMultiSelect && filteredOptions.length > 0) {
            return [
                {
                    value: FILTER_OPTION_ALL_VALUE,
                    label: intl.formatMessage(messages["filterOptionAll"]),
                    secondaryLabel: `(${options.length})`,
                },
                ...filteredOptions,
            ];
        }
        return filteredOptions;
    }, [options, debouncedSearchValue, isMultiSelect, intl]);

    const isAllSelected = useMemo(() => {
        return checkedItems.size === options.length;
    }, [checkedItems, options]);

    const onSelectAll = useCallback(() => {
        if (isAllSelected) {
            setCheckedItems(new Map());
        } else {
            setCheckedItems(getFilterOptionsMap(options));
        }
    }, [options, isAllSelected]);

    const onItemClick = useCallback(
        (item: UiAsyncTableFilterOption, closeDropdown: () => void) => {
            if (isMultiSelect) {
                if (item.value === FILTER_OPTION_ALL_VALUE) {
                    onSelectAll();
                    return;
                }
                setCheckedItems((prev) => {
                    const newCheckedItems = new Map(prev);
                    if (newCheckedItems.has(item.value)) {
                        newCheckedItems.delete(item.value);
                    } else {
                        newCheckedItems.set(item.value, item);
                    }
                    return newCheckedItems;
                });
            } else {
                onItemsSelect([item]);
                closeDropdown();
            }
        },
        [onItemsSelect, isMultiSelect, onSelectAll],
    );

    const isItemSelected = useCallback(
        (item: UiAsyncTableFilterOption) => {
            if (isMultiSelect) {
                if (item.value === FILTER_OPTION_ALL_VALUE) {
                    return isAllSelected;
                }
                return checkedItems.has(item.value);
            }
            return selected?.some((selectedItem) => selectedItem.value === item.value);
        },
        [checkedItems, isMultiSelect, isAllSelected, selected],
    );

    // deep comparison of selected and checked items
    const isApplyButtonEnabled = useMemo(() => {
        const selectedValues = new Set(selected?.map((item) => item.value) || []);
        const checkedValues = new Set(checkedItems.keys());

        if (checkedValues.size === 0) {
            return false;
        }

        if (selectedValues.size !== checkedValues.size) {
            return true;
        }

        for (const value of selectedValues) {
            if (!checkedValues.has(value)) {
                return true;
            }
        }

        return false;
    }, [selected, checkedItems]);

    const labelWithSelected = useMemo(() => {
        let selectedLabels;
        if (selected?.length === options.length) {
            selectedLabels = intl.formatMessage(messages["filterOptionAll"]);
        } else {
            selectedLabels = selected?.map((item) => item.label).join(", ");
        }
        return `${label}: ${selectedLabels}`;
    }, [label, selected, options, intl]);

    const onApplyFactory = useCallback(
        (closeDropdown: () => void) => () => {
            onItemsSelect(Array.from(checkedItems.values()));
            closeDropdown();
        },
        [onItemsSelect, checkedItems],
    );

    const onCancelFactory = useCallback(
        (closeDropdown: () => void) => () => {
            setCheckedItems(getFilterOptionsMap(selected));
            closeDropdown();
        },
        [selected],
    );

    return {
        filteredOptions,
        searchValue,
        isApplyButtonEnabled,
        labelWithSelected,
        setSearchValue,
        onItemClick,
        isItemSelected,
        onApplyFactory,
        onCancelFactory,
    };
}
