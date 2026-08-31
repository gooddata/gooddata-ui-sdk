// (C) 2024-2026 GoodData Corporation

import { type MutableRefObject, type ReactElement } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IAlertTriggerMode } from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownButton,
    type IUiListboxItem,
    SingleSelectListItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { type IAlertingDialogTriggerModeProps } from "../types.js";

import { messages } from "./messages.js";

const options: {
    title: string;
    id: IAlertTriggerMode;
}[] = [
    {
        title: messages.alertTriggerModeAlways.id,
        id: "ALWAYS",
    },
    {
        title: messages.alertTriggerModeOnce.id,
        id: "ONCE",
    },
    {
        title: messages.alertTriggerModeOncePerInterval.id,
        id: "ONCE_PER_INTERVAL",
    },
];

/**
 * Default render of the alerting dialog's trigger-mode field: the dropdown selecting when the
 * alert fires. Props-driven — the bare control without its label; reads no dialog context (only
 * `useIntl`). The default dialog and {@link AlertingDialogTriggerMode} render it with
 * {@link useAlertingDialogTriggerModeProps} inside {@link AutomationDialogFormField}.
 *
 * @alpha
 */
export function DefaultAlertingDialogTriggerMode({
    id,
    selectedTriggerMode,
    onTriggerModeChange,
    overlayPositionType,
    closeOnParentScroll,
    enableAlertOncePerInterval,
}: IAlertingDialogTriggerModeProps): ReactElement {
    const selectedOption = options.find((o) => o.id === selectedTriggerMode);
    const intl = useIntl();

    return (
        <div className="gd-alert-trigger-mode-select">
            <Dropdown
                closeOnParentScroll={closeOnParentScroll}
                overlayPositionType={overlayPositionType}
                autofocusOnOpen
                renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                    return (
                        <DropdownButton
                            id={id}
                            value={selectedOption ? intl.formatMessage({ id: selectedOption.title }) : ""}
                            onClick={toggleDropdown}
                            className={cx(
                                "gd-edit-alert-trigger-mode-select__button s-alert-trigger-mode-select",
                            )}
                            buttonRef={buttonRef as MutableRefObject<HTMLElement>}
                            dropdownId={dropdownId}
                            isOpen={isOpen}
                            accessibilityConfig={{
                                ariaExpanded: isOpen,
                                popupType: "listbox",
                            }}
                        />
                    );
                }}
                renderBody={({ closeDropdown, ariaAttributes }) => {
                    const listboxItems: IUiListboxItem<{ title: string; id: IAlertTriggerMode }>[] = options
                        .filter((item) => item.id !== "ONCE_PER_INTERVAL" || enableAlertOncePerInterval)
                        .map((option) => ({
                            type: "interactive",
                            id: option.id,
                            stringTitle: intl.formatMessage({ id: option.title }),
                            data: option,
                        }));

                    return (
                        <UiListbox
                            shouldKeyboardActionStopPropagation
                            shouldKeyboardActionPreventDefault
                            dataTestId="s-alert-trigger-mode-select-list"
                            items={listboxItems}
                            selectedItemId={selectedTriggerMode}
                            onSelect={(item) => {
                                if (selectedTriggerMode !== item.id) {
                                    onTriggerModeChange(item.id as IAlertTriggerMode);
                                }
                            }}
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                                return (
                                    <SingleSelectListItem
                                        title={item.stringTitle}
                                        isSelected={isSelected}
                                        isFocused={isFocused}
                                        onClick={onSelect}
                                        className="gd-alert-trigger-mode-select__list-item"
                                    />
                                );
                            }}
                        />
                    );
                }}
            />
        </div>
    );
}
