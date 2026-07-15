// (C) 2019-2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import {
    type ISeparators,
    isComparisonConditionOperator,
    isRangeConditionOperator,
} from "@gooddata/sdk-model";

import { ComparisonInput } from "./ComparisonInput.js";
import { RangeInput } from "./RangeInput.js";
import { type IMeasureValueFilterValue, type MeasureValueFilterOperator } from "./types.js";

export interface IConditionInputSectionProps {
    index: number;
    /**
     * 1-based condition position, passed to the value inputs to disambiguate their accessible
     * names when a filter has multiple conditions (WCAG 2.4.6). Undefined for a single condition.
     */
    conditionNumber?: number;
    condition:
        | {
              operator: MeasureValueFilterOperator;
              value: IMeasureValueFilterValue;
              showError: {
                  value?: boolean;
                  from?: boolean;
                  to?: boolean;
              };
          }
        | undefined;
    usePercentage: boolean;
    separators?: ISeparators;
    onValueChange: (index: number, value: number | null) => void;
    onFromChange: (index: number, from: number | null) => void;
    onToChange: (index: number, to: number | null) => void;
    onValueBlur: (index: number) => void;
    onFromBlur: (index: number) => void;
    onToBlur: (index: number) => void;
    onApply: () => void;
}

export const ConditionInputSection = memo(function ConditionInputSection(props: IConditionInputSectionProps) {
    const intl = useIntl();

    const {
        index,
        conditionNumber,
        condition,
        usePercentage,
        separators,
        onValueChange,
        onFromChange,
        onToChange,
        onValueBlur,
        onFromBlur,
        onToBlur,
        onApply,
    } = props;

    if (!condition || condition.operator === "ALL") {
        return null;
    }

    // Never autofocus the value inputs. Initial focus must stay on the operator dropdown button.
    const disableAutofocus = true;

    const errorId = `mvf-validation-error-${index}`;

    if (isComparisonConditionOperator(condition.operator)) {
        const v = condition.value.value;
        const isMissing = v === null || v === undefined || Number.isNaN(v);
        const shouldShowError = !!condition.showError.value && isMissing;

        const validationErrorText = shouldShowError
            ? intl.formatMessage({
                  id: "mvf.validation.valueCannotBeEmpty",
                  defaultMessage: "Error: value can not be empty",
              })
            : undefined;

        return (
            <>
                <ComparisonInput
                    value={condition.value.value}
                    usePercentage={usePercentage}
                    onValueChange={(v) => onValueChange(index, v)}
                    onEnterKeyPress={onApply}
                    onBlur={() => onValueBlur(index)}
                    hasError={shouldShowError}
                    ariaDescribedBy={shouldShowError ? errorId : undefined}
                    disableAutofocus={disableAutofocus}
                    separators={separators}
                    conditionNumber={conditionNumber}
                />
                {shouldShowError ? (
                    <div id={errorId} className="gd-mvf-input-error s-mvf-input-error" data-testid={errorId}>
                        {validationErrorText}
                    </div>
                ) : null}
            </>
        );
    }

    if (isRangeConditionOperator(condition.operator)) {
        const { from = null, to = null } = condition.value;

        const isMissingFrom = from === null || from === undefined || Number.isNaN(from);
        const isMissingTo = to === null || to === undefined || Number.isNaN(to);

        const emptyValueMessage = intl.formatMessage({
            id: "mvf.validation.valueCannotBeEmpty",
            defaultMessage: "Error: value can not be empty",
        });

        const fromHasError = !!condition.showError.from && isMissingFrom;
        const toHasError = !!condition.showError.to && isMissingTo;

        const fromErrorText = fromHasError ? emptyValueMessage : undefined;
        const toErrorText = toHasError ? emptyValueMessage : undefined;

        return (
            <RangeInput
                from={condition.value.from}
                to={condition.value.to}
                usePercentage={usePercentage}
                onFromChange={(v) => onFromChange(index, v)}
                onToChange={(v) => onToChange(index, v)}
                onEnterKeyPress={onApply}
                onFromBlur={() => onFromBlur(index)}
                onToBlur={() => onToBlur(index)}
                fromField={{
                    errorText: fromErrorText,
                }}
                toField={{
                    errorText: toErrorText,
                }}
                disableAutofocus={disableAutofocus}
                separators={separators}
                conditionNumber={conditionNumber}
            />
        );
    }

    return null;
});
