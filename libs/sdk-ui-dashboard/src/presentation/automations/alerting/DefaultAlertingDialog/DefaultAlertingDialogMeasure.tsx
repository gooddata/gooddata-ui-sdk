// (C) 2019-2026 GoodData Corporation

import { type MutableRefObject, type ReactElement, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Dropdown, DropdownButton, SingleSelectListItem, UiListbox } from "@gooddata/sdk-ui-kit";

import { type IAlertingDialogMeasureProps } from "../types.js";
import { getMeasureTitle } from "../utils/getters.js";

const measureIcon = <div className="gd-alert-measure-select__icon gd-icon-metric" />;

/**
 * Default render of the alerting dialog's measure field: the dropdown selecting the measure the
 * condition targets. Props-driven — the bare control without its label; reads no dialog context
 * (only `useIntl`). The default dialog and {@link AlertingDialogMeasure} render it with
 * {@link useAlertingDialogMeasureProps} inside {@link AutomationDialogFormField}.
 *
 * @alpha
 */
export function DefaultAlertingDialogMeasure({
    id,
    disabled,
    selectedMeasure,
    onMeasureChange,
    measures,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertingDialogMeasureProps): ReactElement {
    const intl = useIntl();
    const ref = useRef<HTMLElement | null>(null);
    const selectedMeasureTitle = selectedMeasure
        ? getMeasureTitle(selectedMeasure.measure)
        : intl.formatMessage({ id: "insightAlert.config.selectMetric" });

    return (
        <Dropdown
            closeOnParentScroll={closeOnParentScroll}
            overlayPositionType={overlayPositionType}
            autofocusOnOpen
            renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                return (
                    <div
                        ref={(item) => {
                            ref.current = item;
                        }}
                    >
                        <DropdownButton
                            id={id}
                            disabled={disabled}
                            className={cx("gd-alert-measure-select__button s-alert-measure-select")}
                            value={selectedMeasureTitle}
                            iconLeft={selectedMeasure ? "gd-icon-metric" : undefined}
                            onClick={toggleDropdown}
                            buttonRef={buttonRef as MutableRefObject<HTMLElement>}
                            dropdownId={dropdownId}
                            isOpen={isOpen}
                            accessibilityConfig={{
                                ariaExpanded: isOpen,
                                popupType: "listbox",
                            }}
                        />
                    </div>
                );
            }}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                const listboxItems = measures.map((measure, index) => ({
                    type: "interactive" as const,
                    id: `measure-${index}`,
                    stringTitle: getMeasureTitle(measure.measure) ?? "",
                    data: measure,
                }));

                const selectedIndex = measures.findIndex((m) => m.measure === selectedMeasure?.measure);
                const selectedId = selectedIndex === -1 ? undefined : `measure-${selectedIndex}`;

                return (
                    <UiListbox
                        shouldKeyboardActionStopPropagation
                        shouldKeyboardActionPreventDefault
                        dataTestId="s-alert-measure-select-list"
                        items={listboxItems}
                        maxWidth={ref.current?.offsetWidth}
                        selectedItemId={selectedId}
                        onSelect={(item) => {
                            onMeasureChange(item.data);
                        }}
                        onClose={closeDropdown}
                        ariaAttributes={ariaAttributes}
                        InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                            return (
                                <SingleSelectListItem
                                    icon={measureIcon}
                                    title={item.stringTitle}
                                    isSelected={isSelected}
                                    isFocused={isFocused}
                                    onClick={onSelect}
                                    className="gd-alert-measure-select__list-item"
                                />
                            );
                        }}
                    />
                );
            }}
        />
    );
}
