// (C) 2019-2026 GoodData Corporation

import { type ChangeEvent, memo, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type ISeparators,
    type MeasureValueFilterCondition,
    type ObjRefInScope,
    isComparisonCondition,
    isComparisonConditionOperator,
    isRangeCondition,
    isRangeConditionOperator,
} from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger, Button, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { ConditionInputSection } from "./ConditionInputSection.js";
import { DimensionalitySection, areDimensionalitySetsEqual } from "./DimensionalitySection.js";
import { intervalIncludesZero } from "./helpers/intervalIncludesZero.js";
import { OperatorDropdown } from "./OperatorDropdown.js";
import { PreviewSection } from "./PreviewSection.js";
import { TreatNullValuesAsZeroCheckbox } from "./TreatNullValuesAsZeroCheckbox.js";
import { type IMeasureValueFilterValue, type MeasureValueFilterOperator } from "./types.js";
import { type IDimensionalityItem, type WarningMessage } from "./typings.js";
import { WarningMessageComponent } from "./WarningMessage.js";

interface IDropdownBodyProps {
    operator: MeasureValueFilterOperator;
    conditions: MeasureValueFilterCondition[];
    enableMultipleConditions?: boolean;
    enableRankingWithMvf?: boolean;
    applyOnResult?: boolean;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    disableAutofocus?: boolean;
    onCancel?: () => void;
    measureTitle?: string;
    onApply: (
        conditions: MeasureValueFilterCondition[] | null,
        dimensionality?: ObjRefInScope[],
        applyOnResult?: boolean,
    ) => void;
    separators?: ISeparators;
    format?: string;
    useShortFormat?: boolean;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroValue?: boolean;
    valuePrecision?: number;
    enableOperatorSelection?: boolean;
    dimensionality?: IDimensionalityItem[];
    insightDimensionality?: IDimensionalityItem[];
    isDimensionalityEnabled?: boolean;
    catalogDimensionality?: IDimensionalityItem[];
    onDimensionalityChange?: (dimensionality: ObjRefInScope[]) => void;
    isLoadingCatalogDimensionality?: boolean;
}

interface IDropdownBodyState {
    conditions: Array<{
        operator: MeasureValueFilterOperator;
        value: IMeasureValueFilterValue;
        showError: {
            value?: boolean;
            from?: boolean;
            to?: boolean;
        };
    }>;
    enabledTreatNullValuesAsZero: boolean | undefined;
    dimensionality: IDimensionalityItem[];
}

const DefaultValuePrecision = 6;
const ALIGN_POINTS = [{ align: "cr cl" }];

const toFormCondition = (
    condition: MeasureValueFilterCondition,
): { operator: MeasureValueFilterOperator; value: IMeasureValueFilterValue } => {
    if (isComparisonCondition(condition)) {
        return {
            operator: condition.comparison.operator,
            value: { value: condition.comparison.value },
        };
    }
    return {
        operator: condition.range.operator,
        value: { from: condition.range.from, to: condition.range.to },
    };
};

const getTreatNullValuesAsZeroFromConditions = (conditions: MeasureValueFilterCondition[]): boolean => {
    return conditions.some(
        (c) =>
            (isComparisonCondition(c) && c.comparison.treatNullValuesAs !== undefined) ||
            (isRangeCondition(c) && c.range.treatNullValuesAs !== undefined),
    );
};

const areConditionValuesEqual = (
    operator: MeasureValueFilterOperator,
    a: IMeasureValueFilterValue,
    b: IMeasureValueFilterValue,
): boolean => {
    if (operator === "ALL") {
        return true;
    }
    if (isComparisonConditionOperator(operator)) {
        return a.value === b.value;
    }
    if (isRangeConditionOperator(operator)) {
        return a.from === b.from && a.to === b.to;
    }
    return true;
};

