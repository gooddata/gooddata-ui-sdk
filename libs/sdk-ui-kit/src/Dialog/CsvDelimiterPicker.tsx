// (C) 2026 GoodData Corporation

import { type IntlShape, useIntl } from "react-intl";

import {
    CSV_DELIMITER_PRESETS,
    type CsvDelimiterPreset,
    type CsvDelimiterValidationError,
} from "@gooddata/sdk-model";

import { type IUiMenuInteractiveItem } from "../@ui/UiMenu/types.js";
import { UiMenu } from "../@ui/UiMenu/UiMenu.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import { DropdownButton } from "../Dropdown/DropdownButton.js";
import { Input } from "../Form/Input.js";
import { useIdPrefixed } from "../utils/useId.js";

const DEFAULT_MENU_MIN_WIDTH = 260;

type CsvDelimiterMenuData = { interactive: CsvDelimiterPreset };

const getPresetLabels = (intl: IntlShape) => ({
    comma: intl.formatMessage({
        id: "csvDelimiterPicker.option.comma",
        defaultMessage: "Comma",
    }),
    semicolon: intl.formatMessage({
        id: "csvDelimiterPicker.option.semicolon",
        defaultMessage: "Semicolon",
    }),
    pipe: intl.formatMessage({
        id: "csvDelimiterPicker.option.pipe",
        defaultMessage: "Pipe",
    }),
    tab: intl.formatMessage({
        id: "csvDelimiterPicker.option.tab",
        defaultMessage: "Tab",
    }),
    custom: intl.formatMessage({
        id: "csvDelimiterPicker.option.custom",
        defaultMessage: "Custom",
    }),
});

const getMenuItems = (
    presetLabels: Record<CsvDelimiterPreset, string>,
): IUiMenuInteractiveItem<CsvDelimiterMenuData>[] => [
    ...CSV_DELIMITER_PRESETS.map(
        (item): IUiMenuInteractiveItem<CsvDelimiterMenuData> => ({
            type: "interactive",
            id: item.id,
            stringTitle: presetLabels[item.id],
            iconRight: (
                <span className="gd-csv-delimiter-picker-preview" aria-hidden="true">
                    (<span className="gd-csv-delimiter-picker-preview-char">{item.previewSymbol}</span>)
                </span>
            ),
            data: item.id,
        }),
    ),
    {
        type: "interactive",
        id: "custom",
        stringTitle: presetLabels.custom,
        data: "custom",
    },
];

/**
 * @internal
 */
export interface ICsvDelimiterPickerValue {
    selectedPreset: CsvDelimiterPreset;
    customDelimiter: string;
}

/**
 * @internal
 */
export interface ICsvDelimiterPickerProps {
    /** Current picker state — use `getCsvDelimiterState` from `@gooddata/sdk-model` to initialize. */
    value: ICsvDelimiterPickerValue;
    /** Called when the user changes the preset or custom delimiter value. */
    onChange: (value: ICsvDelimiterPickerValue) => void;
    /** Validation error to display below the custom input. */
    validationError?: CsvDelimiterValidationError;
    /** If provided, renders an h4 label above the dropdown. */
    label?: string;
    /** Called when Enter is pressed in the custom input. */
    onEnterKeyPress?: () => void;
}

/**
 * Reusable CSV delimiter preset picker with dropdown, custom input, and validation.
 *
 * This is a controlled component — the consumer manages state via
 * `getCsvDelimiterState` from `@gooddata/sdk-model` and passes it through props.
 *
 * @internal
 */
export function CsvDelimiterPicker({
    value,
    onChange,
    validationError,
    label,
    onEnterKeyPress,
}: ICsvDelimiterPickerProps) {
    const intl = useIntl();
    const { selectedPreset, customDelimiter } = value;

    const labelId = useIdPrefixed("csv-delimiter-label");
    const menuId = useIdPrefixed("csv-delimiter-menu");

    const presetLabels = getPresetLabels(intl);
    const menuItems = getMenuItems(presetLabels);

    const customInputLabel = intl.formatMessage({
        id: "csvDelimiterPicker.customInput",
        defaultMessage: "Custom CSV delimiter",
    });

    const menuAriaLabel = intl.formatMessage({
        id: "csvDelimiterPicker.menuLabel",
        defaultMessage: "CSV delimiter",
    });

    return (
        <>
            {label ? <h4 id={labelId}>{label}</h4> : null}
            <Dropdown
                fullscreenOnMobile={false}
                renderButton={({ isOpen, toggleDropdown }) => (
                    <DropdownButton
                        className="s-csv-delimiter-dropdown"
                        value={presetLabels[selectedPreset]}
                        isOpen={isOpen}
                        onClick={toggleDropdown}
                        accessibilityConfig={{
                            ...(label ? { ariaLabelledBy: labelId } : {}),
                            popupType: "listbox",
                            ariaExpanded: isOpen,
                            ...(isOpen ? { ariaControls: menuId } : {}),
                        }}
                        isFullWidth
                    />
                )}
                renderBody={({ closeDropdown }) => (
                    <UiMenu
                        items={menuItems.map((item) => ({
                            ...item,
                            isSelected: selectedPreset === item.data,
                        }))}
                        itemDataTestId={(item) => `s-csv-delimiter-${item.id}`}
                        onSelect={(item) => {
                            onChange({ selectedPreset: item.data, customDelimiter });
                        }}
                        onClose={closeDropdown}
                        shouldCloseOnSelect
                        ariaAttributes={{
                            "aria-label": menuAriaLabel,
                            id: menuId,
                        }}
                        minWidth={DEFAULT_MENU_MIN_WIDTH}
                    />
                )}
                autofocusOnOpen
            />

            {selectedPreset === "custom" ? (
                <div className="gd-csv-delimiter-picker-custom-field">
                    <Input
                        className="gd-csv-delimiter-picker-custom-input s-csv-delimiter-custom-input"
                        value={customDelimiter}
                        onChange={(value) => onChange({ selectedPreset, customDelimiter: String(value) })}
                        hasError={Boolean(validationError)}
                        autofocus
                        onEnterKeyPress={onEnterKeyPress}
                        accessibilityConfig={{
                            ariaLabel: customInputLabel,
                            ariaInvalid: Boolean(validationError),
                        }}
                    />
                    {validationError ? (
                        <div className="gd-csv-delimiter-picker-error">
                            {validationError === "singleCharacter"
                                ? intl.formatMessage({
                                      id: "csvDelimiterPicker.validation.singleCharacter",
                                      defaultMessage: "Use a single character",
                                  })
                                : intl.formatMessage({
                                      id: "csvDelimiterPicker.validation.unsupported",
                                      defaultMessage: "This character isn't supported",
                                  })}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
