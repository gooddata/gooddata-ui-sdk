// (C) 2019-2025 GoodData Corporation

import { MutableRefObject, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    Dropdown,
    DropdownButton,
    OverlayPositionType,
    SingleSelectListItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { AlertMetric } from "../../types.js";
import { getMeasureTitle } from "../utils/getters.js";

export interface IAlertMetricSelectProps {
    id?: string;
    selectedMeasure: AlertMetric | undefined;
    onMeasureChange: (measure: AlertMetric) => void;
    measures: AlertMetric[];
    overlayPositionType?: OverlayPositionType;
    closeOnParentScroll?: boolean;
}

const measureIcon = <div className="gd-alert-measure-select__icon gd-icon-metric" />;

export function AlertMeasureSelect({
    id,
    selectedMeasure,
    onMeasureChange,
    measures,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertMetricSelectProps) {
    const intl = useIntl();
    const ref = useRef<HTMLElement | null>(null);
    const selectedMeasureTitle = selectedMeasure
        ? getMeasureTitle(selectedMeasure.measure)
        : intl.formatMessage({ id: "insightAlert.config.selectMetric" });

    return (
        <Dropdown
            closeOnParentScroll={closeOnParentScroll}
            overlayPositionType={overlayPositionType}
            autofocusOnOpen={true}
            renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                return (
                    <div
                        ref={(item) => {
                            ref.current = item;
                        }}
                    >
                        <DropdownButton
                            id={id}
                            className={cx("gd-alert-measure-select__button s-alert-measure-select")}
                            value={selectedMeasureTitle}
                            iconLeft={selectedMeasure ? "gd-icon-metric" : undefined}
                            onClick={toggleDropdown}
                            buttonRef={buttonRef as MutableRefObject<HTMLElement>}
                            dropdownId={dropdownId}
                            isOpen={isOpen}
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

                const selectedIndex = measures.findIndex(
                    (m) => selectedMeasure && m.measure === selectedMeasure.measure,
                );
                const selectedId = selectedIndex === -1 ? undefined : `measure-${selectedIndex}`;

                return (
                    <UiListbox
                        shouldKeyboardActionStopPropagation={true}
                        shouldKeyboardActionPreventDefault={true}
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
