// (C) 2022-2026 GoodData Corporation

import { type MutableRefObject, useMemo } from "react";

import cx from "classnames";
import { type IntlShape, useIntl } from "react-intl";

import {
    type DateAttributeGranularity,
    DateGranularity,
    type IAutomationMetadataObject,
} from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownButton,
    type OverlayPositionType,
    SingleSelectListItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { type AlertMetric, type AlertMetricComparator, AlertMetricComparatorType } from "../../types.js";
import { translateGranularity } from "../utils/granularity.js";
import { isChangeOrDifferenceOperator } from "../utils/guards.js";

export interface IAlertComparisonPeriodSelectProps {
    alert: IAutomationMetadataObject | undefined;
    measure: AlertMetric | undefined;
    overlayPositionType?: OverlayPositionType;
    selectedComparison?: AlertMetricComparatorType;
    selectedGranularity?: DateAttributeGranularity;
    onComparisonChange: (
        comparison: AlertMetricComparatorType,
        granularity?: DateAttributeGranularity,
    ) => void;
    id: string;
    closeOnParentScroll?: boolean;
}

export function AlertComparisonPeriodSelect({
    alert,
    measure,
    overlayPositionType,
    selectedComparison,
    selectedGranularity,
    onComparisonChange,
    id,
    closeOnParentScroll,
}: IAlertComparisonPeriodSelectProps) {
    const intl = useIntl();

    const selectedOperator = useMemo(() => {
        return measure?.comparators.find(
            (a) =>
                a.comparator === selectedComparison &&
                (selectedGranularity ? selectedGranularity === a.granularity : true),
        );
    }, [measure?.comparators, selectedComparison, selectedGranularity]);

    const comparisons = useMemo(() => {
        const sps =
            measure?.comparators.filter(
                (a) => a.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
            ) ?? [];
        const pps =
            measure?.comparators.filter((a) => a.comparator === AlertMetricComparatorType.PreviousPeriod) ??
            [];

        const items: {
            title: string;
            type: AlertMetricComparatorType;
            granularity?: DateAttributeGranularity;
        }[] = [];

        // Iterate over SamePeriodPreviousYear comparators
        sps.forEach((sp) => {
            const pp = pps.find((pp) => pp.granularity === sp.granularity);
            // Has granularity set and previous period is not year
            if (sp.granularity) {
                if (pp?.granularity === DateGranularity["year"]) {
                    items.push({
                        title: intl.formatMessage({ id: "insightAlert.config.compare_with_sp" }),
                        type: AlertMetricComparatorType.SamePeriodPreviousYear,
                        granularity: sp.granularity,
                    });
                } else {
                    items.push({
                        title: intl.formatMessage(
                            { id: "insightAlert.config.compare_with_sp_granularity" },
                            {
                                period: translateGranularity(intl, sp.granularity),
                            },
                        ),
                        type: AlertMetricComparatorType.SamePeriodPreviousYear,
                        granularity: sp.granularity,
                    });
                }
            } else {
                items.push({
                    title: intl.formatMessage({ id: "insightAlert.config.compare_with_sp" }),
                    type: AlertMetricComparatorType.SamePeriodPreviousYear,
                    granularity: undefined,
                });
            }
        });
        // Iterate over PreviousPeriod comparators
        pps.forEach((pp) => {
            // Previous period has granularity set
            if (pp.granularity) {
                items.push({
                    title: intl.formatMessage(
                        { id: "insightAlert.config.compare_with_pp_granularity" },
                        {
                            period: translateGranularity(intl, pp.granularity),
                        },
                    ),
                    type: AlertMetricComparatorType.PreviousPeriod,
                    granularity: pp.granularity,
                });
            } else {
                items.push({
                    title: intl.formatMessage({ id: "insightAlert.config.compare_with_pp" }),
                    type: AlertMetricComparatorType.PreviousPeriod,
                    granularity: undefined,
                });
            }
        });

        return items;
    }, [intl, measure?.comparators]);

    // If alert is not defined or the measure does not have any comparators, return null
    if (!alert || !isChangeOrDifferenceOperator(alert.alert)) {
        return null;
    }

    // If the measure has only one comparator, return the label with possibility to
    // select the comparison period
    if (measure?.comparators.length === 1) {
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
                        accessibilityConfig={{
                            ariaExpanded: isOpen,
                            popupType: "listbox",
                        }}
                    />
                );
            }}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                const listboxItems = comparisons.map((comparison) => ({
                    type: "interactive" as const,
                    id: `${comparison.type}-${comparison.granularity ?? "none"}`,
                    stringTitle: comparison.title,
                    data: comparison,
                }));

                return (
                    <UiListbox
                        shouldKeyboardActionStopPropagation
                        shouldKeyboardActionPreventDefault
                        dataTestId="s-alert-comparison-select-list"
                        items={listboxItems}
                        selectedItemId={`${selectedComparison ?? "none"}-${selectedGranularity ?? "none"}`}
                        onSelect={(item) => {
                            if (
                                item.data.type !== selectedComparison ||
                                item.data.granularity !== selectedGranularity
                            ) {
                                onComparisonChange(item.data.type, item.data.granularity);
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
