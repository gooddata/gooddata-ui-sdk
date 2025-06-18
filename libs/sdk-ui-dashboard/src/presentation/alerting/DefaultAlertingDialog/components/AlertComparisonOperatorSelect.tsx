// (C) 2024-2025 GoodData Corporation
import {
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
} from "@gooddata/sdk-model";
import { Button, Dropdown, OverlayPositionType, SingleSelectListItem, UiListbox } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import React, { useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { AlertMetric } from "../../types.js";

import { OPERATORS, OperatorItemType } from "../constants.js";
import { useOperators } from "../hooks/useOperators.js";

type SeparatorItem = {
    type: "separator";
};

type HeaderItem = {
    type: "header";
    title?: string;
    info?: string;
};

type StaticItemData = SeparatorItem | HeaderItem;

export interface IAlertComparisonOperatorSelectProps {
    measure: AlertMetric | undefined;
    selectedComparisonOperator: IAlertComparisonOperator | undefined;
    selectedRelativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined;
    onComparisonOperatorChange: (metric: AlertMetric, comparisonOperator: IAlertComparisonOperator) => void;
    onRelativeOperatorChange: (
        metric: AlertMetric,
        relativeOperator: IAlertRelativeOperator,
        relativeArithmeticOperator: IAlertRelativeArithmeticOperator,
    ) => void;
    overlayPositionType?: OverlayPositionType;
    id: string;
    closeOnParentScroll?: boolean;
}

export const AlertComparisonOperatorSelect = (props: IAlertComparisonOperatorSelectProps) => {
    const {
        measure,
        selectedComparisonOperator,
        onComparisonOperatorChange,
        selectedRelativeOperator,
        onRelativeOperatorChange,
        overlayPositionType,
        id,
        closeOnParentScroll,
    } = props;
    const selectedComparisonItem = selectedComparisonOperator
        ? OPERATORS.find((option) => option.id === selectedComparisonOperator)!
        : undefined;
    const selectedRelativeItem = selectedRelativeOperator
        ? OPERATORS.find(
              (option) => option.id === `${selectedRelativeOperator[1]}.${selectedRelativeOperator[0]}`,
          )!
        : undefined;

    const intl = useIntl();
    const ref = useRef<HTMLElement | null>(null);

    const operators = useOperators(props.measure);

    if (!measure) {
        return null;
    }

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
                            className={cx(
                                "gd-alert-comparison-operator-select__button s-alert-operator-select",
                                {
                                    "is-active": isOpen,
                                },
                            )}
                            size="small"
                            variant="secondary"
                            iconLeft={selectedComparisonItem?.icon ?? selectedRelativeItem?.icon}
                            iconRight={`gd-icon-navigate${isOpen ? "up" : "down"}`}
                            onClick={toggleDropdown}
                            accessibilityConfig={{
                                role: "button",
                                popupId: dropdownId,
                                isExpanded: isOpen,
                            }}
                            ref={buttonRef}
                        >
                            {intl.formatMessage({
                                id: selectedComparisonItem?.title ?? selectedRelativeItem?.title,
                            })}
                        </Button>
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

                const selectedItemId = (selectedComparisonItem?.id ?? selectedRelativeItem?.id)?.toString();

                return (
                    <UiListbox<OperatorItemType<string | IAlertComparisonOperator>, StaticItemData>
                        shouldKeyboardActionStopPropagation={true}
                        shouldKeyboardActionPreventDefault={true}
                        dataTestId="s-alert-operator-select-list"
                        items={listboxItems}
                        maxWidth={ref.current?.offsetWidth}
                        selectedItemId={selectedItemId}
                        onSelect={(item) => {
                            const operatorItem = item.data;
                            const [first, second] = operatorItem.id.toString().split(".");
                            if (first && !second) {
                                onComparisonOperatorChange(measure, first as IAlertComparisonOperator);
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
};
