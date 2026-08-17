// (C) 2026 GoodData Corporation

import { useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IParameterAllowedValue, getParameterAllowedValueTitle } from "@gooddata/sdk-model";

import { bem } from "../@ui/@utils/bem.js";
import { type IDropdownBodyRenderProps } from "../Dropdown/Dropdown.js";
import { DropdownList } from "../Dropdown/DropdownList.js";
import { SingleSelectListItem } from "../List/ListItem.js";

const { b } = bem("gd-ui-kit-parameter-control");

const SEARCH_THRESHOLD = 7;

const messages = defineMessages({
    searchPlaceholder: { id: "gs.list.search.placeholder" },
    searchLabel: { id: "parameter_filter.dropdown.search_label" },
    defaultSuffix: { id: "parameter_filter.dropdown.default_suffix" },
});

/**
 * @internal
 */
export interface IAllowedValuesParameterControlDropdownProps {
    name: string;
    value: string;
    defaultValue: string;
    allowedValues: IParameterAllowedValue[];
    ariaAttributes?: IDropdownBodyRenderProps["ariaAttributes"];
    onApply: (value: string) => void;
    onCancel: () => void;
}

/**
 * Dropdown panel for picking a string parameter value out of its allowed values. Renders effective
 * titles only and applies on click — there is no draft, hence no Apply/Cancel.
 *
 * @internal
 */
export function AllowedValuesParameterControlDropdown({
    name,
    value,
    defaultValue,
    allowedValues,
    ariaAttributes,
    onApply,
    onCancel,
}: IAllowedValuesParameterControlDropdownProps) {
    const intl = useIntl();
    const [search, setSearch] = useState("");
    const showSearch = allowedValues.length > SEARCH_THRESHOLD;
    const items = useMemo(() => filterAllowedValuesByTitle(allowedValues, search), [allowedValues, search]);
    const isCurrentValue = (item: IParameterAllowedValue) => item.value === value;

    return (
        <div
            {...ariaAttributes}
            className={`${b({ dropdown: true, "allowed-values": true })} overlay gd-dialog gd-dropdown`}
            data-testid="parameter-control-allowed-values-dropdown"
        >
            <DropdownList<IParameterAllowedValue>
                items={items}
                itemTitleGetter={getParameterAllowedValueTitle}
                showSearch={showSearch}
                searchPlaceholder={intl.formatMessage(messages.searchPlaceholder)}
                searchLabel={intl.formatMessage(messages.searchLabel)}
                onSearch={setSearch}
                closeDropdown={onCancel}
                accessibilityConfig={{ role: "listbox", ariaLabel: name }}
                getIsItemSelected={isCurrentValue}
                onKeyDownSelect={(item) => onApply(item.value)}
                renderItem={({ item, isSelected }) => (
                    <SingleSelectListItem
                        title={getParameterAllowedValueTitle(item)}
                        isSelected={isSelected}
                        onClick={() => onApply(item.value)}
                        suffix={
                            item.value === defaultValue
                                ? intl.formatMessage(messages.defaultSuffix)
                                : undefined
                        }
                    />
                )}
            />
        </div>
    );
}

function filterAllowedValuesByTitle(allowedValues: IParameterAllowedValue[], search: string) {
    if (!search) {
        return allowedValues;
    }
    const needle = search.toLowerCase();
    return allowedValues.filter((allowedValue) =>
        getParameterAllowedValueTitle(allowedValue).toLowerCase().includes(needle),
    );
}
