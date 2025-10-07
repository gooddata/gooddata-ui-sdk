// (C) 2022-2025 GoodData Corporation

import { MutableRefObject, useMemo } from "react";

import cx from "classnames";
import { IntlShape, useIntl } from "react-intl";

import { DateGranularity, IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownButton,
    OverlayPositionType,
    SingleSelectListItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { AlertMetric, AlertMetricComparator, AlertMetricComparatorType } from "../../types.js";
import { translateGranularity } from "../utils/granularity.js";
import { isChangeOrDifferenceOperator } from "../utils/guards.js";

export interface IAlertComparisonPeriodSelectProps {
    alert: IAutomationMetadataObject | undefined;
    measure: AlertMetric | undefined;
    overlayPositionType?: OverlayPositionType;
    selectedComparison?: AlertMetricComparatorType;
    onComparisonChange: (comparison: AlertMetricComparatorType) => void;
    canManageComparison: boolean;
    id: string;
    closeOnParentScroll?: boolean;
}

export function AlertComparisonPeriodSelect(props: IAlertComparisonPeriodSelectProps) {
    const {
        alert,
        measure,
        overlayPositionType,
        selectedComparison,
        canManageComparison,
        onComparisonChange,
        id,
        closeOnParentScroll,
    } = props;
    const intl = useIntl();

    const selectedOperator = useMemo(() => {
        return measure?.comparators.find((a) => a.comparator === selectedComparison);
    }, [measure?.comparators, selectedComparison]);

    const comparisons = useMemo(() => {
        const sp = measure?.comparators.find(
            (a) => a.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
        );
        const pp = measure?.comparators.find(
            (a) => a.comparator === AlertMetricComparatorType.PreviousPeriod,
        );

        return [
            sp?.granularity && pp?.granularity !== DateGranularity["year"]
                ? {
                      title: intl.formatMessage(
                          { id: "insightAlert.config.compare_with_sp_granularity" },
                          {
                              period: translateGranularity(intl, sp.granularity),
                          },
                      ),
                      type: AlertMetricComparatorType.SamePeriodPreviousYear,
                  }
                : {
                      title: intl.formatMessage({ id: "insightAlert.config.compare_with_sp" }),
                      type: AlertMetricComparatorType.SamePeriodPreviousYear,
                  },
            pp?.granularity
                ? {
                      title: intl.formatMessage(
                          { id: "insightAlert.config.compare_with_pp_granularity" },
                          {
                              period: translateGranularity(intl, pp.granularity),
                          },
                      ),
                      type: AlertMetricComparatorType.PreviousPeriod,
                  }
                : {
                      title: intl.formatMessage({ id: "insightAlert.config.compare_with_pp" }),
                      type: AlertMetricComparatorType.PreviousPeriod,
                  },
        ];
    }, [intl, measure?.comparators]);

    // If alert is not defined or the measure does not have any comparators, return null
    if (!alert || !isChangeOrDifferenceOperator(alert.alert)) {
        return null;
    }

    // If the measure has only one comparator, return the label with possibility to
    // select the comparison period
    // If feature flag is not enabled, return the label with the selected comparison period
    if (measure?.comparators.length === 1 || !canManageComparison) {
        return <div className="gd-edit-alert__measure-info">{getButtonValue(selectedOperator, intl)}</div>;
    }

    return (
        <Dropdown
            closeOnParentScroll={closeOnParentScroll}
            overlayPositionType={overlayPositionType}
            autofocusOnOpen
            renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                return (
                    <DropdownButton
                        id={id}
                        value={getButtonValue(selectedOperator, intl)}
                        onClick={toggleDropdown}
                        className={cx(
                            "gd-alert-comparison-select__button s-alert-comparison-select",
                            "button-dropdown",
                            "dropdown-button",
                            {
                                "gd-alert-comparison-select__button--open": isOpen,
                                "is-active": isOpen,
                            },
                        )}
                        buttonRef={buttonRef as MutableRefObject<HTMLElement>}
                        dropdownId={dropdownId}
                        isOpen={isOpen}
                    />
                );
            }}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                const listboxItems = comparisons.map((comparison) => ({
                    type: "interactive" as const,
                    id: comparison.type.toString(),
                    stringTitle: comparison.title,
                    data: comparison,
                }));

                return (
                    <UiListbox
                        shouldKeyboardActionStopPropagation
                        shouldKeyboardActionPreventDefault
                        dataTestId="s-alert-comparison-select-list"
                        items={listboxItems}
                        selectedItemId={selectedComparison?.toString()}
                        onSelect={(item) => {
                            if (item.data.type !== selectedComparison) {
                                onComparisonChange(item.data.type);
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
                                    className="gd-alert-comparison-select__list-item"
                                />
                            );
                        }}
                    />
                );
            }}
        />
    );
}

function getButtonValue(selectedOperator: AlertMetricComparator | undefined, intl: IntlShape): string {
    if (selectedOperator?.comparator === AlertMetricComparatorType.SamePeriodPreviousYear) {
        if (selectedOperator.granularity && selectedOperator.granularity !== DateGranularity["year"]) {
            return intl.formatMessage(
                { id: "insightAlert.config.compare_with_sp_granularity" },
                { period: translateGranularity(intl, selectedOperator.granularity) },
            );
        } else {
            return intl.formatMessage({ id: "insightAlert.config.compare_with_sp" });
        }
    }

    if (selectedOperator?.comparator === AlertMetricComparatorType.PreviousPeriod) {
        if (selectedOperator.granularity) {
            return intl.formatMessage(
                { id: "insightAlert.config.compare_with_pp_granularity" },
                { period: translateGranularity(intl, selectedOperator.granularity) },
            );
        } else {
            return intl.formatMessage({ id: "insightAlert.config.compare_with_pp" });
        }
    }

    return " - ";
}
