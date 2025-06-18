// (C) 2022-2025 GoodData Corporation
import { DateGranularity, IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Button, Dropdown, SingleSelectListItem, OverlayPositionType, UiListbox } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

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

export const AlertComparisonPeriodSelect = (props: IAlertComparisonPeriodSelectProps) => {
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
            sp?.granularity && pp?.granularity !== DateGranularity.year
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
        return <DropdownButtonLabel selectedOperator={selectedOperator} />;
    }

    return (
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
                        variant="primary"
                        className={cx(
                            "gd-alert-comparison-select__button s-alert-comparison-select",
                            "button-dropdown",
                            "dropdown-button",
                            {
                                "gd-alert-comparison-select__button--open": isOpen,
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
                        <DropdownButtonLabel selectedOperator={selectedOperator} />
                    </Button>
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
                        shouldKeyboardActionStopPropagation={true}
                        shouldKeyboardActionPreventDefault={true}
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
};

interface DropdownButtonLabelProps {
    selectedOperator?: AlertMetricComparator;
}

const DropdownButtonLabel = (props: DropdownButtonLabelProps) => {
    const intl = useIntl();
    const { selectedOperator } = props;

    if (selectedOperator?.comparator === AlertMetricComparatorType.SamePeriodPreviousYear) {
        return (
            <div className="gd-edit-alert__measure-info">
                {selectedOperator.granularity && selectedOperator.granularity !== DateGranularity.year ? (
                    <FormattedMessage
                        id="insightAlert.config.compare_with_sp_granularity"
                        values={{
                            period: translateGranularity(intl, selectedOperator.granularity),
                        }}
                    />
                ) : (
                    <FormattedMessage id="insightAlert.config.compare_with_sp" />
                )}
            </div>
        );
    }

    if (selectedOperator?.comparator === AlertMetricComparatorType.PreviousPeriod) {
        return (
            <div className="gd-edit-alert__measure-info">
                {selectedOperator.granularity ? (
                    <FormattedMessage
                        id="insightAlert.config.compare_with_pp_granularity"
                        values={{
                            period: translateGranularity(intl, selectedOperator.granularity),
                        }}
                    />
                ) : (
                    <FormattedMessage id="insightAlert.config.compare_with_pp" />
                )}
            </div>
        );
    }

    return <div className="gd-edit-alert__measure-info"> - </div>;
};
