// (C) 2019-2025 GoodData Corporation

import { type ReactNode, memo, useCallback, useMemo, useState } from "react";

import { type IntlShape, useIntl } from "react-intl";

import {
    type ObjRefInScope,
    isComparisonConditionOperator,
    isRangeConditionOperator,
} from "@gooddata/sdk-model";
import { type ISeparators, IntlWrapper } from "@gooddata/sdk-ui";
import { Button } from "@gooddata/sdk-ui-kit";

import { ComparisonInput } from "./ComparisonInput.js";
import { DimensionalitySection, areDimensionalitySetsEqual } from "./DimensionalitySection.js";
import { intervalIncludesZero } from "./helpers/intervalIncludesZero.js";
import { getOperatorWithValueTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { OperatorDropdown } from "./OperatorDropdown.js";
import { RangeInput } from "./RangeInput.js";
import { TreatNullValuesAsZeroCheckbox } from "./TreatNullValuesAsZeroCheckbox.js";
import { type IMeasureValueFilterValue, type MeasureValueFilterOperator } from "./types.js";
import { type IDimensionalityItem, type WarningMessage } from "./typings.js";
import { WarningMessageComponent } from "./WarningMessage.js";

interface IDropdownBodyProps {
    operator: MeasureValueFilterOperator;
    value: IMeasureValueFilterValue;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    disableAutofocus?: boolean;
    onCancel?: () => void;
    measureTitle?: string;
    onApply: (
        operator: MeasureValueFilterOperator | null,
        value: IMeasureValueFilterValue,
        treatNullValuesAsZero: boolean,
        dimensionality?: ObjRefInScope[],
    ) => void;
    separators?: ISeparators;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroValue?: boolean;
    valuePrecision?: number;
    enableOperatorSelection?: boolean;
    dimensionality?: IDimensionalityItem[];
    insightDimensionality?: IDimensionalityItem[];
    isDimensionalityEnabled?: boolean;
}

interface IDropdownBodyState {
    operator: MeasureValueFilterOperator;
    value: IMeasureValueFilterValue;
    enabledTreatNullValuesAsZero: boolean | undefined;
    dimensionality: IDimensionalityItem[];
}

const getConditionLabel = (
    operator: MeasureValueFilterOperator,
    value: NumberForPreview,
    from: NumberForPreview,
    to: NumberForPreview,
    separators: ISeparators,
    suffix: string,
    intl: IntlShape,
): string | undefined => {
    if (isComparisonConditionOperator(operator)) {
        const formattedValue = formatNumberForPreview(value, separators, suffix);
        return formattedValue == undefined
            ? undefined
            : intl.formatMessage(
                  { id: getOperatorWithValueTranslationKey(operator) },
                  { value: formattedValue },
              );
    }
    if (isRangeConditionOperator(operator)) {
        const formattedFrom = formatNumberForPreview(from, separators, suffix);
        const formattedTo = formatNumberForPreview(to, separators, suffix);
        return formattedFrom === undefined || formattedTo === undefined
            ? undefined
            : intl.formatMessage(
                  { id: getOperatorWithValueTranslationKey(operator) },
                  {
                      from: formattedFrom,
                      to: formattedTo,
                  },
              );
    }
    return undefined;
};

const DefaultValuePrecision = 6;

const DEFAULT_SEPARATORS: ISeparators = {
    thousand: ",",
    decimal: ".",
};

type NumberForPreview = number | null | undefined;

const formatNumberForPreview = (
    value: NumberForPreview,
    separators: ISeparators,
    suffix: string,
): string | undefined => {
    if (value === null || value === undefined || isNaN(value)) {
        return undefined;
    }
    const [aboveDecimal, belowDecimal] = value.toString().split(".");
    const aboveDecimalFormatted = aboveDecimal.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${separators.thousand}`);
    const formattedNumber = belowDecimal
        ? `${aboveDecimalFormatted}${separators.decimal}${belowDecimal}`
        : aboveDecimalFormatted;
    return `${formattedNumber}${suffix}`;
};

const concatDimensionalityTitles = (items: IDimensionalityItem[]): string | undefined => {
    const titles = items.map((item) => item.title).filter(Boolean);
    if (titles.length === 0) {
        return undefined;
    }
    if (titles.length === 1) {
        return titles[0];
    }
    if (titles.length === 2) {
        return `${titles[0]} & ${titles[1]}`;
    }
    return `${titles.slice(0, -1).join(", ")} & ${titles[titles.length - 1]}`;
};

export const DropdownBodyWithIntl = memo(function DropdownBodyWithIntl(props: IDropdownBodyProps) {
    const intl = useIntl();

    const {
        operator: propsOperator,
        value,
        usePercentage,
        treatNullAsZeroValue,
        valuePrecision = DefaultValuePrecision,
        isDimensionalityEnabled = false,
        insightDimensionality,
        separators = DEFAULT_SEPARATORS,
    } = props;

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

            return isComparisonConditionOperator(operator)
                ? { value: trimToPrecision(fromDecimalToPercent(value.value)) }
                : {
                      from: trimToPrecision(fromDecimalToPercent(value.from)),
                      to: trimToPrecision(fromDecimalToPercent(value.to)),
                  };
        },
        [trimToPrecision, fromDecimalToPercent],
    );

    const [state, setState] = useState<IDropdownBodyState>(() => {
        // If the filter has dimensionality, use it; otherwise fall back to insight dimensionality (bucket defaults)
        const initialDimensionality =
            (props.dimensionality?.length ?? 0) > 0 ? props.dimensionality : (insightDimensionality ?? []);

        return {
            operator: propsOperator || "ALL",
            value: (usePercentage ? convertToPercentageValue(value, propsOperator) : value) || {},
            enabledTreatNullValuesAsZero: treatNullAsZeroValue,
            dimensionality: initialDimensionality ?? [],
        };
    });

    const convertToRawValue = useCallback(
        (value: IMeasureValueFilterValue, operator: string): IMeasureValueFilterValue => {
            if (!value) {
                return value;
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

    const isDimensionalityChanged = useCallback(
        () => !areDimensionalitySetsEqual(props.dimensionality, state.dimensionality),
        [props.dimensionality, state.dimensionality],
    );

    const isChanged = useCallback(
        () =>
            state.operator !== props.operator ||
            state.enabledTreatNullValuesAsZero !== props.treatNullAsZeroValue ||
            isDimensionalityChanged(),
        [
            state.operator,
            state.enabledTreatNullValuesAsZero,
            props.operator,
            props.treatNullAsZeroValue,
            isDimensionalityChanged,
        ],
    );

    const isApplyButtonDisabledForComparison = useCallback(() => {
        const { value: stateValue = null } = state.value;

        if (stateValue === null || Number.isNaN(stateValue)) {
            return true;
        }

        if (props.value === null || isChanged()) {
            return false;
        }

        if (props.usePercentage) {
            return trimToPrecision(fromPercentToDecimal(stateValue)) === props.value.value;
        }

        return stateValue === props.value.value;
    }, [state.value, props.value, props.usePercentage, isChanged, trimToPrecision, fromPercentToDecimal]);

    const isApplyButtonDisabledForRange = useCallback(() => {
        const { from = null, to = null } = state.value;

        if (from === null || to === null || Number.isNaN(from) || Number.isNaN(to)) {
            return true;
        }

        if (props.value === null || isChanged()) {
            return false;
        }

        if (props.usePercentage) {
            return (
                trimToPrecision(fromPercentToDecimal(from)) === props.value.from &&
                trimToPrecision(fromPercentToDecimal(to)) === props.value.to
            );
        }

        return from === props.value.from && to === props.value.to;
    }, [state.value, props.value, props.usePercentage, isChanged, trimToPrecision, fromPercentToDecimal]);

    const isApplyButtonDisabledForAll = useCallback(() => {
        return propsOperator === "ALL";
    }, [propsOperator]);

    const isApplyButtonDisabled = useCallback(() => {
        const { operator } = state;

        if (isComparisonConditionOperator(operator)) {
            return isApplyButtonDisabledForComparison();
        }

        if (isRangeConditionOperator(operator)) {
            return isApplyButtonDisabledForRange();
        }

        return isApplyButtonDisabledForAll();
    }, [
        state,
        isApplyButtonDisabledForComparison,
        isApplyButtonDisabledForRange,
        isApplyButtonDisabledForAll,
    ]);

    const handleOperatorSelection = useCallback(
        (operator: MeasureValueFilterOperator) => setState((prev) => ({ ...prev, operator })),
        [],
    );

    const handleValueChange = useCallback((value: number) => {
        setState((prev) => ({ ...prev, value: { ...prev.value, value } }));
    }, []);

    const handleFromChange = useCallback((from: number) => {
        setState((prev) => ({ ...prev, value: { ...prev.value, from } }));
    }, []);

    const handleToChange = useCallback((to: number) => {
        setState((prev) => ({ ...prev, value: { ...prev.value, to } }));
    }, []);

    const handleTreatNullAsZeroClicked = useCallback((checked: boolean) => {
        setState((prev) => ({ ...prev, enabledTreatNullValuesAsZero: checked }));
    }, []);

    const handleDimensionalityChange = useCallback((dimensionality: IDimensionalityItem[]) => {
        setState((prev) => ({ ...prev, dimensionality }));
    }, []);

    const onApply = useCallback(() => {
        if (isApplyButtonDisabled()) {
            return;
        }

        const {
            enabledTreatNullValuesAsZero,
            operator: stateOperator,
            value: stateValue,
            dimensionality: stateDimensionality,
        } = state;
        const { usePercentage } = props;

        const finalOperator = stateOperator === "ALL" ? null : stateOperator;
        const finalValue = usePercentage ? convertToRawValue(stateValue, stateOperator) : stateValue;

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

        props.onApply(finalOperator, finalValue, enabledTreatNullValuesAsZero ?? false, finalDimensionality);
    }, [isApplyButtonDisabled, state, props, convertToRawValue, insightDimensionality]);

    const renderInputSection = useMemo(() => {
        if (isComparisonConditionOperator(state.operator)) {
            return (
                <ComparisonInput
                    value={state.value.value}
                    usePercentage={props.usePercentage ?? false}
                    onValueChange={handleValueChange}
                    onEnterKeyPress={onApply}
                    disableAutofocus={props.disableAutofocus}
                    separators={props.separators}
                />
            );
        } else if (isRangeConditionOperator(state.operator)) {
            return (
                <RangeInput
                    from={state.value.from}
                    to={state.value.to}
                    usePercentage={props.usePercentage ?? false}
                    onFromChange={handleFromChange}
                    onToChange={handleToChange}
                    onEnterKeyPress={onApply}
                    disableAutofocus={props.disableAutofocus}
                    separators={props.separators}
                />
            );
        }

        return null;
    }, [
        handleValueChange,
        handleFromChange,
        handleToChange,
        onApply,
        state.value,
        state.operator,
        props.usePercentage,
        props.disableAutofocus,
        props.separators,
    ]);

    const { onCancel, warningMessage, displayTreatNullAsZeroOption, enableOperatorSelection } = props;
    const { operator, enabledTreatNullValuesAsZero, dimensionality } = state;

    const textPreview = useMemo(() => {
        if (operator === "ALL") {
            return null;
        }
        const suffix = props.usePercentage ? "%" : "";
        const condition = getConditionLabel(
            operator,
            state.value.value,
            state.value.from,
            state.value.to,
            separators,
            suffix,
            intl,
        );
        if (!condition) {
            return null;
        }
        const measureTitle = props.measureTitle;
        if (!measureTitle) {
            return null;
        }
        const dimensionalityTitles = concatDimensionalityTitles(dimensionality);
        const placeholderValues = {
            metric: measureTitle,
            condition,
            dimensionality: dimensionalityTitles,
            b: (chunk: ReactNode) => <b>{chunk}</b>,
        };
        return dimensionality.length > 0 && dimensionalityTitles
            ? intl.formatMessage({ id: "mvf.preview.filterWithDimensionality" }, placeholderValues)
            : intl.formatMessage({ id: "mvf.preview.filterWithoutDimensionality" }, placeholderValues);
    }, [operator, dimensionality, separators, props.usePercentage, props.measureTitle, intl, state.value]);

    // Determine if the checkbox should be shown based on whether zero is in the filter interval
    const shouldShowTreatNullAsZeroCheckbox = useMemo(() => {
        if (!displayTreatNullAsZeroOption || operator === "ALL") {
            return false;
        }

        // For comparison operators, use state.value.value
        // For range operators, use state.value.from and state.value.to
        const valueParam = isComparisonConditionOperator(operator) ? state.value.value : state.value.from;
        const toParam = isRangeConditionOperator(operator) ? state.value.to : undefined;

        return intervalIncludesZero(operator, valueParam, toParam);
    }, [displayTreatNullAsZeroOption, operator, state.value]);

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

                <div className="gd-mvf-dropdown-section" data-testid="mvf-operator-section">
                    <OperatorDropdown
                        onSelect={handleOperatorSelection}
                        operator={operator}
                        isDisabled={!enableOperatorSelection}
                    />
                </div>

                {operator === "ALL" ? null : (
                    <div className="gd-mvf-dropdown-section">
                        {renderInputSection}{" "}
                        {shouldShowTreatNullAsZeroCheckbox ? (
                            <TreatNullValuesAsZeroCheckbox
                                onChange={handleTreatNullAsZeroClicked}
                                checked={enabledTreatNullValuesAsZero}
                                intl={intl}
                            />
                        ) : null}
                    </div>
                )}

                {isDimensionalityEnabled ? (
                    <>
                        <DimensionalitySection
                            dimensionality={dimensionality}
                            insightDimensionality={insightDimensionality}
                            onDimensionalityChange={handleDimensionalityChange}
                        />
                        {textPreview ? (
                            <div className="gd-mvf-preview">
                                <div className="gd-mvf-preview-content" data-testid="mvf-preview-text">
                                    {textPreview}
                                </div>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>
            <div className="gd-mvf-dropdown-footer">
                <Button
                    className="gd-button-secondary gd-button-small s-mvf-dropdown-cancel"
                    onClick={onCancel}
                    value={intl.formatMessage({ id: "cancel" })}
                />
                <Button
                    className="gd-button-action gd-button-small s-mvf-dropdown-apply"
                    onClick={onApply}
                    value={intl.formatMessage({ id: "apply" })}
                    disabled={isApplyButtonDisabled()}
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
