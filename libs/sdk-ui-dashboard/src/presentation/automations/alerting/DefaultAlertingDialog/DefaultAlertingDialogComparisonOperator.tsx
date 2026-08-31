// (C) 2024-2026 GoodData Corporation

import { type MutableRefObject, type ReactElement, useRef } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    type IAlertComparisonOperator,
    type IAlertRelativeArithmeticOperator,
    type IAlertRelativeOperator,
} from "@gooddata/sdk-model";
import { AI_OPERATOR, AI_OPERATORS } from "@gooddata/sdk-ui-ext";
import { Dropdown, DropdownButton, SingleSelectListItem, UiListbox } from "@gooddata/sdk-ui-kit";

import { type IAlertingDialogComparisonOperatorProps } from "../types.js";

import { OPERATORS, type OperatorItemType } from "./constants.js";
import { useOperators } from "./hooks/useOperators.js";

type SeparatorItem = {
    type: "separator";
};

type HeaderItem = {
    type: "header";
    title?: string;
    info?: string;
};

type StaticItemData = SeparatorItem | HeaderItem;

/**
 * Default render of the alerting dialog's comparison-operator field: the dropdown selecting the
 * condition's operator (fixed threshold, change, difference, anomaly detection); renders nothing
 * without a measure. Props-driven — the bare control without its label; reads no dialog context
 * (only `useIntl`). The default dialog and {@link AlertingDialogComparisonOperator} render it with
 * {@link useAlertingDialogComparisonOperatorProps} inside {@link AutomationDialogFormField}.
 *
 * @alpha
 */
export function DefaultAlertingDialogComparisonOperator(
    props: IAlertingDialogComparisonOperatorProps,
): ReactElement | null {
    const {
        measure,
        selectedComparisonOperator,
        onComparisonOperatorChange,
        selectedRelativeOperator,
        onRelativeOperatorChange,
        selectedAiOperator,
        onAnomalyDetectionChange,
        overlayPositionType,
        id,
        closeOnParentScroll,
        enableAnomalyDetectionAlert,
    } = props;
    const selectedComparisonItem = selectedComparisonOperator
        ? OPERATORS.find((option) => option.id === selectedComparisonOperator)!
        : undefined;
    const selectedRelativeItem = selectedRelativeOperator
        ? OPERATORS.find(
              (option) => option.id === `${selectedRelativeOperator[1]}.${selectedRelativeOperator[0]}`,
          )!
        : undefined;
    const selectedAiItem = selectedAiOperator
        ? OPERATORS.find((option) => option.id === `${AI_OPERATOR}.${AI_OPERATORS.ANOMALY_DETECTION}`)!
        : undefined;

    const intl = useIntl();
    const ref = useRef<HTMLElement | null>(null);

    const operators = useOperators(props.measure, enableAnomalyDetectionAlert);

    if (!measure) {
        return null;
    }

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
                            className={cx(
                                "gd-alert-comparison-operator-select__button s-alert-operator-select",
                                {
                                    "is-active": isOpen,
                                },
                            )}
                            value={intl.formatMessage({
                                id:
                                    selectedComparisonItem?.title ??
                                    selectedRelativeItem?.title ??
                                    selectedAiItem?.title,
                            })}
                            iconLeft={
                                selectedComparisonItem?.icon ??
                                selectedRelativeItem?.icon ??
                                selectedAiItem?.icon
                            }
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
                const listboxItems = operators.map((item) => {
                    if (item.type === "separator") {
                        return {
                            type: "static" as const,
                            data: { type: "separator" as const },
                        };
                    } else if (item.type === "header") {
                        return {
                            type: "static" as const,
                            data: {
                                type: "header" as const,
                                title: item.title,
                                info: item.info,
                            },
                        };
                    } else {
                        return {
                            type: "interactive" as const,
                            id: item.id.toString(),
                            stringTitle: item.title ? intl.formatMessage({ id: item.title }) : "",
                            data: item,
                        };
                    }
                });

                const selectedItemId = (
                    selectedComparisonItem?.id ??
                    selectedRelativeItem?.id ??
                    selectedAiItem?.id
                )?.toString();

                return (
                    <UiListbox<OperatorItemType<string>, StaticItemData>
                        shouldKeyboardActionStopPropagation
                        shouldKeyboardActionPreventDefault
                        dataTestId="s-alert-operator-select-list"
                        items={listboxItems}
                        maxWidth={ref.current?.offsetWidth}
                        selectedItemId={selectedItemId}
                        onSelect={(item) => {
                            const operatorItem = item.data;
                            const [first, second] = operatorItem.id.toString().split(".");
                            if (first === AI_OPERATOR && second === AI_OPERATORS.ANOMALY_DETECTION) {
                                onAnomalyDetectionChange(measure);
                                return;
                            }
                            if (first && !second) {
                                onComparisonOperatorChange(measure, first as IAlertComparisonOperator);
                                return;
                            }
                            if (first && second) {
                                onRelativeOperatorChange(
                                    measure,
                                    second as IAlertRelativeOperator,
                                    first as IAlertRelativeArithmeticOperator,
                                );
                            }
                        }}
                        onClose={closeDropdown}
                        ariaAttributes={ariaAttributes}
                        InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                            return (
                                <SingleSelectListItem
                                    type={item.data.type}
                                    icon={
                                        item.data.icon ? (
                                            <div
                                                className={cx(
                                                    "gd-alert-comparison-operator-select__icon",
                                                    item.data.icon,
                                                )}
                                            />
                                        ) : undefined
                                    }
                                    title={item.stringTitle}
                                    info={
                                        item.data.info ? (
                                            <FormattedMessage
                                                id={item.data.info}
                                                values={{
                                                    spacer: (
                                                        <div className="gd-alert-comparison-operator-tooltip-spacer" />
                                                    ),
                                                }}
                                            />
                                        ) : undefined
                                    }
                                    isSelected={isSelected}
                                    isFocused={isFocused}
                                    onClick={onSelect}
                                    className="gd-alert-comparison-operator-select__list-item"
                                />
                            );
                        }}
                        StaticItemComponent={({ item }) => {
                            const headerItem = item.data.type === "header" ? item.data : undefined;

                            return (
                                <SingleSelectListItem
                                    type={item.data.type}
                                    title={
                                        headerItem?.title
                                            ? intl.formatMessage({ id: headerItem.title })
                                            : undefined
                                    }
                                    info={
                                        headerItem?.info ? (
                                            <FormattedMessage
                                                id={headerItem.info}
                                                values={{
                                                    spacer: (
                                                        <div className="gd-alert-comparison-operator-tooltip-spacer" />
                                                    ),
                                                }}
                                            />
                                        ) : undefined
                                    }
                                    className="gd-alert-comparison-operator-select__list-item"
                                />
                            );
                        }}
                    />
                );
            }}
        />
    );
}
