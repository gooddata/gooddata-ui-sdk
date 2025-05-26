// (C) 2019-2025 GoodData Corporation
import React, { useRef } from "react";
import {
    Dropdown,
    Button,
    SingleSelectListItem,
    OverlayPositionType,
    UiListbox,
    IUiListboxItem,
    IUiListboxInteractiveItem,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { useIntl } from "react-intl";

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

export const AlertMeasureSelect = ({
    id,
    selectedMeasure,
    onMeasureChange,
    measures,
    overlayPositionType,
    closeOnParentScroll,
}: IAlertMetricSelectProps) => {
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
                        <Button
                            id={id}
                            className={cx("gd-alert-measure-select__button s-alert-measure-select", {
                                "is-active": isOpen,
                            })}
                            size="small"
                            variant="secondary"
                            iconLeft={selectedMeasure ? "gd-icon-metric" : undefined}
                            iconRight={`gd-icon-navigate${isOpen ? "up" : "down"}`}
                            onClick={toggleDropdown}
                            accessibilityConfig={{
                                role: "button",
                                popupId: dropdownId,
                                isExpanded: isOpen,
                            }}
                            buttonRef={buttonRef as React.MutableRefObject<HTMLElement>}
                        >
                            {selectedMeasureTitle}
                        </Button>
                    </div>
                );
            }}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                const listboxItems: IUiListboxItem<AlertMetric>[] = measures.map(
                    (measure, index) =>
                        ({
                            type: "interactive",
                            id: `measure-${index}`,
                            stringTitle: getMeasureTitle(measure.measure),
                            data: measure,
                        } as IUiListboxInteractiveItem<AlertMetric>),
                );

                const selectedIndex = measures.findIndex(
                    (m) => selectedMeasure && m.measure === selectedMeasure.measure,
                );
                const selectedId = selectedIndex !== -1 ? `measure-${selectedIndex}` : undefined;

                return (
                    <UiListbox
                        shouldKeyboardActionStopPropagation={true}
                        shouldKeyboardActionPreventDefault={true}
                        className="gd-alert-measure-select__list s-alert-measure-select-list"
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
};
