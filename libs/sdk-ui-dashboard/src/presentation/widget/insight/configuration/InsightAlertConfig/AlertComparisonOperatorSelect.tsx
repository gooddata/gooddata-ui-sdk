// (C) 2024 GoodData Corporation
import React from "react";
import { Dropdown, Button, List, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import { IAlertComparisonOperator } from "@gooddata/sdk-model";
import cx from "classnames";
import { COMPARISON_OPERATOR_OPTIONS, DROPDOWN_ITEM_HEIGHT } from "./constants.js";
import { useIntl } from "react-intl";

export interface IAlertComparisonOperatorSelectProps {
    selectedComparisonOperator: IAlertComparisonOperator;
    onComparisonOperatorChange: (comparisonOperator: IAlertComparisonOperator) => void;
}

export const AlertComparisonOperatorSelect = (props: IAlertComparisonOperatorSelectProps) => {
    const { selectedComparisonOperator, onComparisonOperatorChange } = props;
    const selectedItem = COMPARISON_OPERATOR_OPTIONS.find(
        (option) => option.id === selectedComparisonOperator,
    )!;
    const intl = useIntl();

    return (
        <div className="gd-alert-comparison-operator-select">
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => {
                    return (
                        <Button
                            className={cx(
                                "gd-alert-comparison-operator-select__button s-alert-operator-select",
                                {
                                    "is-active": isOpen,
                                },
                            )}
                            size="small"
                            variant="secondary"
                            iconLeft={selectedItem.icon}
                            iconRight={`gd-icon-navigate${isOpen ? "up" : "down"}`}
                            onClick={toggleDropdown}
                        >
                            {intl.formatMessage({ id: selectedItem.title })}
                        </Button>
                    );
                }}
                renderBody={({ closeDropdown }) => {
                    return (
                        <List
                            className="gd-alert-comparison-operator-select__list s-alert-operator-select-list"
                            items={COMPARISON_OPERATOR_OPTIONS}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            renderItem={(i) => (
                                <SingleSelectListItem
                                    key={i.rowIndex}
                                    icon={
                                        i.item.icon ? (
                                            <div
                                                className={cx(
                                                    "gd-alert-comparison-operator-select__icon",
                                                    i.item.icon,
                                                )}
                                            />
                                        ) : undefined
                                    }
                                    title={intl.formatMessage({ id: i.item.title })}
                                    isSelected={i.item === selectedItem}
                                    onClick={() => {
                                        if (i.item.id) {
                                            onComparisonOperatorChange(i.item.id);
                                            closeDropdown();
                                        }
                                    }}
                                />
                            )}
                        />
                    );
                }}
            />
        </div>
    );
};
