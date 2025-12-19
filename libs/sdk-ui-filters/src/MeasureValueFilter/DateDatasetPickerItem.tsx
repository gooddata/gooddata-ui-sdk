// (C) 2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { UiButton, UiListbox } from "@gooddata/sdk-ui-kit";

import { type IDateDatasetOption } from "./typings.js";

/**
 * Props for the DateDatasetPickerItem component.
 * @internal
 */
export interface IDateDatasetPickerItemProps {
    /** Available date dataset options */
    dateDatasetOptions: IDateDatasetOption[];
    /** Currently selected date dataset key */
    selectedDateDatasetKey: string | undefined;
    /** Whether the dropdown is open */
    isDropdownOpen: boolean;
    /** Callback when a date dataset is selected */
    onSelect: (key: string) => void;
    /** Callback to toggle the dropdown open state */
    onToggleDropdown: () => void;
    /** ID for the listbox (used for accessibility) */
    listboxId: string;
    /** Intl instance for localization */
    intl: IntlShape;
}

/**
 * A component that renders a date dataset picker with a dropdown selector.
 * Used within the MeasureValueFilter AttributePicker to allow users to select
 * which date dataset to use for date-based dimensionality.
 *
 * @internal
 */
export function DateDatasetPickerItem({
    dateDatasetOptions,
    selectedDateDatasetKey,
    isDropdownOpen,
    onSelect,
    onToggleDropdown,
    listboxId,
    intl,
}: IDateDatasetPickerItemProps) {
    const selectedDatasetTitle =
        dateDatasetOptions.find((o) => o.key === selectedDateDatasetKey)?.title ?? "";

    return (
        <div className="gd-mvf-attribute-picker-date-dataset">
            <div className="gd-mvf-attribute-picker-date-dataset-label">
                {intl.formatMessage({ id: "mvf.attributePicker.dateAs" })}
            </div>
            <div className="gd-mvf-attribute-picker-date-dataset-control">
                <UiButton
                    variant="secondary"
                    size="small"
                    label={selectedDatasetTitle}
                    iconAfter={isDropdownOpen ? "navigateUp" : "navigateDown"}
                    onClick={onToggleDropdown}
                    dataTestId="s-mvf-date-dataset-selector"
                />
                {isDropdownOpen ? (
                    <div className="gd-mvf-attribute-picker-date-dataset-dropdown">
                        <UiListbox
                            isCompact
                            items={dateDatasetOptions.map((o) => ({
                                type: "interactive",
                                id: o.key,
                                stringTitle: o.title,
                                data: undefined,
                            }))}
                            selectedItemId={selectedDateDatasetKey}
                            onSelect={(item) => {
                                onSelect(item.id);
                            }}
                            shouldCloseOnSelect={false}
                            ariaAttributes={{
                                id: `${listboxId}-date-dataset`,
                                "aria-label": intl.formatMessage({
                                    id: "mvf.attributePicker.dateAs",
                                }),
                            }}
                            dataTestId="s-mvf-date-dataset-list"
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
