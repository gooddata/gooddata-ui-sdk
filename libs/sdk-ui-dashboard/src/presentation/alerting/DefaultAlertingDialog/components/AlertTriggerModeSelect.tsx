// (C) 2024-2025 GoodData Corporation
import {
    Dropdown,
    Button,
    SingleSelectListItem,
    OverlayPositionType,
    UiListbox,
    IUiListboxItem,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { IAlertTriggerMode } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import { messages } from "../messages.js";

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
];

export interface IAlertTriggerModeSelectProps {
    id: string;
    selectedTriggerMode: IAlertTriggerMode;
    onTriggerModeChange: (triggerMode: IAlertTriggerMode) => void;
    overlayPositionType?: OverlayPositionType;
    closeOnParentScroll?: boolean;
}

export function AlertTriggerModeSelect({
    id,
    selectedTriggerMode,
    onTriggerModeChange,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertTriggerModeSelectProps) {
    const selectedOption = options.find((o) => o.id === selectedTriggerMode);
    const intl = useIntl();

    return (
        <div className="gd-alert-trigger-mode-select">
            <Dropdown
                closeOnParentScroll={closeOnParentScroll}
                overlayPositionType={overlayPositionType}
                autofocusOnOpen={true}
                renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                    return (
                        <Button
                            id={id}
                            onClick={toggleDropdown}
                            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                            size="small"
                            variant="secondary"
                            className={cx(
                                "gd-edit-alert-trigger-mode-select__button s-alert-trigger-mode-select",
                                {
                                    "is-active": isOpen,
                                },
                            )}
                            accessibilityConfig={{
                                role: "button",
                                popupId: dropdownId,
                                isExpanded: isOpen,
                            }}
                            ref={buttonRef}
                        >
                            {selectedOption ? intl.formatMessage({ id: selectedOption.title }) : ""}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown, ariaAttributes }) => {
                    const listboxItems: IUiListboxItem<{ title: string; id: IAlertTriggerMode }>[] =
                        options.map((option) => ({
                            type: "interactive",
                            id: option.id,
                            stringTitle: intl.formatMessage({ id: option.title }),
                            data: option,
                        }));

                    return (
                        <UiListbox
                            shouldKeyboardActionStopPropagation={true}
                            shouldKeyboardActionPreventDefault={true}
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