export const DropdownBodyWithIntl = memo(function DropdownBodyWithIntl(props: IDropdownBodyProps) {
    const intl = useIntl();

    const addConditionTooltip = intl.formatMessage({
        id: "mvf.addConditionTooltip",
    });
    const addConditionDisabledTooltip = intl.formatMessage({
        id: "mvf.addConditionTooltip.disabled",
    });
    const removeConditionTooltip = intl.formatMessage({
        id: "mvf.removeConditionTooltip",
    });
    const conditionsJoinerOr = intl.formatMessage({
        id: "mvf.conditionsJoiner.or",
    });

    const {
        operator: propsOperator,
        conditions: propsConditions,
        enableMultipleConditions = false,
        enableRankingWithMvf = false,
        applyOnResult: initialApplyOnResult,
        usePercentage,
        treatNullAsZeroValue,
        valuePrecision = DefaultValuePrecision,
        isDimensionalityEnabled = true,
        insightDimensionality,
        separators,
        catalogDimensionality,
        onDimensionalityChange,
        isLoadingCatalogDimensionality,
    } = props;

    // This flag determines if the message, which explains different filter behavior, is shown for the filters
    // created before the dimensionality feature was introduced. The new filters or re-saved filters are
    // considered as "migrated" and the message is not shown.
    // We detect the old filters by checking that they have a dimensionality set. The new filters can't be
    // applied unless some dimensionality is set (some attribute is in the filter). The old filters did not
    // use the prop. However, if the new filter is created for Headline or Pivot without rows and columns
    // (i.e., insight without dimensionality), the message would be shown even when it should not. Because
    // filters for these insights could not be created before the dimensionality feature was introduced,
    // we can safely consider these filters as migrated. Filters created after the feature was introduced
    // may explicitly carry an empty dimensionality array to mark them as migrated even when created on an
    // insight without attributes. Likewise, an "ALL" filter with no conditions is treated as migrated.
    // Any change to the filter dimensionality will set the filter as migrated and will hide the message
    // until a user reopens the filter if he did not apply the change. If he did, the first part of the
    // condition will be true and the message will not be shown.
    const [isMigratedFilter, setIsMigratedFilter] = useState<boolean>(
        props.dimensionality !== undefined ||
            (insightDimensionality?.length ?? 0) === 0 ||
            (propsOperator === "ALL" && propsConditions.length === 0),
    );

    const trimToPrecision = useCallback(
        (n: number | undefined): number | undefined => {
            if (!n) {
                return n;
            }
            return parseFloat(n.toFixed(valuePrecision));
        },
        [valuePrecision],
    );

    const fromPercentToDecimal = useCallback(
        (n: number | undefined): number | undefined => (n ? n / 100 : n),
        [],
    );

    const fromDecimalToPercent = useCallback(
        (n: number | undefined): number | undefined => (n ? n * 100 : n),
        [],
    );

    const convertToPercentageValue = useCallback(
        (value: IMeasureValueFilterValue, operator: string): IMeasureValueFilterValue => {
            if (!value) {
                return value;
            }
            if (operator === "ALL") {
                return {};
            }

            return isComparisonConditionOperator(operator)
                ? { value: trimToPrecision(fromDecimalToPercent(value.value)) }
                : {
                      from: trimToPrecision(fromDecimalToPercent(value.from)),
                      to: trimToPrecision(fromDecimalToPercent(value.to)),
                  };
        },
        [trimToPrecision, fromDecimalToPercent],
    );

    // If the filter has dimensionality, use it; otherwise fall back to insight dimensionality (bucket defaults)
    const initialDimensionality = useMemo(
        () =>
            ((props.dimensionality?.length ?? 0) > 0
                ? props.dimensionality
                : (insightDimensionality ?? [])) ?? [],
        [props.dimensionality, insightDimensionality],
    );

    const [state, setState] = useState<IDropdownBodyState>(() => {
        const baseConditions = propsConditions.length > 0 ? propsConditions : [];
        const effectivePropsConditions = enableMultipleConditions
            ? baseConditions
            : baseConditions.slice(0, 1);
        const initialConditions =
            effectivePropsConditions.length > 0
                ? effectivePropsConditions.map(toFormCondition)
                : [{ operator: propsOperator || "ALL", value: {} }];

        return {
            conditions: initialConditions.map((c) => ({
                operator: c.operator,
                value: usePercentage ? convertToPercentageValue(c.value, c.operator) : c.value,
                showError: {},
            })),
            enabledTreatNullValuesAsZero:
                treatNullAsZeroValue ?? getTreatNullValuesAsZeroFromConditions(propsConditions),
            dimensionality: initialDimensionality,
        };
    });
    const [applyOnResult, setApplyOnResult] = useState<boolean>(initialApplyOnResult ?? true);

    // Keep the checkbox state in a ref to avoid edge cases where Apply is clicked
    // immediately after toggling the checkbox (before state update is reflected in callbacks).
    const enabledTreatNullValuesAsZeroRef = useRef<boolean | undefined>(state.enabledTreatNullValuesAsZero);
    enabledTreatNullValuesAsZeroRef.current = state.enabledTreatNullValuesAsZero;

    const convertToRawValue = useCallback(
        (value: IMeasureValueFilterValue, operator: string): IMeasureValueFilterValue => {
            if (!value) {
                return value;
            }
            if (operator === "ALL") {
                return {};
            }
            return isComparisonConditionOperator(operator)
                ? { value: trimToPrecision(fromPercentToDecimal(value.value)) }
                : {
                      from: trimToPrecision(fromPercentToDecimal(value.from)),
                      to: trimToPrecision(fromPercentToDecimal(value.to)),
                  };
        },
        [trimToPrecision, fromPercentToDecimal],
    );

    const initialFormConditions = useMemo(() => {
        const baseConditions = propsConditions.length > 0 ? propsConditions : [];
        const effectivePropsConditions = enableMultipleConditions
            ? baseConditions
            : baseConditions.slice(0, 1);
        const base =
            effectivePropsConditions.length > 0
                ? effectivePropsConditions.map(toFormCondition)
                : [{ operator: propsOperator || "ALL", value: {} }];

        return base.map((c) => ({
            operator: c.operator,
            value: usePercentage ? convertToPercentageValue(c.value, c.operator) : c.value,
        }));
    }, [propsConditions, propsOperator, usePercentage, convertToPercentageValue, enableMultipleConditions]);

    const isChanged = useCallback(() => {
        const stateConditions = state.conditions;
        const hasHiddenConditionsInProps = !enableMultipleConditions && propsConditions.length > 1;
        if (stateConditions.length !== initialFormConditions.length) {
            return true;
        }
        const anyConditionDiff = stateConditions.some((c, idx) => {
            const initial = initialFormConditions[idx];
            return (
                c.operator !== initial.operator ||
                !areConditionValuesEqual(c.operator, c.value, initial.value)
            );
        });

        // When enableRankingWithMvf is enabled, also check if applyOnResult changed
        const applyOnResultChanged = enableRankingWithMvf && applyOnResult !== (initialApplyOnResult ?? true);

        return (
            hasHiddenConditionsInProps ||
            anyConditionDiff ||
            applyOnResultChanged ||
            (state.enabledTreatNullValuesAsZero ?? false) !== (props.treatNullAsZeroValue ?? false) ||
            !areDimensionalitySetsEqual(initialDimensionality, state.dimensionality)
        );
    }, [
        enableMultipleConditions,
        propsConditions.length,
        state.conditions,
        state.enabledTreatNullValuesAsZero,
        props.treatNullAsZeroValue,
        initialDimensionality,
        state.dimensionality,
        initialFormConditions,
        enableRankingWithMvf,
        applyOnResult,
        initialApplyOnResult,
    ]);

    /*
     * Old isChanged implementation removed.
     */

    const isConditionValid = useCallback(
        (c: { operator: MeasureValueFilterOperator; value: IMeasureValueFilterValue }) => {
            if (c.operator === "ALL") {
                return true;
            }
            if (isComparisonConditionOperator(c.operator)) {
                const v = c.value.value;
                return v !== null && v !== undefined && !Number.isNaN(v);
            }
            if (isRangeConditionOperator(c.operator)) {
                const { from = null, to = null } = c.value;
                return !(from === null || to === null || Number.isNaN(from) || Number.isNaN(to));
            }
            return true;
        },
        [],
    );

    const isApplyButtonDisabled = useCallback(() => {
        // disable the Apply button when the filter has no currently set dimensionality but insight has it
        // (e.g., non-headline insight that can have the dimensionality) but only when supported via ff

        if (
            isDimensionalityEnabled &&
            state.dimensionality.length === 0 &&
            (insightDimensionality?.length ?? 0) > 0
        ) {
            return true;
        }

        const effectiveConditions = enableMultipleConditions
            ? state.conditions
            : state.conditions.slice(0, 1);

        // when there are multiple conditions, all of them must be defined
        const areValid = effectiveConditions.every((c) => isConditionValid(c));

        if (!areValid) {
            return true;
        }

        return !isChanged();
    }, [
        state.dimensionality,
        state.conditions,
        isDimensionalityEnabled,
        insightDimensionality,
        enableMultipleConditions,
        isConditionValid,
        isChanged,
    ]);

    const getApplyButtonTooltip = useCallback((): string | undefined => {
        if (!isApplyButtonDisabled()) {
            return undefined;
        }

        // Check for empty dimensionality first
        if (
            isDimensionalityEnabled &&
            state.dimensionality.length === 0 &&
            (insightDimensionality?.length ?? 0) > 0
        ) {
            return intl.formatMessage({ id: "mvf.applyButton.tooltip.emptyDimensionality" });
        }

        // Check for invalid conditions
        const effectiveConditions = enableMultipleConditions
            ? state.conditions
            : state.conditions.slice(0, 1);

        const areValid = effectiveConditions.every((c) => isConditionValid(c));

        if (!areValid) {
            return intl.formatMessage({ id: "mvf.applyButton.tooltip.emptyValues" });
        }

        // No changes
        return intl.formatMessage({ id: "mvf.applyButton.tooltip.noChanges" });
    }, [
        isApplyButtonDisabled,
        isDimensionalityEnabled,
        state.dimensionality,
        insightDimensionality,
        enableMultipleConditions,
        state.conditions,
        isConditionValid,
        intl,
    ]);

    const handleOperatorSelection = useCallback((index: number, operator: MeasureValueFilterOperator) => {
        setState((prev) => ({
            ...prev,
            conditions: prev.conditions.map((c, i) => (i === index ? { ...c, operator, touched: {} } : c)),
        }));
    }, []);

    // Generic handler for value changes (value/from/to fields)
    const createFieldChangeHandler = useCallback(
        (field: "value" | "from" | "to") => (index: number, fieldValue: number) => {
            setState((prev) => ({
                ...prev,
                conditions: prev.conditions.map((c, i) =>
                    i === index
                        ? {
                              ...c,
                              value: { ...c.value, [field]: fieldValue },
                              // Clear error if valid value is entered
                              showError: {
                                  ...c.showError,
                                  [field]: !!(
                                      c.showError[field] &&
                                      (fieldValue === null ||
                                          fieldValue === undefined ||
                                          Number.isNaN(fieldValue))
                                  ),
                              },
                          }
                        : c,
                ),
            }));
        },
        [],
    );

    const handleValueChange = useMemo(() => createFieldChangeHandler("value"), [createFieldChangeHandler]);
    const handleFromChange = useMemo(() => createFieldChangeHandler("from"), [createFieldChangeHandler]);
    const handleToChange = useMemo(() => createFieldChangeHandler("to"), [createFieldChangeHandler]);

    // Generic handler for blur events (value/from/to fields)
    const createFieldBlurHandler = useCallback(
        (field: "value" | "from" | "to") => (index: number) => {
            setState((prev) => ({
                ...prev,
                conditions: prev.conditions.map((c, i) => {
                    if (i !== index) {
                        return c;
                    }
                    const fieldValue = c.value[field];
                    const isInvalid =
                        fieldValue === null || fieldValue === undefined || Number.isNaN(fieldValue);
                    return {
                        ...c,
                        showError: { ...c.showError, [field]: isInvalid },
                    };
                }),
            }));
        },
        [],
    );

    const handleValueBlur = useMemo(() => createFieldBlurHandler("value"), [createFieldBlurHandler]);
    const handleFromBlur = useMemo(() => createFieldBlurHandler("from"), [createFieldBlurHandler]);
    const handleToBlur = useMemo(() => createFieldBlurHandler("to"), [createFieldBlurHandler]);

    const handleTreatNullAsZeroClicked = useCallback((checked: boolean) => {
        enabledTreatNullValuesAsZeroRef.current = checked;
        setState((prev) => ({ ...prev, enabledTreatNullValuesAsZero: checked }));
    }, []);

    const handleDimensionalityChange = useCallback(
        (dimensionality: IDimensionalityItem[]) => {
            setState((prev) => ({ ...prev, dimensionality }));
            onDimensionalityChange?.(dimensionality.map((item) => item.identifier));
            // dismiss a message shown for non-migrated filters (filters without dimensionality info)
            // once dimensionality has been changed
            setIsMigratedFilter(true);
        },
        [onDimensionalityChange],
    );

    const onApply = useCallback(() => {
        // If user tries to apply (button click / Enter), show validation errors
        // even if the inputs did not lose focus yet.
        setState((prev) => {
            const effectiveCount = enableMultipleConditions
                ? prev.conditions.length
                : Math.min(prev.conditions.length, 1);
            const effectiveIdxs = new Set(Array.from({ length: effectiveCount }, (_v, idx) => idx));
            return {
                ...prev,
                conditions: prev.conditions.map((c, idx) => {
                    if (!effectiveIdxs.has(idx)) {
                        return c;
                    }
                    if (c.operator === "ALL") {
                        return c;
                    }
                    if (isComparisonConditionOperator(c.operator)) {
                        return {
                            ...c,
                            showError: { ...c.showError, value: true },
                        };
                    }
                    if (isRangeConditionOperator(c.operator)) {
                        return {
                            ...c,
                            showError: { ...c.showError, from: true, to: true },
                        };
                    }
                    return c;
                }),
            };
        });

        if (isApplyButtonDisabled()) {
            return;
        }

        const { dimensionality: stateDimensionality, conditions: stateConditions } = state;
        const { usePercentage } = props;

        // Always include dimensionality in the output.
        // When current dimensionality matches insight defaults (same set, order-insensitive),
        // use the default order from insightDimensionality.
        let finalDimensionality: ObjRefInScope[] | undefined;
        if (insightDimensionality?.length) {
            if (areDimensionalitySetsEqual(stateDimensionality, insightDimensionality)) {
                // Use default order from insight dimensionality
                finalDimensionality = insightDimensionality.map((item) => item.identifier);
            } else {
                // Use current state order
                finalDimensionality =
                    stateDimensionality.length > 0
                        ? stateDimensionality.map((item) => item.identifier)
                        : undefined;
            }
        } else {
            // No insight defaults - use current state
            finalDimensionality =
                stateDimensionality.length > 0
                    ? stateDimensionality.map((item) => item.identifier)
                    : undefined;
        }

        const effectiveStateConditions = enableMultipleConditions
            ? stateConditions
            : stateConditions.slice(0, 1);

        const lastConditionOperator =
            effectiveStateConditions[effectiveStateConditions.length - 1]?.operator ?? "ALL";
        // Apply treat-null-values-as when enabled via checkbox (and feature is enabled),
        // regardless of live interval changes while editing. UI already hides the checkbox
        // when it is not relevant; if user managed to enable it, we honor it.
        const effectiveTreatNullAsZero =
            props.displayTreatNullAsZeroOption === true &&
            lastConditionOperator !== "ALL" &&
            (enabledTreatNullValuesAsZeroRef.current ?? false);

        const finalConditions = effectiveStateConditions
            .filter((c) => c.operator !== "ALL")
            .map((c): MeasureValueFilterCondition => {
                const rawValue = usePercentage ? convertToRawValue(c.value, c.operator) : c.value;
                const treatNullValuesAs = effectiveTreatNullAsZero ? 0 : undefined;
                if (isComparisonConditionOperator(c.operator)) {
                    return {
                        comparison: {
                            operator: c.operator,
                            value: rawValue.value as number,
                            ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
                        },
                    };
                }
                if (isRangeConditionOperator(c.operator)) {
                    return {
                        range: {
                            operator: c.operator,
                            from: rawValue.from as number,
                            to: rawValue.to as number,
                            ...(treatNullValuesAs === undefined ? {} : { treatNullValuesAs }),
                        },
                    };
                }

                // Should not happen because "ALL" conditions are filtered out above.
                return { comparison: { operator: "EQUAL_TO", value: 0 } };
            });

        props.onApply(
            finalConditions.length ? finalConditions : null,
            finalDimensionality,
            enableRankingWithMvf ? applyOnResult : undefined,
        );
    }, [
        isApplyButtonDisabled,
        state,
        props,
        convertToRawValue,
        insightDimensionality,
        enableMultipleConditions,
        enableRankingWithMvf,
        applyOnResult,
    ]);

    const { onCancel, warningMessage, displayTreatNullAsZeroOption, enableOperatorSelection } = props;
    const { enabledTreatNullValuesAsZero, dimensionality } = state;

    const isAllOperatorDisabled = useMemo(() => {
        return enableMultipleConditions && state.conditions.length > 1;
    }, [enableMultipleConditions, state.conditions.length]);

    // Determine if the checkbox should be shown based on whether zero is in ANY condition interval.
    // It is rendered only once, after the last condition (as per design).
    const shouldShowTreatNullAsZeroCheckbox = useMemo(() => {
        if (!displayTreatNullAsZeroOption) {
            return false;
        }
        const effectiveStateConditions = enableMultipleConditions
            ? state.conditions
            : state.conditions.slice(0, 1);
        if (effectiveStateConditions.length === 0) {
            return false;
        }
        const last = effectiveStateConditions[effectiveStateConditions.length - 1];
        if (!last || last.operator === "ALL") {
            return false;
        }
        return effectiveStateConditions.some((c) => {
            const valueParam = isComparisonConditionOperator(c.operator) ? c.value.value : c.value.from;
            const toParam = isRangeConditionOperator(c.operator) ? c.value.to : undefined;
            return intervalIncludesZero(c.operator, valueParam, toParam);
        });
    }, [displayTreatNullAsZeroOption, state.conditions, enableMultipleConditions]);

    const isAddConditionDisabled = useMemo(() => {
        const first = state.conditions[0];
        if (!first) {
            return true;
        }
        return first.operator === "ALL";
    }, [state.conditions]);

    const handleAddCondition = useCallback(() => {
        if (!enableMultipleConditions) {
            return;
        }
        if (isAddConditionDisabled) {
            return;
        }
        setState((prev) => {
            const first = prev.conditions[0];
            if (!first || first.operator === "ALL") {
                return prev;
            }
            return {
                ...prev,
                conditions: [...prev.conditions, { operator: first.operator, value: {}, showError: {} }],
            };
        });
    }, [isAddConditionDisabled, enableMultipleConditions]);

    const handleRemoveCondition = useCallback((index: number) => {
        setState((prev) => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index),
        }));
    }, []);

    const handleApplyOnResultChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setApplyOnResult(event.target.checked);
        },
        [setApplyOnResult],
    );

    return (
        <div
            className="gd-mvf-dropdown-body gd-dialog gd-dropdown overlay s-mvf-dropdown-body"
            data-testid="mvf-dropdown-body"
        >
            <div className="gd-mvf-dropdown-content">
                {warningMessage ? (
                    <div className="gd-mvf-dropdown-section">
                        <WarningMessageComponent warningMessage={warningMessage} />
                    </div>
                ) : null}
                <div className="gd-mvf-conditions-scroll-container">
                    {(enableMultipleConditions ? state.conditions : state.conditions.slice(0, 1)).map(
                        (c, idx) => (
                            <div
                                key={idx}
                                className={cx("gd-mvf-dropdown-section", "gd-mvf-condition-section", {
                                    "gd-mvf-condition-section--multi": enableMultipleConditions,
                                })}
                            >
                                <div className="gd-mvf-condition-header" data-testid={`mvf-condition-${idx}`}>
                                    <div className="gd-mvf-condition-operator">
                                        <OperatorDropdown
                                            onSelect={(op) => handleOperatorSelection(idx, op)}
                                            operator={c.operator}
                                            isDisabled={!enableOperatorSelection}
                                            isAllOperatorDisabled={isAllOperatorDisabled}
                                        />
                                    </div>

                                    {enableMultipleConditions ? (
                                        <div className="gd-mvf-condition-action">
                                            {idx === 0 ? (
                                                <BubbleHoverTrigger>
                                                    <UiIconButton
                                                        icon="plus"
                                                        size="small"
                                                        variant="tertiary"
                                                        isDisabled={isAddConditionDisabled}
                                                        onClick={handleAddCondition}
                                                        dataTestId="mvf-add-condition"
                                                        label={addConditionTooltip}
                                                    />
                                                    <Bubble alignPoints={ALIGN_POINTS}>
                                                        {isAddConditionDisabled
                                                            ? addConditionDisabledTooltip
                                                            : addConditionTooltip}
                                                    </Bubble>
                                                </BubbleHoverTrigger>
                                            ) : (
                                                <BubbleHoverTrigger>
                                                    <UiIconButton
                                                        icon="cross"
                                                        size="small"
                                                        variant="tertiary"
                                                        isDesctructive
                                                        onClick={() => handleRemoveCondition(idx)}
                                                        dataTestId={`mvf-remove-condition-${idx}`}
                                                        label={removeConditionTooltip}
                                                    />
                                                    <Bubble alignPoints={ALIGN_POINTS}>
                                                        {removeConditionTooltip}
                                                    </Bubble>
                                                </BubbleHoverTrigger>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {c.operator === "ALL" ? null : (
                                    <div className="gd-mvf-condition-inputs">
                                        <ConditionInputSection
                                            index={idx}
                                            condition={c}
                                            usePercentage={props.usePercentage ?? false}
                                            baseDisableAutofocus={props.disableAutofocus}
                                            separators={props.separators}
                                            onValueChange={handleValueChange}
                                            onFromChange={handleFromChange}
                                            onToChange={handleToChange}
                                            onValueBlur={handleValueBlur}
                                            onFromBlur={handleFromBlur}
                                            onToBlur={handleToBlur}
                                            onApply={onApply}
                                        />
                                        {idx ===
                                            (enableMultipleConditions ? state.conditions.length - 1 : 0) &&
                                        shouldShowTreatNullAsZeroCheckbox ? (
                                            <TreatNullValuesAsZeroCheckbox
                                                onChange={handleTreatNullAsZeroClicked}
                                                checked={enabledTreatNullValuesAsZero}
                                                intl={intl}
                                            />
                                        ) : null}
                                        {idx ===
                                            (enableMultipleConditions ? state.conditions.length - 1 : 0) &&
                                        enableRankingWithMvf ? (
                                            <label
                                                className="input-checkbox-label gd-mvf-apply-on-result-checkbox"
                                                data-testid="mvf-apply-on-result"
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="apply-on-result"
                                                    className="input-checkbox"
                                                    checked={applyOnResult}
                                                    onChange={handleApplyOnResultChange}
                                                />
                                                <span className="input-label-text">
                                                    {intl.formatMessage({
                                                        id: "mvf.applyOnResultLabel",
                                                    })}
                                                </span>
                                            </label>
                                        ) : null}
                                    </div>
                                )}

                                {enableMultipleConditions && idx < state.conditions.length - 1 ? (
                                    <div className="gd-mvf-conditions-joiner">{conditionsJoinerOr}</div>
                                ) : null}
                            </div>
                        ),
                    )}
                    {isDimensionalityEnabled ? (
                        <DimensionalitySection
                            dimensionality={dimensionality}
                            insightDimensionality={insightDimensionality}
                            catalogDimensionality={catalogDimensionality}
                            isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
                            onDimensionalityChange={handleDimensionalityChange}
                            isMigratedFilter={isMigratedFilter}
                        />
                    ) : null}
                </div>

                {isDimensionalityEnabled ? (
                    <PreviewSection
                        measureTitle={props.measureTitle}
                        usePercentage={props.usePercentage}
                        separators={separators}
                        format={props.format}
                        useShortFormat={props.useShortFormat}
                        dimensionality={dimensionality}
                        showAllPreview={enableMultipleConditions}
                        conditions={state.conditions.map(({ operator, value }) => ({ operator, value }))}
                    />
                ) : null}
            </div>
            <div className="gd-mvf-dropdown-footer">
                <Button
                    className="gd-button-secondary gd-button-small s-mvf-dropdown-cancel"
                    onClick={onCancel}
                    value={intl.formatMessage({ id: "cancel" })}
                />
                <UiTooltip
                    content={getApplyButtonTooltip()}
                    triggerBy={["hover"]}
                    disabled={!isApplyButtonDisabled()}
                    arrowPlacement="left"
                    optimalPlacement
                    anchor={
                        <Button
                            className="gd-button-action gd-button-small s-mvf-dropdown-apply"
                            onClick={onApply}
                            value={intl.formatMessage({ id: "apply" })}
                            disabled={isApplyButtonDisabled()}
                        />
                    }
                />
            </div>
        </div>
    );
});

export const DropdownBody = memo(function DropdownBody(props: IDropdownBodyProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <DropdownBodyWithIntl {...props} />
        </IntlWrapper>
    );
});
