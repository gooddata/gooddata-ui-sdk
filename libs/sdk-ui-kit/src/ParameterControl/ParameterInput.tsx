// (C) 2026 GoodData Corporation

import { type MouseEvent, useRef } from "react";

import { bem } from "../@ui/@utils/bem.js";
import { UiIcon } from "../@ui/UiIcon/UiIcon.js";

const { b, e } = bem("gd-ui-kit-parameter-input");

/**
 * @internal
 */
export interface IParameterInputProps {
    type: "text" | "number";
    id: string;
    value: string;
    hasError: boolean;
    errorMessageId?: string;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    dataTestId?: string;
    incrementAriaLabel?: string;
    decrementAriaLabel?: string;
}

/**
 * @internal
 */
export function ParameterInput({
    type,
    id,
    value,
    hasError,
    errorMessageId,
    onChange,
    min,
    max,
    dataTestId,
    incrementAriaLabel,
    decrementAriaLabel,
}: IParameterInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isNumber = type === "number";
    const numericValue = value.trim() === "" ? Number.NaN : Number(value);
    const isIncrementDisabled =
        isNumber && max !== undefined && Number.isFinite(numericValue) && numericValue >= max;
    const isDecrementDisabled =
        isNumber && min !== undefined && Number.isFinite(numericValue) && numericValue <= min;

    function handleStep(direction: "up" | "down") {
        const input = inputRef.current;
        if (!input) {
            return;
        }
        if (direction === "up") {
            input.stepUp();
        } else {
            input.stepDown();
        }
        onChange(input.value);
        input.focus();
    }

    function preventButtonFocus(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
    }

    return (
        <div className={b({ hasError })}>
            <input
                ref={inputRef}
                id={id}
                type={type}
                min={isNumber ? min : undefined}
                max={isNumber ? max : undefined}
                className={e("field", { number: isNumber })}
                data-testid={dataTestId}
                value={value}
                aria-invalid={hasError || undefined}
                aria-errormessage={errorMessageId}
                aria-describedby={errorMessageId}
                onChange={(event) => onChange(event.target.value)}
            />
            {isNumber ? (
                <div className={e("stepper")}>
                    <button
                        type="button"
                        className={e("stepper-button")}
                        data-testid={dataTestId ? `${dataTestId}-stepper-up` : undefined}
                        aria-label={incrementAriaLabel}
                        aria-controls={id}
                        tabIndex={-1}
                        disabled={isIncrementDisabled}
                        onMouseDown={preventButtonFocus}
                        onClick={() => handleStep("up")}
                    >
                        <UiIcon type="navigateUp" size={12} color="currentColor" />
                    </button>
                    <button
                        type="button"
                        className={e("stepper-button")}
                        data-testid={dataTestId ? `${dataTestId}-stepper-down` : undefined}
                        aria-label={decrementAriaLabel}
                        aria-controls={id}
                        tabIndex={-1}
                        disabled={isDecrementDisabled}
                        onMouseDown={preventButtonFocus}
                        onClick={() => handleStep("down")}
                    >
                        <UiIcon type="navigateDown" size={12} color="currentColor" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
